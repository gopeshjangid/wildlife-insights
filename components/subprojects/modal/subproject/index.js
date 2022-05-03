import { connect } from 'react-redux';

import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';

const mapStateToProps = (state, { projectId, subProjectId }) => ({
  projectId,
  subProjectId,
  canEdit: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.SUBPROJECT_UPDATE),
});

export default connect(
  mapStateToProps,
  null
)(Component);
