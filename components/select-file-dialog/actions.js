import { createAction } from 'vizzuality-redux-tools';

// Select files dialog
export const openSelectFileDialog = createAction('SELECT_FILE_OPEN');
export const closeSelectFileDialog = createAction('SELECT_FILE_CLOSE');
