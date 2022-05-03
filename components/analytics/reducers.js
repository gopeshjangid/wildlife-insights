import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */ (actions.setFilters)]: (
    state = initialState,
    { payload }
  ) => {
    if (!payload) {
      return { ...initialState };
    }
    return {
      ...state,
      filters: {
        ...state?.filters,
        ...payload
      }
    };
  },
  [/** @type {any} */ (actions.selectProject)]: (
    state = initialState,
    { payload }
  ) => ({
    ...state,
    selectedProjectId: payload
  }),
  [/** @type {any} */ (actions.setAnalyses)]: (
    state = initialState,
    { payload }
  ) => {
    return {
      ...state,
      analyses: payload
    };
  },
  [/** @type {any} */ (actions.saveSpecies)]: (
    state = initialState,
    { payload }
  ) => {
    return {
      ...state,
      species: payload
    };
  }
};
