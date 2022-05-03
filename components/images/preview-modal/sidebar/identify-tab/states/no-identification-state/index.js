import { connect } from 'react-redux';
import { uniq } from 'lodash';

import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { SEQUENCE_PROJECT } from 'utils/app-constants';
import {
  setEditingState,
  createEmptyUserIdentification,
  markAsBlank,
  markAsBlankInBurst
} from '../../actions';
import Component from './component';

const mapStateToProps = (state, { images }) => {
  const projectType = state.imageGrid.projectType;
  // index position of bulk selected images (in burst mode)
  const selectedBurstImageGroups = state.imageGrid.selectedBurstImageGroups || [];
  const entityKeyId = projectType === SEQUENCE_PROJECT ? 'sequenceId' : 'id';
  // array of dataFileId or sequenceId (based on project-type)
  const bulkSelectedIdsInBurst = selectedBurstImageGroups.length && images.length ?
    uniq(
      selectedBurstImageGroups.map(index => {
        return images[index] && (images[index])[entityKeyId];
      })
    ) : null;

  return ({
    isBurst: state.imageGrid.filters.timeStep > 0,
    projectType,
    isSingleBurstPreview: state.imageGrid.isSingleBurstPreview,
    bulkSelectedIdsInBurst,
    selectedImageIndex: state.imageGrid.selectedImageIndex,
    // NOTE: in a bursts, photos for various projects could be present.
    // The user might not have same permissions for all of those projects, so here
    // we check the user has the permission to add an identification for all of them
    canIdentify: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.IDENTIFICATION_CREATE
    )),
  })
};

const mapDispatchToProps = (dispatch, { images }) => ({
  onClickAddIdentification: entityIds => {
    const hasImgEntityIds = Array.isArray(entityIds) && entityIds.length;

    dispatch(
      createEmptyUserIdentification({
        ...(
          hasImgEntityIds
            ? {
              entityIds: entityIds
            }
            : {}
        )
      })
    );
    dispatch(setEditingState());
  },
  onClickMarkAsBlank: () => dispatch(markAsBlank(images)),
  onClickMarkAsBlankInBurst: identification => {
    dispatch(markAsBlankInBurst(images, identification));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
