import { get, takeRight, uniq } from 'lodash';

import { MAX_IMAGEGRID_PAGESIZE } from 'utils/app-constants';
import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type any */(actions.reset)]: (state) => ({
    ...initialState,
    disableConfirmHumanPhotoDeletionPopup: state.disableConfirmHumanPhotoDeletionPopup
  }),
  [/** @type any */(actions.fetchIdentifications.START)]: state => ({
    ...state,
    state: 'loading',
    identificationsPerPhoto: {},
    confirmedIdslabels: {}
  }),
  [/** @type any */(actions.fetchIdentifications.SUCCEEDED)]: (
    state,
    { payload }
  ) => {
    const numberedLabelsPerTaxonomyId = {};
    const identificationsPerPhoto = payload
      // We merge the results of the different queries
      // As a reminder, each query represent the identifications of the photos of one project
      .reduce((res, { data }) => {
        // identificationOutputs for image based projects are based on 'dataFileId' and for 
        // sequence based projects they are based on 'sequenceId'

        let entityKey, identifications;
        if (data?.getSequenceIdentificationOutputs) {
          entityKey = 'sequenceId';
          identifications = data?.getSequenceIdentificationOutputs?.data || [];
        } else {
          entityKey = 'dataFileId';
          identifications = data?.getIdentificationOutputs?.data || [];
        }

        if (!identifications.length) {
          return { ...res };
        }

        return {
          ...res,
          ...identifications.reduce((accumulatedRes, image) => {
            // get taxonomyIds of the confirmed identifications, to be used 
            // in numberedLabelsPerTaxonomyId.
            if (!accumulatedRes[image[entityKey]]) {
              const identifiedObjects = image?.identifiedObjects || [];
              for (let i = 0; i < identifiedObjects.length; i++) {
                numberedLabelsPerTaxonomyId[identifiedObjects[i].taxonomyId] = 1;
              }
            }

            return ({
              ...accumulatedRes,
              // The image might appear more than once because it might have several identifications
              [image[entityKey]]: [
                ...(accumulatedRes[image[entityKey]] || []),
                image,
              ],
            })
          }, {}),
        };
      }, {});

    // update taxonomy Ids dict for numbered labels
    let cnt = 1;
    Object.keys(numberedLabelsPerTaxonomyId).forEach((taxId) => {
      numberedLabelsPerTaxonomyId[taxId] = cnt++;
    });

    return ({
      ...state,
      state: 'loaded',
      identificationsPerPhoto,
      confirmedIdslabels: numberedLabelsPerTaxonomyId
    })
  },
  [/** @type any */(actions.fetchIdentifications.FAILED)]: state => ({
    ...state,
    state: 'error',
    identificationsPerPhoto: {},
    confirmedIdslabels: {}
  }),
  [/** @type any */(actions.createEmptyUserIdentification)]: (state, { payload }) => {
    // entityIds (dataFileId or sequenceId of an image) : are used for identification 
    // of images in burst mode. if available as part of payload to this function use 
    // that. else use the one available in userIdentification
    const imagesEntityIds = get(payload, 'entityIds')
      || get(state, 'userIdentification.entityIds');

    return ({
      ...state,
      // NOTE: the ID of the identified object is only
      // used as a key in React
      userIdentification: {
        blankYn: false,
        identificationMethodId: 1,
        identifiedObjects: [{ id: 0, count: 1 }],
        ...(
          imagesEntityIds
            ? {
              entityIds: imagesEntityIds
            }
            : {}
        )
      }
    });
  },
  [/** @type any */(actions.copyConfirmedIdentification)]: (state, { payload }) => {
    return ({
      ...state,
      userIdentification: {
        ...payload
      }
    })
  },
  [/** @type any */(actions.copyConfirmedIdentificationInBurst)]: (state, { payload }) => {
    let isAnyNonBlankIdentification = false;
    let entityIds = [];
    let idObjs = [];

    const confirmedIdentifications = payload.identifications || [];

    confirmedIdentifications.forEach(identification => {
      entityIds = [...entityIds, ...identification.entityIds];
      idObjs = [...idObjs, ...identification.identifiedObjects]
      if (!identification.blankYn) {
        isAnyNonBlankIdentification = true;
      }
    });

    return ({
      ...state,
      userIdentification: {
        ...confirmedIdentifications[0],
        ...(
          isAnyNonBlankIdentification
            ? {
              blankYn: false
            }
            : {}
        ),
        identifiedObjects: idObjs,
        entityIds
      }
    });
  },
  [/** @type any */(actions.addIdentifiedObject)]: state => ({
    ...state,
    userIdentification: {
      ...state.userIdentification,
      blankYn: false,
      identifiedObjects: [
        ...state.userIdentification.identifiedObjects,
        // The ID is just used by React as a key
        { id: state.userIdentification.identifiedObjects.length },
      ]
    }
  }),
  [/** @type any */(actions.removeIdentifiedObject)]: (state, { payload }) => {
    const { userIdentification } = state;

    const newIdentifiedObjects = [...userIdentification.identifiedObjects];
    newIdentifiedObjects.splice(payload, 1);

    return {
      ...state,
      userIdentification: {
        ...userIdentification,
        identifiedObjects: newIdentifiedObjects
      }
    };
  },
  [/** @type any */(actions.changeIdentifiedObject)]: (state, { payload }) => {
    const { userIdentification } = state;

    const newIdentifiedObjects = [
      ...userIdentification.identifiedObjects.slice(0, payload.id),
      Object.assign(
        {},
        userIdentification.identifiedObjects[payload.id],
        payload.identification.identifiedObjects[0],
      ),
      ...(payload.id + 1 < userIdentification.identifiedObjects.length
        ? userIdentification.identifiedObjects.slice(
          payload.id + 1,
          userIdentification.identifiedObjects.length
        )
        : []
      ),
    ];

    return {
      ...state,
      userIdentification: {
        ...userIdentification,
        identifiedObjects: newIdentifiedObjects
      }
    };
  },
  [/** @type any */(actions.setLoadedState)]: state => ({
    ...state,
    state: 'loaded'
  }),
  [/** @type any */(actions.setEditingState)]: (state) => {
    if (state.state === 'loaded' || state.state === 'history') {
      return { ...state, state: 'editing' };
    }
    return state;
  },
  [/** @type any */(actions.setHistoryState)]: (state) => {
    if (state.state === 'editing') {
      return { ...state, state: 'history' };
    }
    return state;
  },
  [/** @type any */(actions.setDisableConfirmHumanPhotoDeletionPopup)]: (state, { payload }) => ({
    ...state,
    disableConfirmHumanPhotoDeletionPopup: payload
  }),
  [/** @type any */(actions.setClassifiedSeqIds)]: (state, { payload }) => {
    let updatedIds = uniq([...state.seqIdsClassifiedByUser, ...payload]);
    if (updatedIds.length > MAX_IMAGEGRID_PAGESIZE) {
      updatedIds = takeRight(updatedIds, MAX_IMAGEGRID_PAGESIZE);
    }
    return ({
      ...state,
      seqIdsClassifiedByUser: updatedIds
    })
  },
  [/** @type any */(actions.resetClassifiedSeqIds)]: (state) => ({
    ...state,
    // on click of "save and next", screen flashes with old sequenceId data for 
    // a moment before displaying next sequence id data. to prevent this, leaving 
    // last sequencId in the array
    seqIdsClassifiedByUser: takeRight(state.seqIdsClassifiedByUser, 1)
  }),
};
