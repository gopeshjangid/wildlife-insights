import { connect } from 'react-redux';

import { displayError } from 'components/notifications/actions';
import Component from './component';

const mapDispatchToProps = dispatch => ({
  displayError: notification => dispatch(displayError(notification))
});

export default connect(
  null,
  mapDispatchToProps
)(Component);
