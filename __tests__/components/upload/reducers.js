/* eslint-env jest */
import reducer from 'components/upload/reducers';
import initialState from 'components/upload/initial-state';

describe('Upload reducers', () => {
  let state = initialState;

  it('should handle UPLOAD_OPEN_MODAL', () => {
    const createAction = 'UPLOAD_OPEN_MODAL';
    const payload = { files: [] };
    const result = { ...initialState, modal: { ...initialState.modal, isOpen: true } };

    state = reducer[createAction](state, { payload });

    expect(state).toEqual(result);
  });

  it('should handle UPLOAD_UPDATE_DATA', () => {
    const createAction = 'UPLOAD_UPDATE_DATA';
    const payload = { project: { value: 1 }, deployment: { value: 1 } };
    const result = { ...state, modal: { ...state.modal, ...payload } };

    state = reducer[createAction](state, { payload });

    expect(state).toEqual(result);
  });

  it('should handle UPLOAD_CLOSE_MODAL', () => {
    const createAction = 'UPLOAD_CLOSE_MODAL';
    const result = { ...initialState, modal: { ...initialState.modal, isOpen: false } };

    state = reducer[createAction](state);

    expect(state).toEqual(result);
  });
});
