import { connect } from 'react-redux';
import Component from './component';
import initialState from '../initial-state';

export default connect(
  state => {
    return {
      ...initialState,
      auth: state?.auth,
      user: state?.user,
      ...state?.analytics
    };
  },
  null
)(Component);
