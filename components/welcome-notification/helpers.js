import { getReadableRole } from 'utils/functions';

/**
 * Return for each of the entity types its information and the user role in a readable format
 * @param {string} entityType Type of the entity (either "organization", "initiative" or "project")
 * @param {Object<string, Object>} data Participant data from the API
 */
const mapEntities = (entityType, data) => data[`${entityType}Roles`].map(o => ({
  ...o[entityType],
  role: getReadableRole(o.role.name),
}));

export { mapEntities };
export default mapEntities;
