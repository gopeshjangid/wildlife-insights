import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { userPermissionsFetchRequest } from 'modules/user/actions';
import { permissionsSelector } from 'modules/user/selectors';
import { displaySuccess, displayError } from 'components/notifications/actions';
import { getOrganizationsOptions } from './helpers';
import Component from './component';

import getOrganizations from './organizations.graphql';
import getInitiative from './query.graphql';
import deletePhotos from './delete-photos.graphql';
import deleteLogos from './delete-logos.graphql';
import updateLogo from './update-logo.graphql';
import deleteInitiative from './delete-initiative.graphql';

const mapStateToProps = (state) => {
  const {
    auth: { token },
    routes: { query },
  } = state;
  const initiativeId = exists(query.initiativeId) ? +query.initiativeId : undefined;

  return {
    token,
    initiativeId,
    isCreating: !exists(query.initiativeId),
    canUpdate: can(
      permissionsSelector(state),
      'initiative',
      initiativeId,
      PERMISSIONS.INITIATIVE_UPDATE
    ),
    canDelete: can(
      permissionsSelector(state),
      'initiative',
      initiativeId,
      PERMISSIONS.INITIATIVE_DELETE
    ),
    getOrganizationsOptions: organizations => getOrganizationsOptions(permissionsSelector(state), organizations),
  };
};

const mapDispatchToProps = {
  reloadUserPermissions: userPermissionsFetchRequest,
  displayError,
  displaySuccess,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  graphql(getOrganizations, {
    // @ts-ignore
    skip: ({ isCreating }) => !isCreating,
  }),
  graphql(getInitiative, {
    // @ts-ignore
    skip: ({ isCreating }) => isCreating,
    // @ts-ignore
    options: ({ initiativeId }) => ({
      variables: { id: Number.parseInt(initiativeId, 10) },
      fetchPolicy: 'cache-and-network',
    }),
  }),
  graphql(deletePhotos, {
    name: 'deletePhotos',
  }),
  graphql(deleteLogos, {
    name: 'deleteLogos',
  }),
  graphql(updateLogo, {
    name: 'updateLogo',
  }),
  graphql(deleteInitiative, {
    name: 'deleteInitiative',
  }),
)(Component);
