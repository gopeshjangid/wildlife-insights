import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';

import deviceQuery from './device.graphql';
import Component from './component';

const mapStateToProps = (state, { organizationId, id }) => ({
  organizationId,
  id,
  canEdit: can(
    permissionsSelector(state),
    'organization',
    organizationId,
    PERMISSIONS.DEVICE_UPDATE
  ),
});

export default compose(
  connect(mapStateToProps, null),
  graphql(deviceQuery, {
    // @ts-ignore
    skip: ({ id, isCreating }) => isCreating || id === null || id === undefined,
    // @ts-ignore
    options: ({ organizationId, id }) => ({
      variables: { organizationId, id },
    }),
  })
)(Component);
