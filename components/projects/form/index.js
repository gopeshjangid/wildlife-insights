import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { userPermissionsFetchRequest } from 'modules/user/actions';
import { getInitiativesOptions, getOrganizationsOptions } from './helpers';
import Component from './component';

import getProject from './query.graphql';

const mapStateToProps = (state) => {
  const {
    user: {
      data: { useCommonNames },
    },
    routes: { query },
  } = state;
  const projectId = exists(query.projectId) ? +query.projectId : undefined;

  return {
    projectId,
    organizationId: exists(query.organizationId) ? +query.organizationId : undefined,
    isCreating: !exists(query.projectId),
    canUpdate: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.PROJECT_UPDATE),
    canUpdateInitiative: project => !project.initiativeId || can(permissionsSelector(state), 'initiative', project.initiativeId, PERMISSIONS.PROJECT_REMOVE_FROM_INITIATIVE),
    getInitiativesOptions: initiatives => getInitiativesOptions(permissionsSelector(state), initiatives),
    getOrganizationsOptions: organizations => getOrganizationsOptions(permissionsSelector(state), organizations),
    useCommonNames: !!useCommonNames,
  };
};

const mapDispatchToProps = {
  reloadUserPermissions: userPermissionsFetchRequest,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  graphql(getProject, {
    // @ts-ignore
    skip: ({ isCreating }) => isCreating,
    // @ts-ignore
    options: ({ projectId, organizationId }) => ({
      variables: {
        organizationId,
        id: projectId,
      },
    }),
  }),
)(Component);
