import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import axios from 'axios';
import { fromPromise, ApolloLink } from 'apollo-link';
import { RetryLink } from 'apollo-link-retry';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import fetch from 'isomorphic-unfetch';
import { onError } from 'apollo-link-error';
import URI from 'urijs';

import {
  GQL_DEFAULT,
  GQL_PUBLIC_DEFAULT,
  GQL_GET_DATA_FILES,
  GQL_ENDPOINTS
} from 'utils/app-constants';
import { logout } from 'utils/functions';
import { reloadToken } from '../modules/auth/actions';

// Cache for the Apollo clients
const apolloClients = {};

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  },
  mutate: {
    errorPolicy: 'all'
  }
};

function create(initialState, options, endPoint) {
  const apiUrl = new URI(process.env.API_URL).pathname(`/backend/${endPoint}`);

  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      jitter: false
    },
    attempts: {
      max: 4
    }
  });

  const httpLink = createHttpLink({
    uri: apiUrl.href(),
    credentials: 'same-origin'
  });

  const getNewToken = async (data, headers, store) => {
    if (data?.email === '' && store) {
      const state = store.getState();
      data.email = state?.user?.email;
      data.refreshToken = state?.auth?.refreshToken;
    }

    return axios
      .post(`${process.env.BACKEND_API_URL}/v1/auth/access-token`, data, {
        headers
      })
      .then(response => {
        if (process.browser) {
          document.cookie = 'token=' + response.data.token;
        }
        store.dispatch(reloadToken(response.data.token));
        return response.data.token;
      })
      .catch(() => {
        if (data.email) {
          console.log(
            'GraphQl unAuthorized call => Invalid refresh token or email, request data : ',
            data
          );
        }
        logout();
      });
  };

  const logoutLink = onError(({ networkError, operation, forward }) => {
    let refToken = '';
    if (typeof options.getRefreshToken === 'function') {
      refToken = options?.getRefreshToken();
    }
    let email = '';

    if (typeof options.getEmailFromContext === 'function') {
      email = options?.getEmailFromContext();
    }

    if (networkError?.statusCode === 401) {
      const data = {
        email,
        refreshToken: refToken
      };
      const headers = {
        Authorization: `Bearer ${refToken}`
      };

      return fromPromise(
        getNewToken(data, headers, options.store).catch(() => {
          logout();
        })
      )
        .filter(value => Boolean(value))
        .flatMap(accessToken => {
          const oldHeaders = operation.getContext().headers;
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${accessToken}`
            }
          });
          return forward(operation);
        });
    }
  });

  const authLink = setContext((_, { headers }) => {
    const token =
      options?.store?.getState().auth.token ||
      (options.getToken ? options.getToken() : undefined) ||
      undefined;

    if (token) {
      return {
        headers: { ...headers, authorization: token ? `Bearer ${token}` : '' }
      };
    }

    return { headers: { ...headers } };
  });

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser,
    link: ApolloLink.from([retryLink, authLink, logoutLink.concat(httpLink)]),
    cache: new InMemoryCache().restore(initialState || {}),
    // @ts-ignore
    defaultOptions
  });
}

export default function initApollo(
  initialState = {},
  options = {},
  endPointKey
) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  endPointKey = GQL_ENDPOINTS[endPointKey] ? endPointKey : GQL_DEFAULT;

  const gqlEndPoint = GQL_ENDPOINTS[endPointKey];

  if (!process.browser) return create(initialState, options, gqlEndPoint);
  // Reuse client on the client-side
  if (!apolloClients[endPointKey]) {
    apolloClients[endPointKey] = create(initialState, options, gqlEndPoint);
  }

  return apolloClients[endPointKey];
}

export const getAuthApolloClient = endPointKey => {
  return apolloClients[endPointKey] || apolloClients[GQL_DEFAULT];
};

export const getPublicApolloClient = endPointKey => {
  return apolloClients[endPointKey] || apolloClients[GQL_PUBLIC_DEFAULT];
};

export const refetchGetDataFiles = () => {
  const getDataFilesClient = apolloClients[GQL_GET_DATA_FILES];
  if (getDataFilesClient) {
    getDataFilesClient.reFetchObservableQueries();
  }
};
