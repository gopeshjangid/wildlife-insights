import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setOrgAnalyticType)]: (state, { payload }) => ({
    ...state,
    orgAnalyticType: payload,
  }),
  [/** @type {any} */(actions.reset)]: state => ({ ...state, ...initialState })
};
