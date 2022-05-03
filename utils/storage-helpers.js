import { exists } from './functions';

export const TAXONOMY_CACHE_LENGTH = 15;
export const TAXONOMY_CACHE_KEY = 'taxonomyIdsPerProject';

export const getTaxonomyIdsFromSessionStorage = (projectId) => {
  let cachedIdsDict;
  try {
    cachedIdsDict = JSON.parse(sessionStorage.getItem(TAXONOMY_CACHE_KEY));
  } catch (e) { } // eslint-disable-line no-empty

  if (!exists(cachedIdsDict)) {
    cachedIdsDict = {};
  }

  return cachedIdsDict[projectId] || [];
}

export const setTaxonomyIdsToSessionStorage = (uniqueProjectIds, uniqueTaxonomies) => {
  let cachedIdsDict;
  try {
    cachedIdsDict = JSON.parse(sessionStorage.getItem(TAXONOMY_CACHE_KEY));
  } catch (e) { } // eslint-disable-line no-empty

  if (!exists(cachedIdsDict)) {
    cachedIdsDict = {};
  }

  // loop through the projectIds, to prepare the recent ids list per project
  uniqueProjectIds.forEach(projectId => {
    const idListForProject = cachedIdsDict[projectId] || [];

    let itemIndex;
    // add taxonomies from uniqueTaxonomies, and re-arrange/move most recent id to the top
    for (let key in uniqueTaxonomies) {
      itemIndex = undefined;
      idListForProject.find((item, id) => {
        if (item.uniqueIdentifier === key) {
          itemIndex = id;
        }
      });

      if (exists(itemIndex)) {
        idListForProject.splice(itemIndex, 1);
      }

      idListForProject.unshift(uniqueTaxonomies[key]);
    }

    // at most, cached ids length (per project) will be TAXONOMY_CACHE_LENGTH
    if (idListForProject.length > TAXONOMY_CACHE_LENGTH) {
      idListForProject.splice(TAXONOMY_CACHE_LENGTH, idListForProject.length - TAXONOMY_CACHE_LENGTH);
    }
    cachedIdsDict[projectId] = idListForProject;
  });

  // update browser storage
  try {
    sessionStorage.setItem(TAXONOMY_CACHE_KEY, JSON.stringify(cachedIdsDict));
  } catch (e) { } // eslint-disable-line no-empty
}
