import { connect } from 'react-redux';

import { displayError } from 'components/notifications/actions';
import Component from './component';

const mapDispatchToProps = (dispatch) => ({
  displayError: (...params) => dispatch(displayError(...params)),
});

export default connect(null, mapDispatchToProps)(Component);
