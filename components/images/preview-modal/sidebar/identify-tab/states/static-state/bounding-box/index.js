import { connect } from 'react-redux';

import {
  displaySuccess,
  displayError
} from 'components/notifications/actions';
import { setShowBoundingBoxesOnImage } from 'components/images/preview-modal/actions';
import Component from './component';

const mapStateToProps = ({ imagePreviewModal }) => ({
  showBoundingBoxesOnImage: imagePreviewModal.showBoundingBoxesOnImage,
  showBoundingBoxSettings: imagePreviewModal.showBoundingBoxSettings
});

const mapDispatchToProps = dispatch => ({
  onToggleBoundingBoxes: bool => dispatch(setShowBoundingBoxesOnImage(bool)),
  displaySuccess: notification => dispatch(displaySuccess(notification)),
  displayError: notification => dispatch(displayError(notification))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
