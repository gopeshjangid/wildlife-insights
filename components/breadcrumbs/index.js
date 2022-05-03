import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';

const mapStateToProps = (state) => {
  const {
    routes: {
      query: { organizationId, initiativeId, projectId },
      pathname,
    },
  } = state;

  return {
    pathname,
    organizationId: exists(organizationId) ? +organizationId : null,
    initiativeId: exists(initiativeId) ? +initiativeId : null,
    projectId: exists(projectId) ? +projectId : null,
    canAccessOrganization: orgId => can(permissionsSelector(state), 'organization', orgId, PERMISSIONS.ORGANIZATION_GET_ONE),
    canAccessInitiative: initId => can(permissionsSelector(state), 'initiative', initId, PERMISSIONS.INITIATIVE_GET_ONE),
  };
};

export default connect(mapStateToProps)(Component);
