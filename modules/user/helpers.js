// This object mirrors:
// https://github.com/ConservationInternational/WildlifeInsights---API-Service/blob/develop/src/utils/permissions.enum.ts
export const PERMISSIONS = {
  ORGANIZATION_CREATE: 'organization.create',
  ORGANIZATION_UPDATE: 'organization.update',
  ORGANIZATION_DELETE: 'organization.delete',
  ORGANIZATION_GET_ALL: 'organization.get_all',
  ORGANIZATION_GET_ONE: 'organization.get_one',
  ORGANIZATION_INVITE_USER_AS_VIEWER: 'organization.invite_user_as_viewer',
  ORGANIZATION_INVITE_USER_AS_EDITOR: 'organization.invite_user_as_editor',
  ORGANIZATION_INVITE_USER_AS_OWNER: 'organization.invite_user_as_owner',
  ORGANIZATION_INVITE_USER_AS_CONTRIBUTOR: 'organization.invite_user_as_contributor',
  ORGANIZATION_CHANGE_USER_ROLE: 'organization.change_user_role',
  ORGANIZATION_REVOKE_USER_ACCESS: 'organization.revoke_user_access',
  PROJECT_ADD_TO_ORGANIZATION: 'project.add_to_organization',
  PROJECT_REMOVE_FROM_ORGANIZATION: 'project.remove_from_organization',
  PROJECT_CREATE: 'project.create',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',
  PROJECT_GET_ALL: 'project.get_all',
  PROJECT_GET_ONE: 'project.get_one',
  PROJECT_INVITE_USER_AS_VIEWER: 'project.invite_user_as_viewer',
  PROJECT_INVITE_USER_AS_EDITOR: 'project.invite_user_as_editor',
  PROJECT_INVITE_USER_AS_OWNER: 'project.invite_user_as_owner',
  PROJECT_INVITE_USER_AS_CONTRIBUTOR: 'project.invite_user_as_contributor',
  PROJECT_INVITE_USER_AS_TAGGER: 'project.invite_user_as_tagger',
  PROJECT_CHANGE_USER_ROLE: 'project.change_user_role',
  PROJECT_ADD_TO_INITIATIVE: 'project.add_to_initiative',
  PROJECT_INVITE_TO_INITIATIVE: 'project.invite_to_initiative',
  PROJECT_REMOVE_FROM_INITIATIVE: 'project.remove_from_initiative',
  INITIATIVE_ADD_TO_ORGANIZATION: 'initiative.add_to_organization',
  INITIATIVE_REMOVE_FROM_ORGANIZATION: 'initiative.remove_from_organization',
  INITIATIVE_CREATE: 'initiative.create',
  INITIATIVE_UPDATE: 'initiative.update',
  INITIATIVE_DELETE: 'initiative.delete',
  INITIATIVE_GET_ALL: 'initiative.get_all',
  INITIATIVE_GET_ONE: 'initiative.get_one',
  PROJECT_REVOKE_USER_ACCESS: 'project.revoke_user_access',
  INITIATIVE_INVITE_USER_AS_VIEWER: 'initiative.invite_user_as_viewer',
  INITIATIVE_INVITE_USER_AS_EDITOR: 'initiative.invite_user_as_editor',
  INITIATIVE_INVITE_USER_AS_OWNER: 'initiative.invite_user_as_owner',
  INITIATIVE_CHANGE_USER_ROLE: 'initiative.change_user_role',
  INITIATIVE_REVOKE_USER_ACCESS: 'initiative.revoke_user_access',
  LOCATION_CREATE: 'location.create',
  LOCATION_UPDATE: 'location.update',
  LOCATION_DELETE: 'location.delete',
  LOCATION_GET_ALL: 'location.get_all',
  LOCATION_GET_ONE: 'location.get_one',
  DEPLOYMENT_CREATE: 'deployment.create',
  DEPLOYMENT_UPDATE: 'deployment.update',
  DEPLOYMENT_DELETE: 'deployment.delete',
  DEPLOYMENT_GET_ALL: 'deployment.get_all',
  DEPLOYMENT_GET_ONE: 'deployment.get_one',
  DATA_FILE_CREATE: 'dataFile.create',
  DATA_FILE_UPDATE: 'dataFile.update',
  DATA_FILE_DELETE: 'dataFile.delete',
  DATA_FILE_GET_ALL: 'dataFile.get_all',
  DATA_FILE_GET_ONE: 'dataFile.get_one',
  DATA_FILE_DOWNLOAD: 'dataFile.download',
  IDENTIFICATION_CREATE: 'identification.create',
  IDENTIFICATION_UPDATE: 'identification.update',
  IDENTIFICATION_DELETE: 'identification.delete',
  IDENTIFICATION_GET_ALL: 'identification.get_all',
  IDENTIFICATION_GET_ONE: 'identification.get_one',
  DEVICE_CREATE: 'device.create',
  DEVICE_UPDATE: 'device.update',
  DEVICE_DELETE: 'device.delete',
  DEVICE_GET_ALL: 'device.get_all',
  DEVICE_GET_ONE: 'device.get_one',
  DEVICE_ADD_TO_DEPLOYMENT: 'device.add_to_deployment',
  DEVICE_REMOVE_FROM_DEPLOYMENT: 'device.remove_from_deployment',
  SENSOR_CREATE: 'sensor.create',
  SENSOR_UPDATE: 'sensor.update',
  SENSOR_DELETE: 'sensor.delete',
  SENSOR_GET_ALL: 'sensor.get_all',
  SENSOR_GET_ONE: 'sensor.get_one',
  SEQUENCE_CREATE: 'sequence.create',
  SEQUENCE_UPDATE: 'sequence.update',
  SEQUENCE_DELETE: 'sequence.delete',
  SEQUENCE_GET_ALL: 'sequence.get_all',
  SEQUENCE_GET_ONE: 'sequence.get_one',
  SUBPROJECT_CREATE: 'subproject.create',
  SUBPROJECT_UPDATE: 'subproject.update',
  SUBPROJECT_DELETE: 'subproject.delete',
  SUBPROJECT_GET_ALL: 'subproject.get_all',
  SUBPROJECT_GET_ONE: 'subproject.get_one',
};

/**
 * Parse the permissions of the user in this format:
 * {
 *   organizations: Object<ID: number, { role: string, permissions: Array<string> }>,
 *   initiatives: Object<ID: number, { role: string, permissions: Array<string> }>,
 *   projects: Object<ID: number, { role: string, permissions: Array<string> }>,
 * }
 * @param {Object} participantData Permissions of the user (type ParticipantEntities
 in the API - result of the getParticipantData query)
 */
export const parseUserPermissions = participantData => ({
  organizations: participantData.organizationRoles.reduce(
    (res, o) => ({
      ...res,
      [+o.organization.id]: { role: o.role.name, permissions: o.role.permissions.map(p => p.slug) },
    }),
    {}
  ),
  initiatives: participantData.initiativeRoles.reduce(
    (res, o) => ({
      ...res,
      [+o.initiative.id]: { role: o.role.name, permissions: o.role.permissions.map(p => p.slug) },
    }),
    {}
  ),
  projects: participantData.projectRoles.reduce(
    (res, o) => ({
      ...res,
      [+o.project.id]: { role: o.role.name, permissions: o.role.permissions.map(p => p.slug) },
    }),
    {}
  ),
});

/**
 * Return whether the user has a specific permissions for a specific entity
 * @param {Object} permissions Permissions of the logged in user
 * @param {string} entity Entity type (organization, initiative or project)
 * @param {number} entityId ID of the entity
 * @param {string} permission Permission to check (see PERMISSIONS above)
 */
export const can = (permissions, entity, entityId, permission) => {
  const permList = permissions[`${entity}s`];

  if (!permList?.[entityId]) {
    return false;
  }

  return permList[entityId].permissions.indexOf(permission) !== -1;
};

/**
 * Return whether the user is a. admin (i.e. can only validate new accounts)
 * @param {Object} user User object as returned by the API
 */
export const isAdminUser = user => user?.data?.role?.slug === 'PARTICIPANT_ADMIN';

/**
 * Return whether the user is whitelisted or not
 * @param {Object} user User object as returned by the API
 */
export const isWhitelistedUser = user => user?.data?.whitelisted === true;
