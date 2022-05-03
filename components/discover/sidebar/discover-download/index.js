import { connect } from 'react-redux';

import Component from './component';

const mapStateToProps = ({ user: { data } }) => ({
  userData: data,
});

export default connect(mapStateToProps)(Component);
