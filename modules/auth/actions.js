import axios from 'axios';
import { createAction, createActionThunk } from 'vizzuality-redux-tools';

// Logout
export const logout = createAction('LOGOUT_USER');

export const signInRequest = createActionThunk('SIGN_IN', (values = {}) => axios({
  url: '/signin',
  method: 'post',
  headers: { 'Content-type': 'application/json' },
  data: values
}));

// User helpers
export const authFromSession = createAction('AUTH_FROM_SESSION');

export const reloadToken = createAction('RELOAD_TOKEN');
