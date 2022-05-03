import { createActionThunk } from 'vizzuality-redux-tools';
import fetch from 'lib/fetch';

// Register request
export const signUpRequest = createActionThunk(
  'SIGN_UP',
  (values = {}) => fetch({
    url: '/v1/auth/sign-up',
    method: 'post',
    data: values
  })
);

export default { signUpRequest };
