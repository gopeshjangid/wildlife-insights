export default {
  // FETCH USER
  USER_FETCH_STARTED: state => ({ ...state, isFetching: true }),
  USER_FETCH_ENDED: state => ({ ...state, isFetching: false }),
  USER_FETCH_SUCCEEDED: (state, { payload }) => ({
    ...state,
    data: payload.data,
    fetchingStatus: 'success',
  }),
  USER_FETCH_FAILED: (state, { payload }) => ({
    ...state,
    errors: [
      { title: payload.response.status === 401 ? 'Unauthorized.' : 'Something went wrong.' },
    ],
    fetchingStatus: 'error',
  }),

  // SAVE USER
  USER_SAVE_STARTED: state => ({ ...state, isSaving: true }),
  USER_SAVE_ENDED: state => ({ ...state, isSaving: false }),
  USER_SAVE_SUCCEEDED: (state, { payload }) => ({
    ...state,
    data: payload.data,
    isSaving: false,
    savingStatus: 'success',
  }),
  USER_SAVE_FAILED: (state, { payload }) => ({
    ...state,
    errors: [
      { title: payload.response.status === 401 ? 'Unauthorized.' : 'Something went wrong.' },
    ],
    isSaving: false,
    savingStatus: 'error',
  }),

  USER_PERMISSIONS_FETCH_SUCCEEDED: (state, { payload }) => ({
    ...state,
    permissions: payload,
  }),
};
