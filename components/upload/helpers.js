import nanoid from 'nanoid';

import { translateText, formatDate } from 'utils/functions';
import { FORMAT } from 'components/form/datepicker';
import { getAuthApolloClient } from 'lib/initApollo';
import { GQL_DEFAULT } from 'utils/app-constants';

export const createUploadHelper = params => ({
  id: nanoid(),
  /**
   * List of the names of files successfully uploaded
   * @type {string[]}
   */
  filesUploaded: [],
  /**
   * List of the names of files that failed to upload
   * @type {string[]}
   */
  filesErrored: [],
  /**
   * List of the names of the files whose status is unknown (might or might not be uploaded to the
   * server)
   * @type {string[]}
   */
  filesWithUnknownStatus: [],
  projectId: null,
  deploymentId: null,
  organizationId: null,
  projectType: 'image',
  // flag to avoid duplicate files by filename. If this flag is true, an initial api call is 
  // executed, to determine the filenames that already exist and that do not in the given 
  // deployment. Then only the missing files are uploaded.
  checkAndEnforceNoDuplicates: true,
  // Count of the photos that user originally submitted for upload. Actual count of the 
  // photos to upload may change depending upon the "checkAndEnforceNoDuplicates" flag and 
  // result of "getDataFilesByFileName" api call.
  originalPhotosCnt: 0,
  /** One of these values: 'created', 'uploading', 'paused', 'finished', 'failed', 'canceling' or 'canceled' */
  status: 'created',
  ...params,
  // We sort the files because it's easier for the user to check the report later
  // Nonetheless, the order may not be respected due to the concurrency of the upload
  files: params.files
    ? params.files.sort((fileA, fileB) => (
      fileA.name.localeCompare(fileB.name, 'en', { sensitivity: 'base' })
    ))
    : []
});

/**
 * Create a detailed report of the upload based on the fact the user canceled it.
 * Return the URL to the file.
 * @param {number} projectId id of the concerned project
 * @param {number} deploymentId id of the concerned deployment
 * @param {number} totalFiles count of the files that user submitted
 * @param {string[]} filesUploaded Names of the files that uploaded successfully
 * @param {string[]} filesErrored Names of the files that failed to upload
 * @param {string[]} filesWithUnknownStatus Names of the files that have an unknown status
 */
export const generateCancelFile = (
  projectId,
  deploymentId,
  totalFiles,
  filesUploaded,
  filesErrored,
  filesWithUnknownStatus
) => {
  let content = translateText('Upload report of {date}', {
    date: formatDate(new Date(), FORMAT),
  });
  content += `\nprojectId: ${projectId}`;
  content += `\ndeploymentId: ${deploymentId}`;

  content += translateText('\n\nSummary:');
  content += translateText('\nOf the {total} photos that the user submitted, some photos were sent to the server before the user canceled the upload:', {
    total: totalFiles,
  });

  content += translateText('\n- {unknowns} are in an unknown state', {
    unknowns: filesWithUnknownStatus.length,
  });
  content += translateText('\n- {failed} failed to upload', {
    failed: filesErrored.length,
  });
  content += translateText('\n- {successes} were successfully uploaded', {
    successes: filesUploaded.length,
  });
  content += translateText('\n\nBelow is the breakdown of each of the categories with the name of the files that belong to them.');
  content += translateText('\n\nPhotos in an unknown state:\n');
  content += filesWithUnknownStatus.length
    ? filesWithUnknownStatus.map(name => `- ${name}`).join('\n')
    : translateText('None');
  content += translateText('\n\nPhotos that failed to upload:\n');
  content += filesErrored.length
    ? filesErrored.map(name => `- ${name}`).join('\n')
    : translateText('None');
  content += translateText('\n\nSuccessfully uploaded photos:\n');
  content += filesUploaded.length
    ? filesUploaded.map(name => `- ${name}`).join('\n')
    : translateText('None');

  const blob = new Blob([content], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};

/**
 * Create a detailed report of the upload based on the fact it failed to succeed.
 * Return the URL to the file.
 * @param {number} projectId id of the concerned project
 * @param {number} deploymentId id of the concerned deployment
 * @param {number} totalFiles count of the files that user submitted
 * @param {string[]} filesUploaded Names of the files that uploaded successfully
 * @param {string[]} filesErrored Names of the files that failed to upload
 * @param {string[]} filesWithUnknownStatus Names of the files that have an unknown status
 */
export const generateErrorFile = (
  projectId,
  deploymentId,
  totalFiles,
  filesUploaded,
  filesErrored,
  filesWithUnknownStatus
) => {
  let content = translateText('Upload report of {date}', {
    date: formatDate(new Date(), FORMAT),
  });
  content += `\nprojectId: ${projectId}`;
  content += `\ndeploymentId: ${deploymentId}`;

  content += translateText('\n\nSummary:');
  content += translateText('\nOf the {total} photos that the user submitted:', {
    total: totalFiles,
  });
  content += translateText('\n- {unknowns} are in an unknown state', {
    unknowns: filesWithUnknownStatus.length,
  });
  content += translateText('\n- {failed} failed to upload', {
    failed: filesErrored.length,
  });
  content += translateText('\n- {successes} were successfully uploaded', {
    successes: filesUploaded.length,
  });
  content += translateText('\n\nBelow is the breakdown of each of the categories with the name of the files that belong to them.');
  content += translateText('\n\nPhotos in an unknown state:\n');
  content += filesWithUnknownStatus.length
    ? filesWithUnknownStatus.map(name => `- ${name}`).join('\n')
    : translateText('None');
  content += translateText('\n\nPhotos that failed to upload:\n');
  content += filesErrored.length
    ? filesErrored.map(name => `- ${name}`).join('\n')
    : translateText('None');
  content += translateText('\n\nSuccessfully uploaded photos:\n');
  content += filesUploaded.length
    ? filesUploaded.map(name => `- ${name}`).join('\n')
    : translateText('None');

  const blob = new Blob([content], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};

export const adjustDataFilesSequence = (mutationQuery, { projectId, deploymentId }) => {
  const client = getAuthApolloClient(GQL_DEFAULT);

  return client.mutate({
    mutation: mutationQuery,
    variables: {
      projectId,
      deploymentId,
    },
  });
};

export default { createUploadHelper };
