import React from 'react';
import PropTypes from 'prop-types';
import { getDataFromTree } from 'react-apollo';
import Head from 'next/head';

import { GQL_PUBLIC_DEFAULT, GQL_GET_DATA_FILES } from 'utils/app-constants';
import initApollo from './initApollo';

const getTokenFromContext = (ctx = {}, store) => {
  const { req } = ctx;
  const storeToken = store ? store.getState().auth.token : undefined;
  if (storeToken) return storeToken;
  return req && req.user ? req.user.token : undefined;
};

const getRefreshTokenFromContext = (ctx = {}, store) => {
  const { req } = ctx;
  const refreshToken = req && req.user ? req.user.refreshToken : undefined;
  if (!refreshToken && store) return store.getState().auth.refreshToken;
  return refreshToken;
};

const getUserEmailFromContext = store => {
  return store.getState().user?.data?.email;
};

export default App =>
  class WithData extends React.Component {
    static displayName = `WithData(${App.displayName})`;

    static propTypes = {
      apolloState: PropTypes.object.isRequired,
      store: PropTypes.object,
      token: PropTypes.string
    };

    static defaultProps = { token: null, store: null };

    constructor(props) {
      super(props);
      const { apolloState, store } = props;

      // `getDataFromTree` renders the component first, the client is passed off as a property.
      // After that rendering is done using Next's norlomal rendering pipeline
      const getToken = () => getTokenFromContext(undefined, store);
      const getRefreshToken = () =>
        getRefreshTokenFromContext(undefined, store);
      const getEmailFromContext = () => getUserEmailFromContext(store);

      this.apolloClient = initApollo(apolloState, {
        getToken,
        getRefreshToken,
        getEmailFromContext,
        store
      });

      // initialize other apollo clients at client side
      if (process.browser) {
        initApollo(
          {},
          { getToken, getRefreshToken, getEmailFromContext, store },
          GQL_GET_DATA_FILES
        );
        initApollo({}, {}, GQL_PUBLIC_DEFAULT);
      }
    }

    static async getInitialProps(ctx) {
      const {
        Component,
        router,
        ctx: { res, req, store }
      } = ctx;
      const getToken = () => getTokenFromContext({ req, store });
      const getRefreshToken = () =>
        getRefreshTokenFromContext(undefined, store);
      const getEmailFromContext = () => getUserEmailFromContext(store);
      const apollo = initApollo(
        {},
        { getToken, getRefreshToken, getEmailFromContext, store }
      );

      // initialize other apollo clients at client side
      if (process.browser) {
        initApollo(
          {},
          { getToken, getRefreshToken, getEmailFromContext, store },
          GQL_GET_DATA_FILES
        );
        initApollo({}, {}, GQL_PUBLIC_DEFAULT);
      }

      ctx.ctx.apolloClient = apollo;

      let appProps = {};

      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx);
      }

      if (res && res.finished) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        return {};
      }

      if (!process.browser) {
        // Run all graphql queries in the component tree
        // and extract the resulting data
        try {
          // Run all GraphQL queries

          await getDataFromTree(
            <App
              {...appProps}
              Component={Component}
              router={router}
              apolloClient={apollo}
              store={store}
            />
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
          console.error('Error while running `getDataFromTree`', error);
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo's store
      const apolloState = apollo.cache.extract();

      return { ...appProps, apolloState };
    }

    render() {
      return <App {...this.props} apolloClient={this.apolloClient} />;
    }
  };
