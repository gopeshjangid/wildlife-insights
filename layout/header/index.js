import { connect } from 'react-redux';

import { isAdminUser, isWhitelistedUser } from 'modules/user/helpers';
import { openSelectFileDialog } from 'components/select-file-dialog/actions';
import Component from './component';

const mapStateToProps = ({ routes, user }) => ({
  user: user.data,
  isUserAdmin: isAdminUser(user),
  isUserWhitelisted: isWhitelistedUser(user),
  pathname: routes.pathname,
});

const mapDispatchToProps = dispatch => ({
  openSelectFileDialog: () => dispatch(openSelectFileDialog()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
