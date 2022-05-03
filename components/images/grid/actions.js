import { createAction } from 'vizzuality-redux-tools';

export const setGridType = createAction('image-grid/setGridType');

export const setFilters = createAction('image-grid/setFilters');
export const setPageIndex = createAction('image-grid/setPageIndex');
export const setPageSize = createAction('image-grid/setPageSize');
export const setSelectedImageGroupIndex = createAction('image-grid/setSelectedImageGroupIndex');
export const setSelectedImageIndex = createAction('image-grid/setSelectedImageIndex');
export const setSortColumn = createAction('image-grid/setSortColumn');
export const reset = createAction('image-grid/reset');
export const setSelectedImageGroups = createAction(
  'image-grid/setSelectedImageGroups',
);
export const setSelectedBurstImageGroups = createAction(
  'image-grid/setSelectedBurstImageGroups',
);
export const setIsSingleBurstPreview = createAction(
  'image-grid/setIsSingleBurstPreview',
);
export const setProjectType = createAction('image-grid/setProjectType');
export const setForceImageRefetch = createAction('image-grid/setForceImageRefetch');
export const setAnyImageClassfied = createAction('image-grid/setAnyImageClassfied');
