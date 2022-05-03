import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

const mapStateToProps = (state) => {
  const {
    routes: { query },
  } = state;
  const projectId = exists(query.projectId) ? +query.projectId : undefined;
  const { subProjectsList } = state;

  return {
    projectId,
    canEdit: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.SUBPROJECT_UPDATE),
    canCreate: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.SUBPROJECT_CREATE),
    canDelete: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.SUBPROJECT_DELETE),
    filters: subProjectsList.filters,
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
