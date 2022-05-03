import * as actions from './actions';
import initialState from './initial-state';

export default {
  [/** @type {any} */(actions.openModal)]: (state, { payload }) => ({
    ...state,
    modal: {
      ...state.modal,
      ...payload,
      isOpen: true,
    }
  }),
  [/** @type {any} */(actions.updateData)]: (state, { payload }) => ({
    ...state,
    modal: { ...state.modal, ...payload }
  }),
  [/** @type {any} */(actions.closeModal)]: state => ({
    ...state,
    modal: { ...initialState.modal, isOpen: false }
  }),
  [/** @type {any} */(actions.createUploadItem)]: (state, { payload }) => ({
    ...state,
    uploads: {
      ...state.uploads,
      byId: { ...state.uploads.byId, [payload.id]: payload },
      allIds: [...state.uploads.allIds, payload.id],
    }
  }),
  [/** @type {any} */(actions.updateUploadItem)]: (state, { payload }) => ({
    ...state,
    uploads: {
      ...state.uploads,
      byId: {
        ...state.uploads.byId,
        [payload.id]: { ...state.uploads.byId[payload.id], ...payload },
      },
    }
  }),
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
