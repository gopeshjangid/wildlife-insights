import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setBrightness)]: (state, { payload }) => ({
    ...state,
    brightness: payload
  }),
  [/** @type {any} */(actions.setContrast)]: (state, { payload }) => ({
    ...state,
    contrast: payload
  }),
  [/** @type {any} */(actions.setSaturation)]: (state, { payload }) => ({
    ...state,
    saturation: payload
  }),
  [/** @type {any} */(actions.setFilter)]: (state, { payload }) => ({ ...state, ...payload }),
  [/** @type {any} */(actions.reset)]: state => {
    const { showBoundingBoxesOnImage } = state;
    return { ...state, ...initialState, showBoundingBoxesOnImage }
  },
  [/** @type any */(actions.setShowBoundingBoxesOnImage)]: (state, { payload }) => ({
    ...state,
    showBoundingBoxesOnImage: payload
  }),
  [/** @type any */(actions.setShowBoundingBoxSettings)]: (state, { payload }) => ({
    ...state,
    showBoundingBoxSettings: payload
  })
};
