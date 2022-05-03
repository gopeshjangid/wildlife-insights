import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import {
  setBrightness,
  setContrast,
  setSaturation,
  setFilter
} from '../../actions';
import Component from './component';

const PRESETS = [
  { name: 'Original', brightness: 100, contrast: 100, saturation: 100 },
  { name: 'High contrast', brightness: 100, contrast: 200, saturation: 100 },
  { name: 'Brighter', brightness: 150, contrast: 100, saturation: 75 },
  { name: 'Darker', brightness: 50, contrast: 130, saturation: 100 }
];

const mapStateToProps = ({ imagePreviewModal, imageGrid }, { images }) => ({
  image: exists(imageGrid.selectedImageIndex) && images.length
    ? images[imageGrid.selectedImageIndex]
    : null,
  presets: PRESETS,
  brightness: imagePreviewModal.brightness,
  contrast: imagePreviewModal.contrast,
  saturation: imagePreviewModal.saturation
});

const mapDispatchToProps = {
  setBrightness,
  setContrast,
  setSaturation,
  setFilter
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
