import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { userPermissionsFetchRequest } from 'modules/user/actions';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';

import getOrganization from './query.graphql';

const mapStateToProps = (state) => {
  const {
    routes: { query },
  } = state;
  const organizationId = exists(query.organizationId) ? +query.organizationId : undefined;

  return {
    organizationId,
    isCreating: !exists(query.organizationId),
    canUpdate: can(
      permissionsSelector(state),
      'organization',
      organizationId,
      PERMISSIONS.ORGANIZATION_UPDATE
    ),
  };
};

const mapDispatchToProps = {
  reloadUserPermissions: userPermissionsFetchRequest,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  graphql(getOrganization, {
    // @ts-ignore
    skip: ({ isCreating }) => isCreating,
    // @ts-ignore
    options: ({ organizationId }) => ({
      variables: { organizationId },
    }),
  })
)(Component);
