import { connect } from 'react-redux';

import { displayError } from 'components/notifications/actions';
import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { setSelectedImageGroups } from '../../actions';
import Component from './component';

const mapStateToProps = (state, { selectedImageGroups }) => {
  const images = selectedImageGroups.reduce((res, group) => [...res, ...group], []);
  const deletableImages = images.filter(image => image.canDelete);

  return {
    imagesCount: images.length,
    deletableImagesCount: deletableImages.length,
    deletableImages,
    canDelete:
      !!deletableImages.length
      && deletableImages.every(image => can(
        permissionsSelector(state),
        'project',
        image.deployment.projectId,
        PERMISSIONS.DATA_FILE_DELETE
      )),
    canDeleteAll: deletableImages.length === images.length,
  };
};

const mapDispatchToProps = dispatch => ({
  displayError: notification => dispatch(displayError(notification)),
  setSelectedImageGroups: dataFileIds => dispatch(setSelectedImageGroups(dataFileIds)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
