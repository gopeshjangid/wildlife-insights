import { getReadableRole } from 'utils/functions';

import organizationQuery from './query-organization.graphql';
import initiativeQuery from './query-initiative.graphql';
import projectQuery from './query-project.graphql';

import organizationMutation from './mutation-organization.graphql';
import initiativeMutation from './mutation-initiative.graphql';
import projectMutation from './mutation-project.graphql';

const ROLE_OPTIONS = [
  { label: 'Owner', value: 'owner', description: { default: 'Can fully edit {entity}s and manage all users', organization: 'Can edit organization details, create projects and invite any user. Has Editor access to all projects' } },
  { label: 'Editor', value: 'editor', description: { default: 'Can fully edit {entity}s and invite Contributors, Taggers & Viewers', organization: 'Can edit organization details and create projects. Has Viewer access to all projects' } },
  { label: 'Contributor', value: 'contributor', description: { default: 'Can upload, manage metadata and edit IDs, but cannot edit {entity}', organization: 'Can view organization details and create projects. Does not have inherited project role unless explicitly invited' } },
  { label: 'Tagger', value: 'tagger', description: { default: 'Can edit image IDs but cannot edit metadata or {entity}', organization: '' } },
  { label: 'Viewer', value: 'viewer', description: { default: 'Can view {entity} but cannot edit', organization: 'Can view organization details. Has Viewer access to all projects' } },
];

const USER_PERMISSIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

/**
 * Return if a user is an owner of the entity
 * @param {Object} user User for which to check permissions
 */
const isOwner = user => user.role === 'owner';

/**
 * Return the role options for the Select elements
 */
const getRoleOptions = () => ROLE_OPTIONS;

/**
 * Return which roles the user can invite to the entity as options for the select input
 * @param {{ viewer: boolean, editor: boolean, owner: boolean, contributor: boolean, tagger: boolean }} invitationPermissions Which roles the user can invite
 */
const getInvitationRoleOptions = (invitationPermissions) => {
  if (!invitationPermissions) {
    return [];
  }

  return getRoleOptions().filter(option => !!invitationPermissions[option.value]);
};

/**
 * Return the role options the current logged user can assign to the user passed as argument
 * @param {Object} user User we want the options for (see parseUsers for the format)
 */
const getRoleOptionsForUser = (user, entity = '') => {
  const { canBeAssignedRole } = user;
  const contributorIndex = canBeAssignedRole.indexOf('contributor');
  if (entity === 'initiative' && contributorIndex !== -1) {
    canBeAssignedRole.splice(contributorIndex, 1);
  }
  return getRoleOptions().filter(option => canBeAssignedRole.indexOf(option.value) !== -1);
};

/**
 * Return the query used to get the list of users with permissions
 * @param {{ id: number, type: string }} entity ID and type of the entity
 */
const getQuery = (entity) => {
  if (!entity) {
    // When navigating, the user might land on a page not representing any entity
    // In this case, the query will not be executed, but useQuery will expect a valid GraphQL query
    // anyway
    return projectQuery;
  }

  switch (entity.type) {
    case 'project':
      return projectQuery;

    case 'initiative':
      return initiativeQuery;

    case 'organization':
      return organizationQuery;

    default:
      return null;
  }
};

/**
 * Return the mutation used to save the changes
 * @param {{ id: number, type: string }} entity ID and type of the entity
 */
const getMutation = (entity) => {
  if (!entity) {
    // When navigating, the user might land on a page not representing any entity
    // In this case, the mutation will not be executed, but useMutation will expect a valid GraphQL
    // mutation anyway
    return projectMutation;
  }

  const mapEntityTypeToMutation = {
    project: projectMutation,
    initiative: initiativeMutation,
    organization: organizationMutation,
  };

  // We still need a default mutation even if the entity is not recognised because useMutation
  // expects a valid GraphQL mutation anyway (same as previous comment)
  return mapEntityTypeToMutation[entity.type] || projectMutation;
};

/**
 * Return the users of the entity after parsing
 * @param {Array<Object>} users Users as returned by the API
 */
const parseUsers = users => users.map(user => ({
  id: user.participant.id,
  firstName: user.participant.firstName,
  lastName: user.participant.lastName,
  email: user.participant.email,
  role: user.role ? getReadableRole(user.role.name) : undefined,
  canBeRevoked: user.canRoleBeRevoked,
  canBeAssignedRole: user.roleCanBeChangedTo.map(role => getReadableRole(role.name)),
  isImplicit: !!user.isImplicit,
}));

/**
 * Return the initial values of the form based on the users list
 * @param {Array<Object>} users List of usres
 */
const getFormInitialValues = users => ({
  users: users.map(user => ({
    ...user,
    role: getRoleOptions().find(role => role.value === user.role),
  })),
});

/**
 * Return the data to send to the mutation based on the form to change the access of existing users
 * @param {number} entityId ID of the entity to change the permissions to
 * @param {Array<Object>} users List of users with role before modification
 * @param {{ users: Array<Object> }} formData Data of the form
 */
const getMutationChangeData = (entityId, users, formData) => formData.users
  .filter((user, i) => user.role.value !== users[i].role || user.revoke === true)
  .map(user => ({
    operation: user.revoke === true ? USER_PERMISSIONS.DELETE : USER_PERMISSIONS.UPDATE,
    entityId,
    role: user.role.value,
    email: user.email,
  }));

/**
 * Return the data to send to the mutation based on the form to give access to a new user
 * @param {number} entityId ID of the entity that will receive a new user
 * @param {Object} formData Data of the form
 */
const getMutationCreateData = (entityId, formData) => [
  {
    operation: USER_PERMISSIONS.CREATE,
    entityId,
    role: formData.role.value,
    email: formData.email,
  },
];

/**
 * Return whether the mutation performed all the changes
 * @param {Array<Object>} mutationData Data passed to the mutation
 * @param {Object<string, number>} response Response of the mutation
 */
const didMutationPerformAllChanges = (mutationData, response) => {
  const creationsCountExpected = mutationData.filter(op => op.operation === USER_PERMISSIONS.CREATE)
    .length;
  const updatesCountExpected = mutationData.filter(op => op.operation === USER_PERMISSIONS.UPDATE)
    .length;
  const deletionsCountExpected = mutationData.filter(op => op.operation === USER_PERMISSIONS.DELETE)
    .length;

  const isSame = (expected, result) => expected === result || (expected === 0 && result === null);

  return (
    isSame(creationsCountExpected, response.create)
    && isSame(updatesCountExpected, response.update)
    && isSame(deletionsCountExpected, response.delete)
  );
};

export {
  USER_PERMISSIONS,
  getInvitationRoleOptions,
  getRoleOptionsForUser,
  isOwner,
  getRoleOptions,
  getQuery,
  getMutation,
  parseUsers,
  getFormInitialValues,
  getMutationChangeData,
  getMutationCreateData,
  didMutationPerformAllChanges,
};
