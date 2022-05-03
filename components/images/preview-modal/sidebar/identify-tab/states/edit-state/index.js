import { connect } from 'react-redux';

import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import {
  addIdentifiedObject,
  removeIdentifiedObject,
  changeIdentifiedObject,
  createEmptyUserIdentification,
  setHistoryState,
  markAsBlank,
  markAsBlankInBurst,
  saveUserIdentification,
  setLoadedState,
  fetchIdentifications
} from '../../actions';
import { setSelectedBurstImageGroups } from 'components/images/grid/actions';
import Component from './component';

const mapStateToProps = (state, { images }) => {
  const { identify, imageGrid } = state;

  const isSingleBurstPreview = imageGrid.isSingleBurstPreview;
  const isBurst = imageGrid.filters.timeStep > 0;

  return {
    image: images.length ? images[imageGrid.selectedImageIndex] : null,
    identification: identify.userIdentification,
    isBurst,
    isSingleBurstPreview,
    idForTaxonomyLookup: Array.isArray(images) && images.length > 0
      ? +images[0].deployment.projectId : null,
    // NOTE: in a bursts, photos for various projects could be present.
    // The user might not have same permissions for all of those projects, so here
    // we check the user has the permission to add an identification for all of them
    canIdentify: images.every(image => can(
      permissionsSelector(state),
      'project',
      image.deployment.projectId,
      PERMISSIONS.IDENTIFICATION_CREATE
    )),
  };
};

const mapDispatchToProps = (dispatch, { images }) => ({
  onClickAddAnimal: () => dispatch(addIdentifiedObject()),
  onRemoveIdentifiedObject: id => dispatch(removeIdentifiedObject(id)),
  onChangeIdentifiedObject: (id, identification) => dispatch(changeIdentifiedObject({ id, identification })),
  onClickHistory: () => dispatch(setHistoryState()),
  onClickMarkAsBlank: () => dispatch(markAsBlank(images)),
  onClickMarkAsBlankInBurst: identification => {
    dispatch(markAsBlankInBurst(images, identification));
  },
  onClickSave: () => dispatch(saveUserIdentification(images)),
  onClickCancelEdit: () => {
    dispatch(setSelectedBurstImageGroups([]));
    dispatch(setLoadedState());
    dispatch(fetchIdentifications(images));
  },
  onClickRemoveAllIds: () => {
    dispatch(createEmptyUserIdentification());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
