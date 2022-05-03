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

  if (filters && filters.status) {
    filtersParams.status = filters.status && /** @type {Option} */ (filters.status).value !== 'all'
      ? /** @type {Option} */ (filters.status).value
      : undefined;
  }

  if (filters && filters.highlighted) {
    switch (/** @type {Option} */ (filters.highlighted).value) {
      case 'highlighted':
        filtersParams.highlighted = true;
        break;

      case 'not-highlighted':
        filtersParams.highlighted = false;
        break;

      default:
        filtersParams.highlighted = undefined;
    }
  }

  return filtersParams;
};

export { parseFilters };
export default parseFilters;
