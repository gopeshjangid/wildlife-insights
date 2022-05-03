import { connect } from 'react-redux';

import Component from './component';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

const mapStateToProps = ({ subProjectDeploymentsList }) => {
  return {
    filters: subProjectDeploymentsList.filters,
  };
};

const mapDispatchToProps = dispatch => ({
  setFilters: filters => dispatch(actions.setFilters(filters)),
  reset: () => dispatch(actions.reset()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export { actions, initialState, reducers };
