import nanoid from 'nanoid';
import mapValues from 'lodash/mapValues';

/**
 * @typedef {{ label: any, value: number|string}} Option
 */

/**
 * Return the filters in the format the API can understand them
 * @param {Object<string, Option|Option[]>} filters Filters applied to the list of images
 */
const parseFilters = (filters) => {
  /** @type {Object} */
  const filtersParams = mapValues(filters, (options) => {
    if (options && Array.isArray(options)) {
      return options.map(o => ((Number.isNaN(Number(o.value)) ? o.value : +o.value)));
    }
    return options;
  });

  if (filtersParams?.endDate) {
    filtersParams.endDate = `${filtersParams.endDate} 23:59:59`;
  }

  return filtersParams;
};

const createUploadHelper = params => ({
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

export { parseFilters, createUploadHelper };
export default parseFilters;
