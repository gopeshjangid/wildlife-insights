import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setBasicFilters)]: (state, { payload }) => {
    const { basicFilters } = state;
    return ({
      ...state,
      basicFilters: {
        ...basicFilters,
        ...payload
      }
    });
  },
  [/** @type {any} */(actions.setSidebarExpanded)]: (state, { payload }) => ({
    ...state,
    shouldExpandSidebar: payload
  }),
  [/** @type {any} */(actions.reset)]: state => ({ ...state, ...initialState })
};
