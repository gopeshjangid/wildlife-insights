import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { refetchGetDataFiles } from 'lib/initApollo';
import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { displayError } from 'components/notifications/actions';
import Component from './component';

import deleteImage from './delete-image.graphql';

const mapStateToProps = (state, { imageGroups }) => {
  const { imageGrid, user, routes: { query } } = state;
  const images = exists(imageGrid.selectedImageGroupIndex)
    && imageGroups.length
    && exists(imageGroups[imageGrid.selectedImageGroupIndex])
    ? imageGroups[imageGrid.selectedImageGroupIndex]
    : [];

  return {
    images,
    isBurst: imageGrid.filters.timeStep > 0,
    isSingleBurstPreview: imageGrid.isSingleBurstPreview,
    tab: query.tab,
    projectsPermissions: user.permissions.projects,
    image: images.length ? images[imageGrid.selectedImageIndex] : null,
    canHighlight: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.DATA_FILE_UPDATE
    )),
    canDelete: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.DATA_FILE_DELETE
    )),
    isLastImageGroup: !exists(imageGrid.selectedImageGroupIndex)
      || !imageGroups.length
      || imageGroups.length === imageGrid.selectedImageGroupIndex + 1,
  };
};

const mapDispatchToProps = dispatch => ({
  displayError: notification => dispatch(displayError(notification)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  graphql(deleteImage, {
    name: 'deleteImage',
    // @ts-ignore
    options: ({ image }) => ({
      variables: {
        projectId: image && +image.deployment.projectId,
        id: image && +image.id,
      },
      // Needs to be a function because of a bug of apollo-client:
      // https://github.com/apollographql/apollo-client/issues/3540#issuecomment-441288962
      refetchQueries: refetchGetDataFiles,
    }),
  })
)(Component);
