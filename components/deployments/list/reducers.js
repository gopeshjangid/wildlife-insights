import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setFilters)]: (state, { payload }) => {
    return ({
      ...state,
      filters: payload,
    });
  },
  [/** @type {any} */(actions.reset)]: state => ({ ...state, ...initialState, uploads: state.uploads }),
  [/** @type {any} */(actions.createUploadItem)]: (state, { payload }) => ({
    ...state,
    uploads: {
      ...state.uploads,
      byId: { ...state.uploads.byId, [payload.id]: payload },
      allIds: [...state.uploads.allIds, payload.id],
    }
  }),
  [/** @type {any} */(actions.updateUploadItem)]: (state, { payload }) => {
    return ({
      ...state,
      uploads: {
        ...state.uploads,
        byId: {
          ...state.uploads.byId,
          [payload.id]: { ...state.uploads.byId[payload.id], ...payload },
        },
      }
    })
  },
  [/** @type {any} */(actions.removeUploadItem)]: (state, { payload }) => {
    const newState = {
      ...state,
      uploads: { ...state.uploads }
    };
    delete newState.uploads.byId[payload];
    newState.uploads.allIds = newState.uploads.allIds.filter(id => id !== payload);
    return newState;
  },
};
