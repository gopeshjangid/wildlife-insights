import { createAction } from 'vizzuality-redux-tools';

export const setFilters = createAction('deployments-list/setFilters');
export const reset = createAction('deployments-list/reset');
export const createUploadItem = createAction('UPLOAD_DEPLOYMENT_CREATE');
export const updateUploadItem = createAction('UPLOAD_DEPLOYMENT_UPDATE');
export const removeUploadItem = createAction('UPLOAD_DEPLOYMENT_REMOVE');
