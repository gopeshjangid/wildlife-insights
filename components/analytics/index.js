import { connect } from 'react-redux';
import Component from './component';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

export default connect(
  state => {
    return { ...state?.analytics };
  },
  null
)(Component);

export { actions, reducers, initialState };
