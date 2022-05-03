import * as actions from './actions';

export default {
  [/** @type {any} */(actions.openSelectFileDialog)]: state => ({ ...state, triggerOpen: true }),
  [/** @type {any} */(actions.closeSelectFileDialog)]: state => ({ ...state, triggerOpen: false }),
};
