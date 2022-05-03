import { exists } from 'utils/functions';
import { IDENTIFICATION_METHOD_TYPE_LEGACY } from '../constants';

const isEmptyTaxonomy = (identifiedObject) => {
  if (identifiedObject
    && identifiedObject.taxonomy
    && (exists(identifiedObject.taxonomy.class)
      || exists(identifiedObject.taxonomy.order)
      || exists(identifiedObject.taxonomy.family)
      || exists(identifiedObject.taxonomy.genus)
      || exists(identifiedObject.taxonomy.species))
  ) {
    return false;
  }
  return true;
}

export const getAuthorName = (identification) => {
  let authorName = identification.participantId !== null
    ? identification.participant
    && `${identification.participant.firstName || ''} ${identification.participant
      .lastName || ''}`
    : '';

  // for batch uploads, authorName should be prepended by identified_by value of datafile(if exists).
  // if type of identificationMethod is 'legacy-identifier', then it is from batch upload.
  if (identification?.identificationMethod?.type === IDENTIFICATION_METHOD_TYPE_LEGACY
    && identification?.dataFile?.metadata?.identified_by) {
    authorName = `${identification?.dataFile?.metadata?.identified_by} - ${authorName}`;
  }

  return authorName;
}

export default isEmptyTaxonomy;
