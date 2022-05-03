import { createAction } from 'vizzuality-redux-tools';

export const openModal = createAction('UPLOAD_OPEN_MODAL');
export const closeModal = createAction('UPLOAD_CLOSE_MODAL');
export const updateData = createAction('UPLOAD_UPDATE_DATA');

export const createUploadItem = createAction('UPLOAD_ITEM_CREATE');
export const updateUploadItem = createAction('UPLOAD_ITEM_UPDATE');
export const removeUploadItem = createAction('UPLOAD_ITEM_REMOVE');
