import { connect } from 'react-redux';

import Component from './component';

const mapStateToProps = (state) => {
  const {
    user,
  } = state;
  return { permissions: user.permissions };
};

export default connect(
  mapStateToProps
)(Component);
