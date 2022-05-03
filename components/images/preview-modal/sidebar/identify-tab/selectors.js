import { get, groupBy, orderBy, isPlainObject, uniq } from 'lodash';
import { createSelector } from 'reselect';

import { exists } from 'utils/functions';
import {
  aggregateIdentifiedObjects,
  compareIdentifiedObjects,
  getConfirmedIdentification
} from './helpers';

const identificationsPerPhotoSelector = state => state.identificationsPerPhoto;

/**
 * Return the unique confirmed identification of each photo
 */
export const confirmedIdentificationsSelector = createSelector(
  identificationsPerPhotoSelector,
  (identificationsPerPhoto) => {
    if (!Object.keys(identificationsPerPhoto).length) {
      return [];
    }

    const confirmedIdentifications = Object.keys(identificationsPerPhoto)
      .map(dataFileId => getConfirmedIdentification(identificationsPerPhoto[dataFileId]));

    // in api response, indentifiedObjects inside identificationOutput are flattened (each with count 1),
    // first aggregate the indentifiedObjects and update the count of indentifiedObjects accordingly
    const aggregatedConfirmedIdentifications = aggregateIdentifiedObjects(confirmedIdentifications);

    // We group the identifications that are identical (either they have the same taxonomies, don't
    // have any or are blanks)
    // Note that two identifications that have the same taxonomy but other fields that are
    // different (such as sex and age) are still grouped together
    const groupedConfirmedIdentifications = groupBy(
      aggregatedConfirmedIdentifications,
      (confirmedIdentification) => {
        if (confirmedIdentification.blankYn) {
          return -1;
        }

        if (!confirmedIdentification.identifiedObjects.length) {
          return -2;
        }

        return confirmedIdentification.identifiedObjects
          .map(identifiedObject => identifiedObject.taxonomyId)
          .join(',');
      }
    );

    // We remove the identifications that are neither blanks nor have identification outputs and we
    // order the others by how many photos they belong to
    return orderBy(
      Object.keys(groupedConfirmedIdentifications)
        .map((taxonomyId) => {
          if (taxonomyId === '-2') {
            return null;
          }

          return {
            ...groupedConfirmedIdentifications[taxonomyId][0],
            // We add the number of times this identification appears
            count: groupedConfirmedIdentifications[taxonomyId].length,
            // We modify the confidence attribute so it is an array of the minimum
            // confidence and the maximum one
            confidence: groupedConfirmedIdentifications[taxonomyId]
              .map(identification => identification.confidence)
              .filter(confidence => exists(confidence))
              .reduce((res, confidence) => {
                if (res[0] === null) return [confidence, confidence];
                if (confidence < res[0]) return [confidence, res[1]];
                if (confidence > res[1]) return [res[0], confidence];
                return res;
              }, [null, null])
          };
        })
        .filter(confirmedIdentification => !!confirmedIdentification),
      'count',
      ['desc']
    );
  }
);

/**
 * Return the unique confirmed identification of each photo in burst mode
 */
export const confirmedBurstIdentificationsSelector = (
  identify,
  entityIds,
  tab,
  isSequenceProject = false
) => {
  const identificationsPerPhoto = identify?.identificationsPerPhoto || {};
  let selectedPhotosIdentifications = {};

  if (entityIds && Array.isArray(entityIds)) {
    entityIds.forEach(entityId => {
      if (identificationsPerPhoto[entityId]) {
        selectedPhotosIdentifications = {
          ...selectedPhotosIdentifications,
          [entityId]: identificationsPerPhoto[entityId]
        };
      }
    });
  } else {
    selectedPhotosIdentifications = identificationsPerPhoto;
  }

  if (!Object.keys(selectedPhotosIdentifications).length) {
    return [];
  }

  const confirmedIdentifications = Object.keys(selectedPhotosIdentifications)
    .map(entityId => selectedPhotosIdentifications[entityId][0]);

  // in api response, indentifiedObjects inside identificationOutput are flattened (each with count 1),
  // first aggregate the indentifiedObjects and update the count of indentifiedObjects accordingly
  const aggregatedConfirmedIdentifications = aggregateIdentifiedObjects(confirmedIdentifications);
  const { confirmedIdslabels, seqIdsClassifiedByUser } = identify;

  const classifiedIds = {};
  const unClassifiedIds = {};
  const entityKeyId = isSequenceProject ? 'sequenceId' : 'dataFileId';
  for (let i = 0; i < aggregatedConfirmedIdentifications.length; i++) {
    const currentId = isPlainObject(aggregatedConfirmedIdentifications[i]) ? {
      ...aggregatedConfirmedIdentifications[i],
      identificationMethod: {
        ...(get(aggregatedConfirmedIdentifications[i], 'identificationMethod'))
      }
    } : {};
    const idObjects = currentId?.identifiedObjects || [];

    const recordId = currentId[entityKeyId];
    if (isSequenceProject && tab === 'identify'
      && exists(currentId.identificationMethod?.mlIdentification)
      && !currentId.identificationMethod.mlIdentification
      && seqIdsClassifiedByUser.indexOf(recordId) === -1) {
      currentId.identificationMethod.mlIdentification = true;
    }
    const isIdentifiedByCV = currentId.identificationMethod?.mlIdentification;

    for (let j = 0; j < idObjects.length; j++) {
      const taxId = idObjects[j].taxonomyId;

      const temp = isIdentifiedByCV ? unClassifiedIds[taxId] : classifiedIds[taxId];
      const confidenceToConsider = isSequenceProject ?
        get(idObjects[j], 'confidence') : currentId.confidence;

      if (temp) {
        let tempConfidence = temp.confidence;

        if (confidenceToConsider) {
          const minConf = confidenceToConsider < tempConfidence[0] ?
            confidenceToConsider : tempConfidence[0];
          const maxConf = confidenceToConsider > tempConfidence[1] ?
            confidenceToConsider : tempConfidence[1];
          tempConfidence = [minConf, maxConf];
        }

        const entityIds = uniq([...temp.entityIds, recordId]);

        const identifiedObjects = [...temp.identifiedObjects];
        // add identified objects from the remaining list, if it is 
        // different from the one already pushed into "identifiedObjects"
        if (!isIdentifiedByCV) {
          const ifExists = identifiedObjects.find(obj => {
            if (obj?.taxonomyId === taxId) {
              return compareIdentifiedObjects(obj, idObjects[j]);
            }
            return false;
          });

          if (!ifExists) {
            identifiedObjects.push(idObjects[j]);
          }
        }

        Object.assign(temp, {
          identifiedObjects,
          entityIds,
          dataFileCount: entityIds.length,
          confidence: tempConfidence
        });
      } else {
        // default value of count for sequence in 
        // identify tab is 1 
        const identifiedObject = { ...idObjects[j] };
        if (isIdentifiedByCV && isSequenceProject) {
          identifiedObject.count = 1;
        }
        const idsToUpdate = {
          ...currentId,
          id: +(currentId.id + '' + j),
          identifiedObjects: [identifiedObject],
          entityIds: [recordId],
          dataFileCount: 1,
          confidence: [confidenceToConsider, confidenceToConsider],
          idIconLabel: confirmedIdslabels[taxId]
        };

        if (isIdentifiedByCV) {
          unClassifiedIds[taxId] = idsToUpdate;
        } else {
          classifiedIds[taxId] = idsToUpdate;
        }
      }
    }
  }

  let burstConfirmedIds = [];
  Object.keys(confirmedIdslabels).map(taxId => {
    if (unClassifiedIds[taxId]) {
      burstConfirmedIds.push(unClassifiedIds[taxId])
    }
    if (classifiedIds[taxId]) {
      burstConfirmedIds.push(classifiedIds[taxId])
    }
  });
  return burstConfirmedIds;
}

/**
 * Return the unique confirmed identification per entity (imageId or sequenceId)
 */
export const getEntityConfirmedIdentifications = (identify, entityId) => {
  // entityId = dataFileId or sequenceId, confirmedIdentifications
  const identificationsPerPhoto = identify?.identificationsPerPhoto || {};
  const entityIdentifications = Array.isArray(identificationsPerPhoto[entityId])
    ? identificationsPerPhoto[entityId] : [];

  if (!entityIdentifications.length) {
    return [];
  }

  const confirmedIdentifications = [entityIdentifications[0]];

  // in api response, indentifiedObjects inside identificationOutput are flattened (each with count 1),
  // first aggregate the indentifiedObjects and update the count of indentifiedObjects accordingly
  const aggregatedConfirmedIdentifications = aggregateIdentifiedObjects(confirmedIdentifications);

  // We group the identifications that are identical (either they have the same taxonomies, don't
  // have any or are blanks)
  // Note that two identifications that have the same taxonomy but other fields that are
  // different (such as sex and age) are still grouped together
  const groupedConfirmedIdentifications = groupBy(
    aggregatedConfirmedIdentifications,
    (confirmedIdentification) => {
      if (confirmedIdentification.blankYn) {
        return -1;
      }

      if (!confirmedIdentification.identifiedObjects.length) {
        return -2;
      }

      return confirmedIdentification.identifiedObjects
        .map(identifiedObject => identifiedObject.taxonomyId)
        .join(',');
    }
  );

  // We remove the identifications that are neither blanks nor have identification outputs and we
  // order the others by how many photos they belong to
  return orderBy(
    Object.keys(groupedConfirmedIdentifications)
      .map((taxonomyId) => {
        if (taxonomyId === '-2') {
          return null;
        }

        return {
          ...groupedConfirmedIdentifications[taxonomyId][0],
          // We add the number of times this identification appears
          count: groupedConfirmedIdentifications[taxonomyId].length,
          // We modify the confidence attribute so it is an array of the minimum
          // confidence and the maximum one
          confidence: groupedConfirmedIdentifications[taxonomyId]
            .map(identification => identification.confidence)
            .filter(confidence => exists(confidence))
            .reduce((res, confidence) => {
              if (res[0] === null) return [confidence, confidence];
              if (confidence < res[0]) return [confidence, res[1]];
              if (confidence > res[1]) return [res[0], confidence];
              return res;
            }, [null, null])
        };
      })
      .filter(confirmedIdentification => !!confirmedIdentification),
    'count',
    ['desc']
  );
}
