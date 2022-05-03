import { createAction } from 'vizzuality-redux-tools';

export const setNumSpeciesLoading = createAction('statistics/setNumSpeciesLoading');
export const setNumSpeciesCnt = createAction('statistics/setNumSpeciesCnt');
export const setNumSpeciesErr = createAction('statistics/setNumSpeciesErr');

export const setWildlifeImagesCountLoading = createAction('statistics/setWildlifeImagesCountLoading');
export const setWildlifeImagesCount = createAction('statistics/setWildlifeImagesCount');
export const setWildlifeImagesCountErr = createAction('statistics/setWildlifeImagesCountErr');

export const resetAuthStatistics = createAction('statistics/resetAuthStatistics');
