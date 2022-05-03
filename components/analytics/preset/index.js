import { connect } from 'react-redux';

import Component from './component';

export default connect(
  state => {
    return { ...state?.analytics };
  },
  null
)(Component);
