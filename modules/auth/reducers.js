import * as actions from './actions';
import initialState from './initial-state';

export default {
  // LOGIN
  SIGN_IN_STARTED: state => ({ ...state, loading: true }),
  SIGN_IN_ENDED: state => ({ ...state, loading: false }),
  SIGN_IN_SUCCEEDED: (state, { payload }) => ({
    ...state,
    authenticated: true,
    errors: null,
    status: 'success',
    token: payload.data.token,
    refreshToken: payload.data.refreshToken
  }),
  SIGN_IN_FAILED: (state, { payload }) => {
    const authType = payload?.response?.data?.authType;
    const statusMessage = payload?.response?.data?.message;
    let errorTitle = 'You have entered an invalid username or password.';
    if (statusMessage !== 'Unauthorized' || authType === 'withToken') {
      errorTitle = statusMessage;
    }
    return ({
      ...state,
      authenticated: false,
      errors: [{ title: errorTitle }],
      status: 'error',
    });
  },
  // LOGOUT
  [/** @type {any} */(actions.logout)]: () => ({ ...initialState }),
  // AUTH FRON SESSION (Server rendering)
  [/** @type {any} */(actions.authFromSession)]: (state, { payload }) => ({
    ...state,
    authenticated: true,
    token: payload.token,
    refreshToken: payload.refreshToken,
    status: 'success',
  }),
  [/** @type {any} */(actions.reloadToken)]: (state, { payload }) => ({
    ...state,
    token: payload,
  }),
};
