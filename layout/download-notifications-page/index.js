import { connect } from 'react-redux';
import Component from './component';

const mapStateToProps = state => ({
  routes: state.routes
});

export default connect(mapStateToProps)(Component);
