import { connect } from 'react-redux';
import * as actions from '../actions';
import Component from './component';

const mapDispatchToProps = dispatch => ({
  saveFilter: data => {
    dispatch(actions.setFilters(data));
  },
  selectProject: id => {
    dispatch(actions.selectProject(id));
  }
});

export default connect(
  state => {
    return { ...state?.analytics };
  },
  mapDispatchToProps
)(Component);
