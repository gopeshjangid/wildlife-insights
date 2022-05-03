import { connect } from 'react-redux';
import Component from './component';

const mapStateToProps = state => ({
  pathname: state.routes.pathname
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(Component);
