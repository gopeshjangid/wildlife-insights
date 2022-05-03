import { getCountriesOptions } from 'utils/country-codes';

/**
 * Return the initial values of the form
 * @param {Object} location Location object from the API
 */
const getFormInitialValues = (location) => {
  if (!location) {
    return {};
  }

  return {
    ...location,
    country: getCountriesOptions().find(country => country.value === location.country),
  };
};

export { getFormInitialValues };
export default getFormInitialValues;
