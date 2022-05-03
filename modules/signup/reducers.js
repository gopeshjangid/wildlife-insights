export default {
  SIGN_UP_STARTED: state => ({ ...state, loading: true }),
  SIGN_UP_ENDED: state => ({ ...state, loading: false }),
  SIGN_UP_SUCCEEDED: state => ({
    ...state,
    errors: null,
    status: 'success',
  }),
  SIGN_UP_FAILED: (state, { payload }) => ({
    ...state,
    errors: [{ title: payload.response.data }],
    status: 'error',
  }),
};
