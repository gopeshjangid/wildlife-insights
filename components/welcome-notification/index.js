import { connect } from 'react-redux';

import { displayInfo } from 'components/notifications/actions';
import Component from './component';

const mapStateToProps = ({ user: { data } }) => ({
  firstLogin: !!data && !data.logged,
});

const mapDispatchToProps = dispatch => ({
  displayInfo: notification => dispatch(displayInfo(notification)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
