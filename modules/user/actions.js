import { createActionThunk } from 'vizzuality-redux-tools';
import fetch from 'lib/fetch';
import initApollo from 'lib/initApollo';
import { GQL_DEFAULT } from 'utils/app-constants';
import { reloadToken, logout } from 'modules/auth/actions';
import getUserPermissionsQuery from './user-permissions.graphql';
import { parseUserPermissions } from './helpers';

const getAuthUserInfo = token => {
  return fetch({
    url: '/v1/auth/me',
    method: 'get',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};

// Profile request
export const userFetchRequest = createActionThunk(
  'USER_FETCH',
  (user, { getState, dispatch }) => {
    return getAuthUserInfo(getState().auth?.token)
      .then(res => res)
      .catch(async err => {
        if (err?.response?.status === 401) {
          try {
            const res = await fetch({
              url: `${process.env.BACKEND_API_URL}/v1/auth/access-token`,
              method: 'post',
              data: { email: user?.email, refreshToken: user?.refreshToken },
              headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${user?.refreshToken}`
              }
            });
            dispatch(reloadToken(res.data.token));
            return getAuthUserInfo(res.data.token);
          } catch (err) {
            console.log(
              '/v1/auth/me  call unAuthorized => logout user with data ',
              {
                email: user?.email,
                refreshToken: user?.refreshToken
              }
            );
            dispatch(logout());
            return Promise.reject('UnAuthorised');
          }
        } else {
          console.log('auth/me   call failed => logout user with data ');
          dispatch(logout());
          return Promise.reject('UnAuthorised');
        }
      });
  },
  false
);

// Profile: saving edition
export const userSaveRequest = createActionThunk(
  'USER_SAVE',
  (data, { getState }) =>
    fetch({
      url: '/v1/auth/me',
      method: 'patch',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${getState().auth.token}`
      },
      data
    })
);

export const userPermissionsFetchRequest = createActionThunk(
  'USER_PERMISSIONS_FETCH',
  ({ getState }, store) => {
    const client = initApollo(
      {},
      { getToken: () => getState().auth.token, store },
      GQL_DEFAULT
    );
    return client
      .query({ query: getUserPermissionsQuery })
      .then(res => parseUserPermissions(res.data.getParticipantData));
  }
);
