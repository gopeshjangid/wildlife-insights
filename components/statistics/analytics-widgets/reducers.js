import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setNumSpeciesLoading)]: (state, { payload }) => ({
    ...state,
    authStatistics: {
      ...state.authStatistics,
      numSpecies: {
        ...state.authStatistics.numSpecies,
        loading: payload
      }
    }
  }),
  [/** @type {any} */(actions.setNumSpeciesCnt)]: (state, { payload }) => ({
    ...state,
    authStatistics: {
      ...state.authStatistics,
      numSpecies: {
        ...state.authStatistics.numSpecies,
        count: payload,
        loading: false
      }
    }
  }),
  [/** @type {any} */(actions.setNumSpeciesErr)]: (state, { payload }) => ({
    ...state,
    authStatistics: {
      ...state.authStatistics,
      numSpecies: {
        ...state.authStatistics.numSpecies,
        error: payload,
        loading: false
      }
    }
  }),
  [/** @type {any} */(actions.setWildlifeImagesCountLoading)]: (state, { payload }) => ({
    ...state,
    authStatistics: {
      ...state.authStatistics,
      wildlifeImagesCount: {
        ...state.authStatistics.wildlifeImagesCount,
        loading: payload
      }
    }
  }),
  [/** @type {any} */(actions.setWildlifeImagesCount)]: (state, { payload }) => ({
    ...state,
    authStatistics: {
      ...state.authStatistics,
      wildlifeImagesCount: {
        ...state.authStatistics.wildlifeImagesCount,
        count: payload,
        loading: false
      }
    }
  }),
  [/** @type {any} */(actions.setWildlifeImagesCountErr)]: (state, { payload }) => ({
    ...state,
    authStatistics: {
      ...state.authStatistics,
      wildlifeImagesCount: {
        ...state.authStatistics.wildlifeImagesCount,
        error: payload,
        loading: false
      }
    }
  }),
  [/** @type {any} */(actions.resetAuthStatistics)]: state => ({
    ...state,
    ...initialState
  })
};
