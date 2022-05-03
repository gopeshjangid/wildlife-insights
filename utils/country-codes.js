// Source: https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes
import countryCodes from 'lib/country-codes.json';

/**
 * Dictionary of countries where the key is an ISO 3166-1 alpha-3 code
 * (3-letter code) and the value is the name of the country in English
 * @type {Object<string, string>} countriesDict
 */
const countriesDict = countryCodes.reduce((res, c) => ({
  ...res,
  [c['alpha-3']]: c.name
}), {});

/**
 * Get the dictionary of countries.
 * The key is an ISO 3166-1 alpha-3 code (3-letter code) and
 * the value is the name of the country in English.
 */
export const getCountriesDict = () => countriesDict;

/**
 * Get the countries and their ISO values as an array of options.
 * Can be used directly by a Select component.
 */
export const getCountriesOptions = () => Object.keys(countriesDict).map(iso => ({
  label: countriesDict[iso],
  value: iso
}));

/**
 * Get the name of a country by its ISO code
 * @param {string} iso ISO 3166-1 alpha-3 country code (3-letter)
 */
export const getCountryFromIso = iso => countriesDict[iso];
