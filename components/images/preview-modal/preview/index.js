import { connect } from 'react-redux';
import {
  setSelectedImageGroups,
  setIsSingleBurstPreview,
  setSelectedImageIndex
} from 'components/images/grid/actions';
import { exists } from 'utils/functions';
import Component from './component';
import { setShowBoundingBoxSettings } from '../actions';

const mapStateToProps = ({ imagePreviewModal, imageGrid, routes }, { imageGroups }) => ({
  selectedImageGroupIndex: imageGrid.selectedImageGroupIndex,
  selectedImageIndex: imageGrid.selectedImageIndex,
  images: exists(imageGrid.selectedImageGroupIndex) && imageGroups.length
    ? imageGroups[imageGrid.selectedImageGroupIndex]
    : [],
  brightness: imagePreviewModal.brightness,
  contrast: imagePreviewModal.contrast,
  saturation: imagePreviewModal.saturation,
  showBoundingBoxesOnImage: imagePreviewModal.showBoundingBoxesOnImage,
  tab: routes.query.tab,
  selectedImageGroups: imageGrid.selectedImageGroups,
});

const mapDispatchToProps = {
  setSelectedImageGroups,
  setShowBoundingBoxSettings,
  setIsSingleBurstPreview,
  setSelectedImageIndex: index => setSelectedImageIndex(index)
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
