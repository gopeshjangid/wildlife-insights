import { connect } from 'react-redux';
import { uniq } from 'lodash';

import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { setSelectedBurstImageGroups } from 'components/images/grid/actions';
import {
  confirmedBurstIdentificationsSelector,
  getEntityConfirmedIdentifications
} from '../../selectors';
import {
  copyCnfIdentificationOfSelectedImage,
  copyConfirmedIdentificationInBurst,
  setEditingState,
  acceptConfirmedIdentification,
  acceptConfirmedIdentificationInBurst,
  applyIdentificationToAllInBurst,
  markAsBlank,
  markAsBlankInBurst,
  createEmptyUserIdentification,
  closePreviewAndSidebar,
  moveToNextImageGroup
} from '../../actions';

import Component from './component';

const mapStateToProps = (state, { images }) => {
  const {
    identify,
    routes: { query },
    imageGrid,
    user
  } = state;
  const tab = query.tab;
  const isBurst = imageGrid.filters.timeStep > 0;
  const isSequenceProject = imageGrid.projectType === 'sequence';
  const selectedBurstImageGroups = imageGrid.selectedBurstImageGroups || [];
  const isSingleBurstPreview = imageGrid.isSingleBurstPreview;
  const entityKeyId = isSequenceProject ? 'sequenceId' : 'id';
  const bulkSelectedIdsInBurst = selectedBurstImageGroups.length && images.length ?
    uniq(
      selectedBurstImageGroups.map(index => {
        return images[index] && (images[index])[entityKeyId];
      })
    ) : null;

  return {
    image: images.length ? images[imageGrid.selectedImageIndex] : null,
    isBurst,
    selectedBurstImageGroups,
    isSingleBurstPreview,
    isSequenceProject,
    confirmedIdentifications: !isBurst || (isSingleBurstPreview && !isSequenceProject)
      ? getEntityConfirmedIdentifications(
        identify,
        images.length && images[imageGrid.selectedImageIndex] ?
          (images[imageGrid.selectedImageIndex])[entityKeyId] : null
      )
      : confirmedBurstIdentificationsSelector(
        identify,
        bulkSelectedIdsInBurst,
        tab,
        isSequenceProject
      ),
    tab,
    // NOTE: in a bursts, photos for various projects could be present.
    // The user might not have same permissions for all of those projects, so here
    // we check the user has the permission to add an identification for all of them
    canIdentify: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.IDENTIFICATION_CREATE
    )),
    projectsPermissions: user.permissions.projects
  };
};

const mapDispatchToProps = (dispatch, { images }) => ({
  onClickEditIdentification: () => {
    //dispatch(copyConfirmedIdentification());
    dispatch(copyCnfIdentificationOfSelectedImage(images));
    dispatch(setEditingState());
  },
  onClickEditIdentificationInBurst: identifications => {
    dispatch(copyConfirmedIdentificationInBurst({ identifications }));
    dispatch(setEditingState());
  },
  onClickAddIdentification: () => {
    dispatch(createEmptyUserIdentification());
    dispatch(setEditingState());
  },
  onClickAccept: () => dispatch(acceptConfirmedIdentification(images)),
  onClickAcceptInBurst: identification => {
    dispatch(acceptConfirmedIdentificationInBurst(images, identification));
  },
  onClickApplyToAllInBurst: identification => {
    dispatch(applyIdentificationToAllInBurst(images, identification));
  },
  onClickMarkAsBlank: () => dispatch(markAsBlank(images)),
  onClickMarkAsBlankInBurst: identification => {
    dispatch(markAsBlankInBurst(images, identification));
  },
  moveToNextImageGroup: () => dispatch(moveToNextImageGroup()),
  closePreviewAndSidebar: () => dispatch(closePreviewAndSidebar()),
  onCancelBulkSelection: () => dispatch(setSelectedBurstImageGroups([]))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
