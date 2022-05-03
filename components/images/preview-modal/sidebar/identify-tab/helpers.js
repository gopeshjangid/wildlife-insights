import { cloneDeep, get, isArray, isPlainObject, omit, uniq } from 'lodash';
import isAfter from 'date-fns/isAfter';

import {
  getAuthApolloClient,
  refetchGetDataFiles
} from 'lib/initApollo';
import { GQL_DEFAULT, GQL_GET_DATA_FILES } from 'utils/app-constants';

import createBulkIdentification from 'components/images/grid/bulk-actions-panel/identification-tooltip/create-bulk-identification.graphql';
import createSequenceBulkIdentification from 'components/images/grid/bulk-actions-panel/identification-tooltip/create-sequence-bulk-identification.graphql';

export const HUMAN_TAXONOMY_GENUS = 'Homo';

/**
 * Return the confirmed identification out of the list of
 * identifications
 * @param {Array<Object>} identifications
 */
export const getConfirmedIdentification = (identifications) => {
  if (identifications.length === 0) {
    return null;
  }

  const sortedDESCIdentifications = [...identifications].sort((a, b) => {
    if (isAfter(new Date(b.timestamp), new Date(a.timestamp))) {
      return 1;
    }
    return -1;
  });

  return sortedDESCIdentifications[0];
};

/**
 * Create a new identification for the specified images/sequences in the API
 * @param {Array<Object>} images DataFiles to identify
 * @param {Object} paramIdentification Identification to create
 * @returns {Promise<any>}
 */
export const createIdentification = (images, paramIdentification, isSequenceProject = false) => {
  const client = getAuthApolloClient(GQL_DEFAULT);

  const identification = {
    ...paramIdentification,
    identifiedObjects: cloneDeep(paramIdentification?.identifiedObjects)
  };

  (identification.identifiedObjects).forEach((row, i) => {
    // count of identifiedObjects should be greater than 0
    if (!row.count) {
      identification.identifiedObjects[i].count = 1;
    }
  });

  let entityIdsKey = 'dataFileIds';
  let createMethod = createBulkIdentification;
  let entityIds;

  if (isSequenceProject) {
    entityIdsKey = 'sequenceIds';
    entityIds = uniq(images.map(({ sequenceId }) => +sequenceId));
    createMethod = createSequenceBulkIdentification;
  } else {
    entityIds = uniq(images.map(({ id }) => +id));
  }

  const body = {
    [entityIdsKey]: entityIds,
    identificationOutput: {
      blankYn: identification.blankYn,
      identificationMethodId: 1,
      // Some attributes of the object are only used by the UI
      // or by react-apollo and should not be sent
      identifiedObjects: identification.identifiedObjects.map(
        o => omit(o, ['id', 'confidence', 'taxonomy', '__typename']),
      ),
    }
  };

  return client.mutate({
    mutation: createMethod,
    variables: { body },
    refetchQueries: () => {
      refetchGetDataFiles();
      return ['getIdentifyPhotosCount'];
    },
  });
};

/**
 * Create a new identification in burst for the specified images/sequences in the API
 * @param {Array<Object>} images DataFiles to identify
 * @param {Object} paramIdentification Identification to create
 * @returns {Promise<any>}
 */
export const createIdentificationInBurst = (images, paramIdentification, isSequenceProject = false) => {
  const client = getAuthApolloClient(GQL_DEFAULT);

  const identification = {
    ...paramIdentification,
    identifiedObjects: cloneDeep(paramIdentification?.identifiedObjects)
  };
  (identification.identifiedObjects).forEach((row, i) => {
    // count of identifiedObjects should be greater than 0
    if (!row.count) {
      identification.identifiedObjects[i].count = 1;
    }
  });

  // creating identifications for image or sequence project are nearly similar, except for:
  // type of entity(dataFileIds or sequenceIds), entityIds(id of dataFiles or sequences)
  let entityIdsKey = 'dataFileIds';
  let createMethod = createBulkIdentification;
  let entityIds;

  if (isSequenceProject) {
    entityIdsKey = 'sequenceIds';
    entityIds = uniq(images.map(({ sequenceId }) => +sequenceId));
    createMethod = createSequenceBulkIdentification;
  } else {
    entityIds = uniq(images.map(({ id }) => +id));
  }

  const body = {
    [entityIdsKey]: entityIds,
    identificationOutput: {
      blankYn: identification.blankYn,
      identificationMethodId: 1,
      // Some attributes of the object are only used by the UI
      // or by react-apollo and should not be sent
      identifiedObjects: identification.identifiedObjects.map(
        o => omit(o, ['id', 'confidence', 'taxonomy', '__typename']),
      ),
    }
  };

  return client.mutate({
    mutation: createMethod,
    variables: { body },
    refetchQueries: () => [/*'getDataFiles',*/ 'getIdentifyPhotosCount'],
  });
};

/**
 * Return whether the identification contains a human
 * @param {Object} identification Identification
 * @returns {boolean}
 */
export const containsHuman = identification => identification.identifiedObjects.some(
  identifiedObject => identifiedObject.taxonomy?.genus === HUMAN_TAXONOMY_GENUS
);

/**
 * Return whether some of the images need to be deleted if they are identified with humans
 * @param {Array<Object>} images DataFiles
 * @returns {Array<Object>}
 */
export const getImagesThatNeedDeletionIfIdentifiedWithHumans = images => images.filter(image => image.deployment.project.deleteDataFilesWithIdentifiedHumans);

/**
 * Return the list of the projects the images belong to
 * @param {Array<Object>} images DataFiles
 * @returns {Array<string>}
 */
export const getUniqueProjectIds = images => images.map(image => image.deployment.projectId).filter((id, i, arr) => arr.indexOf(id) === i);

/**
 * Compares given identifiedObjects and returns true, if they have similar values for
 * taxonomyId, relativeAge, sex, markings, behavior, confidence and remarks
 * @param {Object} obj1 identifiedObject
 * @param {Object} obj2 identifiedObject
 * @returns {boolean}
 */
export const compareIdentifiedObjects = (obj1, obj2) => {
  if ((obj1.taxonomyId === obj2.taxonomyId)
    && (obj1.relativeAge === obj2.relativeAge)
    && (obj1.sex === obj2.sex)
    && (obj1.markings === obj2.markings)
    && (obj1.behavior === obj2.behavior)
    && (obj1.confidence === obj2.confidence)
    && (obj1.remarks === obj2.remarks)) {
    return true;
  }

  return false;
}

/**
 * For the given identificationOutput collection, aggregate identifiedObjects
 * and update the count value
 * @param {Array<Object>} identifications
 */
export const aggregateIdentifiedObjects = (identifications) => {
  if (!isArray(identifications)) {
    return identifications;
  }

  // loop through identificationOutputs collection (Array<Object>), and generate aggregatedIdentifications.
  // not mutating the given collection
  const aggregatedIdentifications = identifications.map((identificationOutput) => {
    if (isPlainObject(identificationOutput)) {
      const currentIdObjects = isArray(identificationOutput.identifiedObjects)
        ? identificationOutput.identifiedObjects : [];

      // first element of the currentIdObjects taken as it is in aggregatedIdObjects
      const aggregatedIdObjects = (currentIdObjects.length > 0) ? [cloneDeep(currentIdObjects[0])] : [];

      for (let i = 1, curLen = currentIdObjects.length; i < curLen; i++) {
        const curObj = currentIdObjects[i];
        let foundMatch = false;
        for (let j = 0, aggLen = aggregatedIdObjects.length; j < aggLen; j++) {
          const aggtObj = aggregatedIdObjects[j];
          if (compareIdentifiedObjects(aggtObj, curObj)) {
            aggregatedIdObjects[j].count += curObj.count;
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          aggregatedIdObjects.push(cloneDeep(curObj));
        }
      }

      return {
        ...identificationOutput,
        identifiedObjects: aggregatedIdObjects
      }
    }

    return identificationOutput;
  });

  return aggregatedIdentifications;
};

/**
 * Returns images having invalid sequenceId
 * @param {Array<Object>} images images
 * @returns {Array<Object>}
 */
export const getImagesWithNoSequenceId = images => {
  return images.filter(image => !get(image, 'sequenceId'));
};
