import { Container } from 'next/app';
import React, { Fragment, useEffect } from 'react';
import axios from 'axios';
import { Provider } from 'react-redux';
import Router from 'next/router';
import withRedux from 'next-redux-wrapper';
import { ApolloProvider, compose } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';

import withApollo from 'lib/withApollo';
import initStore from 'lib/store';
import routes from 'lib/routes';
import { initGA, logPageView } from 'utils/analytics';

import { authFromSession, reloadToken } from 'modules/auth/actions';
import { setRoutes } from 'modules/routes/actions';
import {
  userFetchRequest,
  userPermissionsFetchRequest
} from 'modules/user/actions';

import Notifications from 'components/notifications';
import WelcomeNotification from 'components/welcome-notification';

import 'css/index.scss';
import { isAdminUser, isWhitelistedUser } from 'modules/user/helpers';
import { logout } from 'utils/functions';

let tmpStore;

axios.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      error.response.config.url !== '/signin' &&
      !error.response.config?.url?.includes('/v1/auth/me') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const storeState = tmpStore.getState();
      const refToken = storeState.auth?.refreshToken;
      const data = {
        email: storeState.user?.data?.email,
        refreshToken: refToken
      };
      const headers = {
        Authorization: `Bearer ${refToken}`
      };
      if (!originalRequest.url.includes('auth/access-token')) {
        return axios
          .post(`${process.env.BACKEND_API_URL}/v1/auth/access-token`, data, {
            headers
          })
          .then(res => {
            tmpStore.dispatch(reloadToken(res.data.token));
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return axios(originalRequest);
          })
          .catch(() => {
            console.log(
              'Axios  call unAuthorized with 401 status => logout user with data ',
              data
            );
            return logout();
          });
      }
      logout();
    }
    return Promise.reject(error);
  }
);

const publicRoutes = [
  routes.findByName('home'),
  routes.findByName('terms'),
  routes.findByName('privacy'),
  routes.findByName('confirmed'),
  routes.findByName('signin'),
  routes.findByName('saml_authentication'),
  routes.findByName('signup'),
  routes.findByName('resetpassword'),
  routes.findByName('public_initiatives_show'),
  routes.findByName('discover'),
  routes.findByName('discover_project'),
  routes.findByName('public_project_show')
];

// Routes both general users and admins can access
const authenticatedRoutes = [routes.findByName('profile')];

const adminRoutes = [routes.findByName('account_validation')];

/**
 * Return whether the next route belongs to the list
 * @param {Array<any>} routeList List of routes
 * @param {any} query Query params of the current route
 * @param {string} pathname Path of the next route
 */
const doesRouteBelongToList = (routeList, query, pathname) => {
  return routeList.some(route => {
    try {
      // If the route expects some parameters that aren't present in query, it will throw an error
      // It also means this route is not the current one
      let routePathname = route.getAs(query);
      if (routePathname.substr(-1) === '=') {
        routePathname = routePathname.substr(0, routePathname.length - 1);
      }

      return routePathname === pathname;
    } catch {
      return false;
    }
  });
};

const WIApp = ({ Component, pageProps, store, apolloClient }) => {
  tmpStore = store;
  useEffect(() => {
    // @ts-ignore
    if (!window.GA_INITIALIZED) {
      initGA();
      // @ts-ignore
      window.GA_INITIALIZED = true;
    }

    logPageView();

    Router.onRouteChangeComplete = () => logPageView();
  }, []);

  return (
    <Container>
      <ApolloProvider client={apolloClient}>
        <ApolloHooksProvider client={apolloClient}>
          <Provider store={store}>
            <Fragment>
              <Notifications />
              <WelcomeNotification />
              <Component {...pageProps} />
            </Fragment>
          </Provider>
        </ApolloHooksProvider>
      </ApolloProvider>
    </Container>
  );
};

WIApp.getInitialProps = async ({ Component, router, ctx }) => {
  const { asPath } = router;
  const { req, res, store, query, isServer } = ctx;

  const state = store.getState();

  const pathname = req ? asPath : ctx.asPath;
  const isPublicPath = doesRouteBelongToList(publicRoutes, query, pathname);
  const isAuthenticatedPath = doesRouteBelongToList(
    authenticatedRoutes,
    query,
    pathname
  );
  const isAdminPath = doesRouteBelongToList(adminRoutes, query, pathname);
  const signInPath = routes.findByName('signin').getAs({
    to: encodeURIComponent(isServer ? req.originalUrl : pathname)
  });

  const redirectTo = path => {
    if (isServer) {
      return res.redirect(path);
    }

    router.push(path);
    return {};
  };
  const isUserDataLoaded = !!state.user.data;
  let isUserAuthenticated = isServer ? !!req?.user : !!state.auth.authenticated;
  // We save the user's token
  if (isServer && isUserAuthenticated) {
    const newToken = req?.cookies?.token
      ? req.user?.token !== req?.cookies?.token
      : false;
    store.dispatch(
      authFromSession({
        refreshToken: req.user?.refreshToken,
        token: req.cookies?.token || req.user?.token
      })
    );
    if (newToken) {
      res.setHeader('Set-Cookie', ['token=deleted; Max-Age=0']);
    }
  }

  let user = null;
  if (isUserAuthenticated) {
    if (isUserDataLoaded) {
      ({ user } = state);
    } else {
      try {
        user = await store.dispatch(userFetchRequest(req.user));
      } catch (e) {
        isUserAuthenticated = false;
      }
    }
  }

  const isUserAdmin = isAdminUser(user);
  const isUserWhitelisted = isWhitelistedUser(user);

  // We save the route in Redux
  if (pathname) {
    store.dispatch(setRoutes({ pathname, query }));
  }

  // We fetch the user's permissions to access the entities, only if they are not an admin, as they
  // don't have access to the entities
  if (isUserAuthenticated && !isUserAdmin && !isUserDataLoaded) {
    await store.dispatch(userPermissionsFetchRequest(store));
  }

  // Below is a simple table of which users have access to which pages:
  //                           | Public routes | Authenticated routes | Admin routes | Other routes
  // --------------------------+---------------+----------------------+--------------+ ------------
  // Non authenticated users   | Yes           | No                   | No           | No
  // Authenticated users       | Yes           | Yes                  | No           | Yes
  // Authenticated admin       | Yes           | Yes                  | Yes          | No

  const homepagePath = routes.findByName('home').getAs();
  const explorepagePath = routes.findByName('discover').getAs();

  const proceedToPage = async () => {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    return { pageProps };
  };

  // Non authenticated users
  if (!isUserAuthenticated) {
    if (isPublicPath) {
      return proceedToPage();
    }

    return redirectTo(signInPath);
  }

  // Authenticated users but not whitelisted
  if (isUserAuthenticated && !isUserWhitelisted) {
    if (isPublicPath || isAuthenticatedPath) {
      return proceedToPage();
    }
    return redirectTo(explorepagePath);
  }
  // Authenticated users
  if (isUserAuthenticated && !isUserAdmin) {
    if (!isAdminPath) {
      return proceedToPage();
    }
    return redirectTo(homepagePath);
  }

  // Authenticated admins
  if (isPublicPath || isAuthenticatedPath || isAdminPath) {
    return proceedToPage();
  }

  return redirectTo(homepagePath);
};

export default compose(
  withRedux(initStore),
  withApollo
)(WIApp);
