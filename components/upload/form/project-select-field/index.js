import { connect } from 'react-redux';

import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';

const mapStateToProps = state => ({
  canUploadToProject: projectId => can(
    permissionsSelector(state),
    'project',
    projectId,
    PERMISSIONS.DATA_FILE_CREATE
  ),
});

export default connect(mapStateToProps)(Component);
