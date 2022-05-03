const pageSizeOptions = [20, 60, 100, 200];

/**
 * @typedef {{ label: string, value: string|number }} Option
 */

/**
 * @typedef {Option[]|number} Filter
 */

export default {
  /** @type {number} selectedImageGroupIndex - Index of the selected image group */
  selectedImageGroupIndex: null,
  /** @type {number} selectedImageIndex - Index of the selected image within the group */
  selectedImageIndex: 0,
  forceImageRefetch: false,
  anyImageClassfied: false,
  /** image gridTypes are 'grid' and 'tile' */
  gridType: 'grid',
  /** @type {{ [key: string]: Filter }} filters */
  filters: {
    timeStep: 0,
  },
  /** @type {number} pageSize */
  pageSize: pageSizeOptions[2],
  /** @type {number[]} pageSizeOptions */
  pageSizeOptions,
  /** @type {number} pageIndex  */
  pageIndex: 0,
  /** @type {string} sortColumn */
  sortColumn: 'timestamp',
  /** @type {string[]} selectedImageGroups - Indexes of the selected image groups */
  selectedImageGroups: [],
  selectedBurstImageGroups: [],
  /** 
   * @type {string} projectType - at project level there are two types currently.
   * Image - For these type of projects, image grid has both burst and not-burst views
   * Sequence - Only bursts view with default burst of 60 (disabled) is displayed
   */
  projectType: '',
  isSingleBurstPreview: false
};
