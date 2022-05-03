import { createActionThunk } from 'vizzuality-redux-tools';
import fetch from 'lib/fetch';

// Register request
export const requestNewPassword = createActionThunk(
  'REQUEST_PASSWORD',
  (values = {}) => fetch({
    url: '/v1/auth/recover',
    method: 'post',
    data: values
  })
);

export const resetPassword = createActionThunk(
  'RESET_PASSWORD',
  (values = {}, { getState }) => fetch({
    url: `/v1/auth/recover/${getState().routes.query.token}`,
    method: 'post',
    data: values,
  })
);
