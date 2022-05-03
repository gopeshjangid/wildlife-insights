import { connect } from 'react-redux';
import Component from './component';
import * as actions from '../actions';

const mapDispatchToProps = dispatch => ({
  saveAnalyses: data => {
    dispatch(actions.setAnalyses(data));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(Component);
