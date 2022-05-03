import { sortBy, mapValues } from 'lodash';

/**
 * @typedef {{ label: any, value: number|string}} Option
 */

/**
 * Return the filters in the format the API can understand them
 * @param {Object<string, Option|Option[]|{}>} filters Filters applied to the advanced filters
 */
export const parseFilters = (filters, defaultCategoryName = 'taxonomyOrder') => {
  /** @type {Object} */
  const filtersParams = mapValues(filters, (options) => {
    if (options && Array.isArray(options)) {
      return options.map(o => ((Number.isNaN(Number(o.value)) ? o.value : +o.value)));
    }
    // @ts-ignore
    if (options?.start || options?.end || !options.value) {
      return options;
    }
    // @ts-ignore
    return options.value;
  });
  if (!filtersParams?.filterKey) {
    filtersParams.filterKey = defaultCategoryName;
  }
  return filtersParams;
};

export const convertObjectToAlphaGrp = (paramData, labelField = 'id') => {
  const data = paramData.reduce((r, e) => {
    if (e[labelField]) {
      const group = e[labelField].trim()[0].toUpperCase();
      if (!r[group]) {
        r[group] = { group, children: [e] };
      } else {
        r[group].children.push(e);
        r[group].children = sortBy(r[group].children, o => o[labelField]);
      }
    }
    return r;
  }, {});
  return data;
};

export const convertArrayToAlphaGrp = (paramData) => {
  const data = paramData.reduce((r, e) => {
    if (e) {
      const group = e[0].toUpperCase();
      if (!r[group]) {
        r[group] = { group, children: [e] };
      } else {
        r[group].children.push(e);
        r[group].children = sortBy(r[group].children, o => o);
      }
    }
    return r;
  }, {});
  return data;
};

export const filterArrayOptions = () => ({
  featureTypes: [],
  sensorMethod: [],
  sensorLayout: [],
  sensorCluster: [],
  metaDataLicense: [],
  embargo: [],
  blankImage: [],
  baitUse: [],
  baitType: [],
  imageLicense: [],
});
