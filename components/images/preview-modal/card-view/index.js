import { connect } from 'react-redux';
import {
  setSelectedBurstImageGroups,
  setSelectedImageIndex,
  setIsSingleBurstPreview
} from 'components/images/grid/actions';
import Component from './component';

const mapStateToProps = (state) => {
  const { imageGrid, identify, routes: { query } } = state;
  return ({
    identify,
    flagImageSelection: imageGrid.projectType === 'image',
    projectType: imageGrid.projectType,
    selectedBurstImageGroups: imageGrid.selectedBurstImageGroups,
    selectedImageGroupIndex: imageGrid.selectedImageGroupIndex,
    isBurstModeActive: imageGrid.filters.timeStep > 0,
    tab: query.tab
  });
};

const mapDispatchToProps = {
  setSelectedBurstImageGroups,
  setSelectedImageIndex,
  setIsSingleBurstPreview
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
