import { connect } from 'react-redux';

import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';

const mapStateToProps = (state, { projectId, id }) => ({
  projectId,
  id,
  canEdit: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.LOCATION_UPDATE),
});

export default connect(
  mapStateToProps,
  null
)(Component);
