import { createSelector } from 'reselect';

const getPermissions = state => state.user.permissions;

/**
 * Return the permissions of the logged user
 */
export const permissionsSelector = createSelector(
  getPermissions,
  permissions => permissions
);

export default permissionsSelector;
