import { createAction } from 'vizzuality-redux-tools';

export const setBrightness = createAction('image-preview-modal/setBrightness');
export const setContrast = createAction('image-preview-modal/setContrast');
export const setSaturation = createAction('image-preview-modal/setSaturation');
export const setFilter = createAction('image-preview-modal/setFilter');
export const setShowBoundingBoxesOnImage = createAction('image-preview-modal/setShowBoundingBoxesOnImage');
export const setShowBoundingBoxSettings = createAction('image-preview-modal/setShowBoundingBoxSettings');
export const reset = createAction('image-preview-modal/reset');
