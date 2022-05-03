import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setFilters)]: (state, { payload }) => {
    return ({
      ...state,
      filters: payload,
    });
  },
  [/** @type {any} */(actions.reset)]: state => ({ ...state, ...initialState }),
};
