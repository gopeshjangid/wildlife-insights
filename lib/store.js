import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import { handleModule } from 'vizzuality-redux-tools';
import { reducer as notifications } from 'react-notification-system-redux';

import * as auth from 'modules/auth';
import * as routes from 'modules/routes';
import * as signup from 'modules/signup';
import * as resetpassword from 'modules/reset-password';
import * as user from 'modules/user';
import * as deploymentsList from 'components/deployments/list';
import * as locationsList from 'components/locations/list';
import * as subProjectsList from 'components/subprojects/list';
import * as subProjectDeploymentsList from 'components/subprojects/modal/deployments';
import * as devicesList from 'components/devices/list';
import * as imagePreviewModal from 'components/images/preview-modal';
import * as imageGrid from 'components/images/grid';
import * as upload from 'components/upload';
import * as selectFileDialog from 'components/select-file-dialog';
import * as language from 'components/transifex/language-select';
import * as identify from 'components/images/preview-modal/sidebar/identify-tab';
import * as advancedFilters from 'components/discover/sidebar/filters/modal/advanced-filters';
import * as explore from 'components/discover';
import * as statistics from 'components/statistics/analytics-widgets';
import * as summary from 'components/summary';
import * as analytics from 'components/analytics';

const reducer = combineReducers({
  auth: handleModule(auth),
  routes: handleModule(routes),
  signup: handleModule(signup),
  resetpassword: handleModule(resetpassword),
  user: handleModule(user),
  languages: handleModule(language),
  imagePreviewModal: handleModule(imagePreviewModal),
  upload: handleModule(upload),
  selectFileDialog: handleModule(selectFileDialog),
  imageGrid: handleModule(imageGrid),
  notifications,
  identify: handleModule(identify),
  deploymentsList: handleModule(deploymentsList),
  locationsList: handleModule(locationsList),
  subProjectsList: handleModule(subProjectsList),
  subProjectDeploymentsList: handleModule(subProjectDeploymentsList),
  devicesList: handleModule(devicesList),
  advancedFilters: handleModule(advancedFilters),
  explore: handleModule(explore),
  statistics: handleModule(statistics),
  summary: handleModule(summary),
  analytics: handleModule(analytics)
});

const makeStore = (initialState = {}) =>
  createStore(
    reducer,
    initialState,
    /* Redux dev tool, install chrome extension in
     * https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en */
    composeWithDevTools(
      /* The router middleware MUST be before thunk otherwise the URL changes
       * inside a thunk function won't work properly */
      applyMiddleware(thunkMiddleware)
    )
  );

export default makeStore;
