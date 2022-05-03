import mapValues from 'lodash/mapValues';

/**
 * @typedef {{ label: any, value: number|string}} Option
 */

/**
 * Return the filters in the format the API can understand them
 * @param {Object<string, Option|Option[]>} filters Filters applied to the list of subprojects
 */
const parseFilters = (filters) => {
  /** @type {Object} */
  const filtersParams = mapValues(filters, (options) => {
    if (options && Array.isArray(options)) {
      return options.map(o => ((Number.isNaN(Number(o.value)) ? o.value : +o.value)));
    }
    return options;
  });

  return filtersParams;
};

export { parseFilters };
