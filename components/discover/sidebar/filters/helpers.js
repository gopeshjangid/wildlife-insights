import differenceWith from 'lodash/differenceWith';

import { parseDate, parseLocalTimeZoneDateInUTC, exists } from 'utils/functions';
import { FORMAT } from 'components/form/datepicker';

/**
 * Return the options for the taxonomy filter
 * @param {Array<{ label: any, value: string}>} selectedOptions Options already selected by the user
 * @param {Array<{ label: any, value: string }>} suggestedOptions Options that are the result of the search
 */
export const getTaxonomyOptions = (selectedOptions, suggestedOptions) => [
  {
    label: 'Selected',
    options: selectedOptions.sort((a, b) => (a && b
      ? a.label.localeCompare(b.label, 'en', {
        // Really important if we want to make sure the
        // case sensitivity doesn't matter
        sensitivity: 'base',
      })
      : 0)),
  },
  {
    // WARN: Do not change this label unless you make sure
    // to check the Filter component and especially search for
    // GroupHeading
    label: 'Suggestions',
    options: differenceWith(suggestedOptions, selectedOptions, (a, b) => a.value === b.value),
  },
];

/**
 * Return the filter value in a standard format
 * @param {string} name Name of the filter
 * @param {any} value Value of the filter
 */
export const serializeFilter = (name, value) => {
  if (name === 'taxonomies') {
    if (value.length) {
      return value;
    }
    return null;
  }

  if (name === 'start' || name === 'end') {
    return parseLocalTimeZoneDateInUTC(parseDate(value, FORMAT)).toISOString();
  }

  if (name === 'project') {
    if (value.value !== null) {
      return value;
    }
    return null;
  }

  return value.value;
};

/**
 * Return whether some filters are set
 * @param {Object<string, any>} filters Filters of the view
 */
export const isFiltering = filters => Object.keys(filters).some(key => exists(filters[key]));
