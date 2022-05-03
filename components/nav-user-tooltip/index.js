import { connect } from 'react-redux';

import Component from './component';

const mapStateToProps = ({ auth: { authenticated } }) => ({
  authenticated: !!authenticated
});

export default connect(mapStateToProps)(Component);
