import { connect } from 'react-redux';

import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { displayError } from 'components/notifications/actions';
import { setSelectedImageGroups } from '../actions';
import Component from './component';

const mapStateToProps = (state, { imageGroups }) => {
  const { imageGrid, user, routes: { query } } = state;
  const selectedImageGroups = imageGroups.filter(
    (_, index) => imageGrid.selectedImageGroups.indexOf(index) !== -1
  );
  const images = selectedImageGroups.reduce((res, group) => [...res, ...group], []);
  const projectsPermissions = user.permissions.projects;
  return {
    tab: query.tab,
    isBurstModeActive: imageGrid.filters.timeStep > 0,
    selectedImageGroups,
    isProjectTagger: images.every(image => projectsPermissions[image.deployment.projectId].role === 'PROJECT_TAGGER'),
    // NOTE: in a bursts, photos for various projects could be present.
    // The user might not have same permissions for all of those projects, so here
    // we check the user has the permission to add an identification for all of them
    canIdentify: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.IDENTIFICATION_CREATE
    )),
    canHighlight: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.DATA_FILE_UPDATE
    )),
  };
};

const mapDispatchToProps = dispatch => ({
  setSelectedImageGroups: dataFileIds => dispatch(setSelectedImageGroups(dataFileIds)),
  displayError: notification => dispatch(displayError(notification)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
