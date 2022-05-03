import React, { Fragment } from 'react';
import { createAction, createActionThunk } from 'vizzuality-redux-tools';
import { uniq, get } from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { getAuthApolloClient } from 'lib/initApollo';
import { GQL_DEFAULT } from 'utils/app-constants';
import { Link } from 'lib/routes';
import { exists } from 'utils/functions';
import { setTaxonomyIdsToSessionStorage } from 'utils/storage-helpers';
import {
  displaySuccess,
  displayError,
  displayWarning,
  displayInfo,
  removeNotification,
} from 'components/notifications/actions';
import {
  setSelectedBurstImageGroups,
  setSelectedImageGroupIndex,
  setSelectedImageIndex,
  setIsSingleBurstPreview,
  setAnyImageClassfied,
  setForceImageRefetch
} from 'components/images/grid/actions';
import { reset as resetPreviewModal } from 'components/images/preview-modal/actions';

import { getEntityConfirmedIdentifications } from './selectors';
import {
  createIdentification,
  createIdentificationInBurst,
  containsHuman,
  getImagesThatNeedDeletionIfIdentifiedWithHumans,
  getUniqueProjectIds
} from './helpers';
import { MAX_ANIMAL_COUNT } from './constants';

import getIdentifications from './identifications.graphql';
import getSequenceIdentifications from './sequence-identifications.graphql';

export const reset = createAction('identify/reset');
export const setDisableConfirmHumanPhotoDeletionPopup = createAction(
  'identify/setDisableConfirmHumanPhotoDeletionPopup'
);

// @ts-ignore
export const fetchIdentifications = createActionThunk(
  'identify/fetchIdentifications',
  (images, { getState }) => {
    const state = getState();
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';
    const imagesPerProject = images.reduce((res, image) => {
      const { projectId } = image.deployment;
      if (!res[projectId]) {
        res[projectId] = [];
      }
      res[projectId].push(isSequenceProject ? +image.sequenceId : +image.id);
      return res;
    }, {});

    const client = getAuthApolloClient(GQL_DEFAULT);

    // There will be one request per project
    // Each promise may return the photo several times: each for one of its identifications
    const entityKey = isSequenceProject ? 'sequenceId' : 'dataFileId';
    const promises = Object.keys(imagesPerProject).map(projectId => client.query({
      query: isSequenceProject ? getSequenceIdentifications : getIdentifications,
      variables: {
        projectId: +projectId,
        [entityKey]: isSequenceProject ? uniq(imagesPerProject[projectId])
          : imagesPerProject[projectId],
      },
    }));

    return Promise.all(promises);
  });

export const createEmptyUserIdentification = createAction(
  'identify/createEmptyUserIdentification'
);

export const copyConfirmedIdentification = createAction(
  'identify/copyConfirmedIdentification'
);

export const copyConfirmedIdentificationInBurst = createAction(
  'identify/copyConfirmedIdentificationInBurst'
);

export const addIdentifiedObject = createAction('identify/addIdentifiedObject');

export const removeIdentifiedObject = createAction('identify/removeIdentifiedObject');

export const changeIdentifiedObject = createAction('identify/changeIdentifiedObject');

export const setLoadedState = createAction('identify/setLoadedState');

export const setEditingState = createAction('identify/setEditingState');

export const setHistoryState = createAction('identify/setHistoryState');

export const setClassifiedSeqIds = createAction('identify/setClassifiedSeqIds');

export const resetClassifiedSeqIds = createAction('identify/resetClassifiedSeqIds');

// @ts-ignore
export const closePreviewAndSidebar = createActionThunk(
  'identify/closePreviewAndSidebar',
  ({ dispatch }) => {
    dispatch(resetPreviewModal());
    dispatch(setSelectedImageGroupIndex(null));
    dispatch(setSelectedImageIndex(0));
    dispatch(setIsSingleBurstPreview(false));
    dispatch(setForceImageRefetch(true));
    dispatch(reset());
  }
);

// @ts-ignore
export const clearClassifiedSeqIds = createActionThunk(
  'identify/clearClassifiedSeqIds',
  ({ dispatch, getState }) => {
    const state = getState();
    const { tab } = state.routes.query;
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';
    if (isSequenceProject && tab === 'identify') {
      dispatch(resetClassifiedSeqIds());
    }
  }
);

// @ts-ignore
export const copyCnfIdentificationOfSelectedImage = createActionThunk(
  'identify/copyCnfIdentificationOfSelectedImage',
  (images, { dispatch, getState }) => {
    const state = getState();
    const image = images[state.imageGrid.selectedImageIndex];
    const isSequenceProject = state.imageGrid.projectType === 'sequence';
    const confirmedIdentification = getEntityConfirmedIdentifications(
      state.identify,
      isSequenceProject ? image.sequenceId : image.id
    )[0];
    dispatch(copyConfirmedIdentification(confirmedIdentification));
  }
);

// @ts-ignore
export const moveToNextImageGroup = createActionThunk(
  'identify/moveToNextImageGroup',
  ({ dispatch, getState }) => {
    const state = getState();
    const anyImageClassfied = state.imageGrid.anyImageClassfied;
    const tab = state.routes.query;
    const selectedImageGroupIndex = state.imageGrid.selectedImageGroupIndex;
    if (!anyImageClassfied || tab === 'catalogued') {
      dispatch(setSelectedImageGroupIndex(selectedImageGroupIndex + 1));
    } else {
      dispatch(setForceImageRefetch(true));
    }

    dispatch(setIsSingleBurstPreview(false));
    dispatch(clearClassifiedSeqIds());
  }
);

// @ts-ignore
export const displaySuccessNotification = createActionThunk(
  'identify/displaySuccessNotification',
  ({ dispatch, getState }) => {
    const state = getState();
    const { organizationId, initiativeId, projectId } = state.routes.query;

    /**
     * Truth table:
     *
     *  organizationId | initiativeId | projectId | ROUTE
     *  ---------------|--------------|-----------|------
     *  0              | 0            | 0         | overview
     *  0              | 0            | 1         | X
     *  0              | 1            | 0         | initiatives_show
     *  0              | 1            | 1         | X
     *  1              | 0            | 0         | organizations_show
     *  1              | 0            | 1         | projects_show
     *  1              | 1            | 0         | X
     *  1              | 1            | 1         | projects_initiative_show
     */

    let route = null;
    if (!exists(organizationId) && !exists(initiativeId) && !exists(projectId)) {
      route = 'overview';
    } else if (!exists(organizationId) && exists(initiativeId) && !exists(projectId)) {
      route = 'initiatives_show';
    } else if (exists(organizationId) && !exists(initiativeId) && !exists(projectId)) {
      route = 'organizations_show';
    } else if (exists(organizationId) && !exists(initiativeId) && exists(projectId)) {
      route = 'projects_show';
    } else if (exists(organizationId) && exists(initiativeId) && exists(projectId)) {
      route = 'projects_initiative_show';
    }

    dispatch(
      displaySuccess({
        children: (
          <span className="notification-title">
            Photo(s) moved to{' '}
            <Link
              route={route}
              params={{ tab: 'catalogued', organizationId, initiativeId, projectId }}
            >
              <a>Catalogued</a>
            </Link>
          </span>
        ),
      })
    );
  }
);

// @ts-ignore
export const displayDeletionConfirmationNotification = createActionThunk(
  'idenfity/displayDeletionConfirmationNotification',
  (images, onContinue, onCancel, { dispatch }) => {
    const dataFilesSubjectsToDeletion = getImagesThatNeedDeletionIfIdentifiedWithHumans(images);
    const uniqueProjectIds = getUniqueProjectIds(dataFilesSubjectsToDeletion);
    const uid = `identification-deletation-confirmation-${dataFilesSubjectsToDeletion.map(
      d => d.id
    )}`;

    dispatch(
      displayInfo({
        uid,
        autoDismiss: 0,
        dismissible: false,
        message: (
          <Fragment>
            <div className="notification-title">
              {dataFilesSubjectsToDeletion.length === images.length && (
                <span>
                  The {images.length > 1 ? `${images.length} ` : ''}photo
                  {images.length > 1 ? 's' : ''} will be deleted
                </span>
              )}
              {dataFilesSubjectsToDeletion.length !== images.length && (
                <span>
                  {dataFilesSubjectsToDeletion.length} of the {images.length} photos will be deleted
                </span>
              )}
            </div>
            <div className="notification-message notification-action">
              {uniqueProjectIds.length === 1 && (
                <span>
                  The project is configured so images containing humans are automatically deleted.
                </span>
              )}
              {uniqueProjectIds.length > 1 && (
                <span>
                  The images belong to projects configured so that if they contains humans, they are
                  automatically deleted.
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm notification-action-button"
              onClick={() => onContinue(uid)}
            >
              Continue
            </button>
            <button
              type="button"
              className="notification-close-button"
              aria-label="Cancel action"
              onClick={() => onCancel(uid)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </Fragment>
        ),
      })
    );
  }
);

// @ts-ignore
export const displayDeletionSuccessNotification = createActionThunk(
  'identify/displayDeletionSuccessNotification',
  (images, { dispatch }) => {
    const dataFilesSubjectsToDeletion = getImagesThatNeedDeletionIfIdentifiedWithHumans(images);

    dispatch(
      displaySuccess({
        title: `The photo${dataFilesSubjectsToDeletion.length > 1 ? 's' : ''} ha${dataFilesSubjectsToDeletion.length > 1 ? 've' : 's'
          } been deleted`,
      })
    );
  }
);

// @ts-ignore
export const acceptIdentification = createActionThunk(
  'identify/acceptIdentification',
  (images, identification, { dispatch, getState }) => {
    const state = getState();
    const { tab } = state.routes.query;
    const { identify } = state;
    const { disableConfirmHumanPhotoDeletionPopup } = identify;

    const isSequenceProject = state.imageGrid?.projectType === 'sequence';

    const imagesToConsider = state.imageGrid.isSingleBurstPreview ?
      [images[state.imageGrid.selectedImageIndex]] : images;

    if (isSequenceProject && hasNoValidSequencId(images, dispatch)) {
      return null;
    }

    const identificationContainsHumans = containsHuman(identification);

    let dataFilesSubjectsToDeletion = [];
    if (identificationContainsHumans) {
      dataFilesSubjectsToDeletion = getImagesThatNeedDeletionIfIdentifiedWithHumans(imagesToConsider);
    }

    const dataFilesNeedDeletion = identificationContainsHumans
      && !!dataFilesSubjectsToDeletion.length;

    return new Promise((resolve, reject) => {
      if (!dataFilesNeedDeletion || disableConfirmHumanPhotoDeletionPopup) {
        resolve();
      } else {
        dispatch(displayDeletionConfirmationNotification(imagesToConsider, resolve, reject));
      }
    })
      .then((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      })
      .then(() => createIdentification(imagesToConsider, identification, isSequenceProject)
        .then(() => {
          // in non-burst mode, display message either for human images 
          // deleted or images moved to catalogued
          if (dataFilesNeedDeletion) {
            dispatch(displayDeletionSuccessNotification(imagesToConsider));
            dispatch(setDisableConfirmHumanPhotoDeletionPopup(true));
          } else if (tab !== 'catalogued') {
            dispatch(displaySuccessNotification());

            // We do not fetch the identifications for the next photos here because the photos are
            // refetched asynchronously
            // The identifications are fetched again in the StaticState component
          }
        })
        .catch(() => {
          dispatch(
            displayError({
              title: 'Unable to save the identification',
              message: 'Please try again in a few minutes.',
            })
          );
        }))
      .catch((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      });
  }
);

// @ts-ignore
export const acceptConfirmedIdentification = createActionThunk(
  'identify/acceptConfirmedIdentification',
  (images, { dispatch, getState }) => {
    const state = getState();
    const image = images[state.imageGrid.selectedImageIndex];
    const isSequenceProject = state.imageGrid.projectType === 'sequence';
    const confirmedIdentification = getEntityConfirmedIdentifications(
      state.identify,
      isSequenceProject ? image.sequenceId : image.id
    )[0];
    dispatch(acceptIdentification(images, confirmedIdentification));
  }
);

// @ts-ignore
export const acceptIdentificationInBurst = createActionThunk(
  'identify/acceptIdentificationInBurst',
  (images, identification, { dispatch, getState }) => {
    const state = getState();
    const { tab } = state.routes.query;
    const { disableConfirmHumanPhotoDeletionPopup } = state.identify;
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';
    const entityKeyId = isSequenceProject ? 'sequenceId' : 'id';

    const imagesToConsider = images.filter(image => {
      return (identification.entityIds.indexOf(+image[entityKeyId]) !== -1)
        || (identification.entityIds.indexOf(image[entityKeyId]) !== -1);
    });

    if (isSequenceProject && hasNoValidSequencId(images, dispatch)) {
      return null;
    }

    const identificationContainsHumans = containsHuman(identification);

    let dataFilesSubjectsToDeletion = [];
    if (identificationContainsHumans) {
      dataFilesSubjectsToDeletion = getImagesThatNeedDeletionIfIdentifiedWithHumans(imagesToConsider);
    }

    const dataFilesNeedDeletion = identificationContainsHumans
      && !!dataFilesSubjectsToDeletion.length;

    return new Promise((resolve, reject) => {
      if (!dataFilesNeedDeletion || disableConfirmHumanPhotoDeletionPopup) {
        resolve();
      } else {
        dispatch(displayDeletionConfirmationNotification(imagesToConsider, resolve, reject));
      }
    })
      .then((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      })
      .then(() => manageBurstIdentifications(
        imagesToConsider,
        identification,
        isSequenceProject,
        tab,
        dispatch
      )
        .then(() => {
          if (dataFilesNeedDeletion) {
            dispatch(setDisableConfirmHumanPhotoDeletionPopup(true));
          }

          if (tab !== 'catalogued') {
            dispatch(setLoadedState());
            dispatch(fetchIdentifications(images));

            // We do not fetch the identifications for the next photos here because the photos are
            // refetched asynchronously
            // The identifications are fetched again in the StaticState component
          }
        })
        .catch(() => {
          dispatch(
            displayError({
              title: 'Unable to save the identification',
              message: 'Please try again in a few minutes.',
            })
          );
        }))
      .catch((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      });
  }
);

// @ts-ignore
export const acceptConfirmedIdentificationInBurst = createActionThunk(
  'identify/acceptConfirmedIdentificationInBurst',
  (images, identification, { dispatch }) => {
    dispatch(acceptIdentificationInBurst(images, identification));
  }
);

// @ts-ignore
export const applyIdentificationToAllInBurst = createActionThunk(
  'identify/applyIdentificationToAll',
  (images, identification, { dispatch, getState }) => {
    const state = getState();
    const { tab } = state.routes.query;
    const { disableConfirmHumanPhotoDeletionPopup } = state.identify;
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';

    if (isSequenceProject && hasNoValidSequencId(images, dispatch)) {
      return null;
    }

    const identificationContainsHumans = containsHuman(identification);

    let dataFilesSubjectsToDeletion = [];
    if (identificationContainsHumans) {
      dataFilesSubjectsToDeletion = getImagesThatNeedDeletionIfIdentifiedWithHumans(images);
    }

    const dataFilesNeedDeletion = identificationContainsHumans
      && !!dataFilesSubjectsToDeletion.length;

    return new Promise((resolve, reject) => {
      if (!dataFilesNeedDeletion || disableConfirmHumanPhotoDeletionPopup) {
        resolve();
      } else {
        dispatch(displayDeletionConfirmationNotification(images, resolve, reject));
      }
    })
      .then((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      })
      .then(() => manageBurstIdentifications(
        images,
        identification,
        isSequenceProject,
        tab,
        dispatch
      )
        .then(() => {
          if (dataFilesNeedDeletion) {
            dispatch(setDisableConfirmHumanPhotoDeletionPopup(true));
          }

          if (tab !== 'catalogued') {
            dispatch(setLoadedState());
            dispatch(fetchIdentifications(images));
          }
        })
        .catch(() => {
          dispatch(
            displayError({
              title: 'Unable to save the identification',
              message: 'Please try again in a few minutes.',
            })
          );
        }))
      .catch((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      });
  }
);

// @ts-ignore
export const markAsBlank = createActionThunk(
  'identify/markAsBlank',
  (images, { dispatch, getState }) => {
    const state = getState();
    const imagesToConsider = state.imageGrid.isSingleBurstPreview ?
      [images[state.imageGrid.selectedImageIndex]] : images;
    const { tab } = state.routes.query;
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';

    if (isSequenceProject && hasNoValidSequencId(images, dispatch)) {
      return null;
    }

    const identification = {
      blankYn: true,
      identificationMethodId: 1,
      identifiedObjects: [],
    };

    return createIdentification(
      imagesToConsider,
      identification,
      isSequenceProject
    )
      .then(() => {
        if (tab !== 'catalogued') {
          dispatch(displaySuccessNotification());
        } else {
          dispatch(setLoadedState());
          dispatch(fetchIdentifications(images));
        }
      })
      .catch(() => {
        dispatch(
          displayError({
            title: 'Unable to mark the photo as blank',
            message: 'Please try again in a few minutes.',
          })
        );
      });
  }
);

// @ts-ignore
export const markAsBlankInBurst = createActionThunk(
  'identify/markAsBlankInBurst',
  (images, identificationBurst, { dispatch, getState }) => {
    const state = getState();
    const { tab } = state.routes.query;
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';
    const entityKeyId = isSequenceProject ? 'sequenceId' : 'id';

    const imagesToConsider = images.filter(image => {
      return (identificationBurst.entityIds.indexOf(+image[entityKeyId]) !== -1)
        || (identificationBurst.entityIds.indexOf(image[entityKeyId]) !== -1);
    });

    if (isSequenceProject && hasNoValidSequencId(images, dispatch)) {
      return null;
    }

    const identification = {
      blankYn: true,
      identificationMethodId: 1,
      identifiedObjects: [],
    };

    return manageBurstIdentifications(
      imagesToConsider,
      identification,
      isSequenceProject,
      tab,
      dispatch
    )
      .then(() => {
        dispatch(setSelectedBurstImageGroups([]));
        dispatch(setLoadedState());
        dispatch(fetchIdentifications(images));
      })
      .catch(() => {
        dispatch(
          displayError({
            title: 'Unable to mark the photo as blank',
            message: 'Please try again in a few minutes.',
          })
        );
      });
  }
);

// @ts-ignore
export const saveUserIdentification = createActionThunk(
  'identify/saveUserIdentification',
  (images, { dispatch, getState }) => {
    const state = getState();
    const isSequenceProject = state.imageGrid?.projectType === 'sequence';
    const isBurst = state.imageGrid.filters.timeStep > 0;
    const isSingleBurstPreview = state.imageGrid.isSingleBurstPreview;
    const entityKeyId = isSequenceProject ? 'sequenceId' : 'id';

    const { tab } = state.routes.query;
    const { userIdentification, disableConfirmHumanPhotoDeletionPopup } = state.identify;
    const imagesToConsider = (isBurst && !isSingleBurstPreview) ? images.filter(image => {
      return (userIdentification.entityIds.indexOf(+image[entityKeyId]) !== -1)
        || (userIdentification.entityIds.indexOf(image[entityKeyId]) !== -1);
    }) : (
      isSingleBurstPreview ? [images[state.imageGrid.selectedImageIndex]] : images
    );

    const emptyIdentification = userIdentification.identifiedObjects.some(
      identifiedObject => !exists(identifiedObject.taxonomyId)
    );

    if (emptyIdentification) {
      dispatch(
        displayWarning({
          title: 'Empty identification',
          message: 'You must select a family, genus or species for each of the cards.',
        })
      );
      return null;
    }

    const totalAnimalCount = userIdentification.identifiedObjects.map((identifiedObject) => {
      return identifiedObject.count ? identifiedObject.count : 0;
    }).reduce((total, cur) => {
      return total + cur;
    }, 0);

    if (totalAnimalCount > MAX_ANIMAL_COUNT) {
      dispatch(
        displayWarning({
          title: `Not more than ${MAX_ANIMAL_COUNT} identified objects allowed`,
          message: `Identified objects should be less than ${MAX_ANIMAL_COUNT}.`,
        })
      );
      return null;
    }

    // check for sequence based images, 
    // if they all have valid sequenceId
    if (isSequenceProject && hasNoValidSequencId(images, dispatch)) {
      return null;
    }

    const identificationContainsHumans = containsHuman(userIdentification);

    let dataFilesSubjectsToDeletion = [];
    if (identificationContainsHumans) {
      dataFilesSubjectsToDeletion = getImagesThatNeedDeletionIfIdentifiedWithHumans(
        imagesToConsider
      );
    }

    const dataFilesNeedDeletion = identificationContainsHumans
      && !!dataFilesSubjectsToDeletion.length;

    return new Promise((resolve, reject) => {
      if (!dataFilesNeedDeletion || disableConfirmHumanPhotoDeletionPopup) {
        resolve();
      } else {
        dispatch(displayDeletionConfirmationNotification(imagesToConsider, resolve, reject));
      }
    })
      .then((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      })
      .then(() => {
        const identification = {
          blankYn: false,
          identificationMethodId: 1,
          identifiedObjects: userIdentification.identifiedObjects,
        };

        const createMethod = (isBurst && !isSingleBurstPreview) ?
          manageBurstIdentifications : createIdentification;

        return createMethod(imagesToConsider, identification, isSequenceProject, tab, dispatch)
          .then(() => {
            const uniqueProjectIds = uniq(imagesToConsider.map(image => {
              return +image.deployment.projectId;
            }));

            const uniqueTaxonomies = {};
            userIdentification.identifiedObjects.map(item => {
              uniqueTaxonomies[item.taxonomyId] = {
                ...item.taxonomy,
                uniqueIdentifier: item.taxonomyId
              };
            });
            // save most recent ids per project in browser storage
            setTaxonomyIdsToSessionStorage(uniqueProjectIds, uniqueTaxonomies);

            if (dataFilesNeedDeletion) {
              dispatch(setDisableConfirmHumanPhotoDeletionPopup(true));
            }

            // refresh data
            dispatch(setSelectedBurstImageGroups([]));
            dispatch(setLoadedState());
            dispatch(fetchIdentifications(images));
          })
          .catch(() => {
            dispatch(
              displayError({
                title: 'Unable to save the identification',
                message: 'Please try again in a few minutes.',
              })
            );
          });
      })
      .catch((uid) => {
        if (uid) {
          dispatch(removeNotification(uid));
        }
      });
  }
);

const hasNoValidSequencId = (images, dispatch) => {
  const noValidSequencId = images.some(
    image => !exists(image.sequenceId)
  );

  if (noValidSequencId) {
    dispatch(
      displayWarning({
        title: 'Invalid sequence type image',
        message: 'One or more of the images does not have valid sequenceId.',
      })
    );
  }
  return noValidSequencId;
};

const manageBurstIdentifications = (
  imagesToConsider,
  identification,
  isSequenceProject,
  tab,
  dispatch
) => {
  dispatch(setAnyImageClassfied(true));
  return createIdentificationInBurst(
    imagesToConsider,
    identification,
    isSequenceProject
  ).then((res) => {
    if (tab === 'identify' && isSequenceProject) {
      const savedData = get(res, 'data.createSequenceIdentificationOutputBulk');
      if (Array.isArray(savedData)) {
        const seqIds = savedData.map(d => +d.sequenceId);
        dispatch(setClassifiedSeqIds(seqIds));
      }
    }
    return res;
  });
};
