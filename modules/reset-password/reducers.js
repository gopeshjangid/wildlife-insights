export default {
  REQUEST_PASSWORD_STARTED: state => ({ ...state, loading: true }),
  REQUEST_PASSWORD_ENDED: state => ({ ...state, loading: false }),
  REQUEST_PASSWORD_SUCCEEDED: (state, { payload }) => ({
    ...state,
    data: payload.data,
    status: 'success',
  }),
  REQUEST_PASSWORD_FAILED: (state, { payload }) => {
    let errorTitle = 'User not found.';
    if (payload.response && payload.response.data && payload.response.data.errors) {
      errorTitle = payload.response.data.errors[0].status === 401 ? payload.response.data.errors[0].title : payload.response.data.errors[0].detail;
    }
    return ({
      ...state,
      errors: [{ title: errorTitle }],
      status: 'error'
    });
  },

  RESET_PASSWORD_STARTED: state => ({ ...state, loading: true }),
  RESET_PASSWORD_ENDED: state => ({ ...state, loading: false }),
  RESET_PASSWORD_SUCCEEDED: (state, { payload }) => ({
    ...state,
    data: payload.data,
    status: 'success',
  }),
  RESET_PASSWORD_FAILED: state => ({
    ...state,
    errors: [{ title: 'Token is not valid or has expired.' }],
    status: 'error',
  })
};
