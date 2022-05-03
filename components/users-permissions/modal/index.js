import { connect } from 'react-redux';

import { userPermissionsFetchRequest } from 'modules/user/actions';
import { getConcernedEntity, exists } from 'utils/functions';
import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { getInvitationRoleOptions } from './helpers';
import Component from './component';

const mapStateToProps = (state) => {
  const {
    routes: { query },
    user,
  } = state;

  let isProjectOwner = false;

  const concernedEntity = getConcernedEntity(
    query.organizationId,
    query.initiativeId,
    query.projectId
  );

  if (concernedEntity?.type === 'project') {
    isProjectOwner = user.permissions.projects[concernedEntity.id].role === 'PROJECT_OWNER';
  }

  return {
    isProjectOwner,
    organizationId: exists(query.organizationId) ? +query.organizationId : undefined,
    concernedEntity,
    invitationRoleOptions: getInvitationRoleOptions({
      viewer: can(
        permissionsSelector(state),
        concernedEntity?.type,
        concernedEntity?.id,
        PERMISSIONS[`${concernedEntity?.type.toUpperCase()}_INVITE_USER_AS_VIEWER`]
      ),
      editor: can(
        permissionsSelector(state),
        concernedEntity?.type,
        concernedEntity?.id,
        PERMISSIONS[`${concernedEntity?.type.toUpperCase()}_INVITE_USER_AS_EDITOR`]
      ),
      owner: can(
        permissionsSelector(state),
        concernedEntity?.type,
        concernedEntity?.id,
        PERMISSIONS[`${concernedEntity?.type.toUpperCase()}_INVITE_USER_AS_OWNER`]
      ),
      // @ts-ignore
      contributor: can(
        permissionsSelector(state),
        concernedEntity?.type,
        concernedEntity?.id,
        PERMISSIONS[`${concernedEntity?.type.toUpperCase()}_INVITE_USER_AS_CONTRIBUTOR`]
      ),
      tagger: can(
        permissionsSelector(state),
        concernedEntity?.type,
        concernedEntity?.id,
        PERMISSIONS[`${concernedEntity?.type.toUpperCase()}_INVITE_USER_AS_TAGGER`]
      )
    }),
  };
};

const mapDispatchToProps = {
  reloadUserPermissions: userPermissionsFetchRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
