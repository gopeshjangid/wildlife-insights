import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';

import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import createDevice from 'components/devices/modal/device/create-device.graphql';
import createLocation from './createLocation.graphql';
import Component from './component';

const mapStateToProps = (state, { organizationId, projectId, id }) => ({
  organizationId,
  projectId,
  id,
  canEdit: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.DEPLOYMENT_UPDATE),
  canAttachDevice:
    can(permissionsSelector(state), 'project', projectId, PERMISSIONS.DEVICE_ADD_TO_DEPLOYMENT),
  canCreateDeviceForProject: can(
    permissionsSelector(state),
    'organization',
    organizationId,
    PERMISSIONS.DEVICE_CREATE,
  ),
  canCreateLocationForProject: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.LOCATION_CREATE),
});

export default compose(
  connect(mapStateToProps),
  graphql(createDevice, {
    name: 'createDevice',
  }),
  graphql(createLocation, {
    name: 'createLocation',
  })
)(Component);
