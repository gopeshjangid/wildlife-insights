/**
 * Sort entities (mutates the array)
 * @param {Array<any>} entities Entities to sort
 */
export const sortEntities = entities => entities.sort((entityA, entityB) => entityA.name.localeCompare(entityB.name, { sensitivity: 'base' }));

export default sortEntities;
