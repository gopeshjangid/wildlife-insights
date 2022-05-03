import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import {
  setSelectedImageGroupIndex,
  setSelectedImageIndex,
  setIsSingleBurstPreview,
  setForceImageRefetch
} from 'components/images/grid/actions';
import {
  reset as resetIdentifyState
} from 'components/images/preview-modal/sidebar/identify-tab/actions';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';
import Component from './component';

const mapStateToProps = ({ imageGrid, identify, routes: { query } }, { imageGroups }) => {
  let firstBurstImage = {};
  if (imageGroups.length > 0) {
    firstBurstImage = (imageGrid.selectedImageGroupIndex &&
      imageGroups[imageGrid.selectedImageGroupIndex]) ?
      imageGroups[imageGrid.selectedImageGroupIndex][0] : imageGroups[0][0];
  }
  return ({
    isSingleBurstPreview: imageGrid.isSingleBurstPreview,
    isBurstModeActive: imageGrid.filters.timeStep > 0,
    selectedImageGroupIndex: imageGrid.selectedImageGroupIndex,
    isFirst: !imageGrid.selectedImageGroupIndex,
    isLast: !exists(imageGrid.selectedImageGroupIndex)
      || !imageGroups.length
      || imageGroups.length === imageGrid.selectedImageGroupIndex + 1,
    selectedImageIndex: imageGrid.selectedImageIndex,
    isFirstBurst: !imageGrid.selectedImageIndex,
    isLastBurst: !exists(imageGrid.selectedImageIndex)
      || !imageGroups[imageGrid.selectedImageGroupIndex]?.length
      || imageGroups[imageGrid.selectedImageGroupIndex]?.length === imageGrid.selectedImageIndex + 1,
    firstBurstImage,
    images: exists(imageGrid.selectedImageGroupIndex) && imageGroups.length &&
      imageGroups[imageGrid.selectedImageGroupIndex] ?
      imageGroups[imageGrid.selectedImageGroupIndex]
      : [],
    identify,
    isSequenceProject: imageGrid.projectType === 'sequence',
    tab: query.tab
  });
};

const mapDispatchToProps = {
  setSelectedImageGroupIndex,
  reset: actions.reset,
  setSelectedImageIndex,
  setIsSingleBurstPreview,
  setForceImageRefetch,
  resetIdentifyState
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
export { actions, initialState, reducers };
