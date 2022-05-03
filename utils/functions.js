import { default as slugifyExt } from 'slugify';
import addMinutes from 'date-fns/addMinutes';
import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';
import isDate from 'date-fns/isDate';
import isValid from 'date-fns/isValid';
import { enUS, es } from 'date-fns/locale';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { toString } from 'lodash';

const LOCALES = {
  en: enUS,
  es,
};

export const exists = variable => variable !== null && variable !== undefined;

/**
 * Checks if a string is the URL of a YouTube video
 * @param {string} url URL of a YouTube video
 */
export const isValidYouTubeURL = url => exists(url) && /youtube.com\/watch\?v=([A-z]|\d|-)+/.test(url);

/**
 * Get the ID of a YouTube video
 * @param {string} url URL of a YouTube video
 */
export const getYouTubeId = url => (isValidYouTubeURL(url) ? url.match(/youtube.com\/watch\?v=(([A-z]|\d|-)+)/)[1] : null);

/**
 * Return a slug based on a string
 * @param {string} string String to slugify
 */
export const slugify = string => slugifyExt(string);

/**
 * Return the ID and the type of the entity that is concerned
 * Return null if no ID is passed (which would be the case of the overview page, for examole)
 * @param {number|string} [organizationId] ID of the oraganization from the query
 * @param {number|string} [initiativeId] ID of the initiative from the query
 * @param {number|string} [projectId] ID of the project from the query
 */
export const getConcernedEntity = (organizationId, initiativeId, projectId) => {
  if (exists(projectId)) {
    return {
      type: 'project',
      id: +projectId,
    };
  }

  if (exists(initiativeId)) {
    return {
      type: 'initiative',
      id: +initiativeId,
    };
  }

  if (exists(organizationId)) {
    return {
      type: 'organization',
      id: +organizationId,
    };
  }

  return null;
};

/**
 * Return the translated version of the string
 * @param {string} str String to translate
 * @param {Object} params Variables used for the string expansion
 */
export const translateText = (str, params = {}) => {
  // @ts-ignore
  if (typeof window !== 'undefined' && exists(window.Transifex) && exists(str)) {
    return Transifex.live.translateText(str, params);
  }

  return str;
};

/**
 * Return the current locale
 */
// @ts-ignore
export const getLocale = () => (typeof window !== 'undefined' && exists(window.Transifex)
  ? Transifex.live.getSelectedLanguageCode()
  : 'en');

/**
 * Parse a string as a Date object
 * @param {string} str String to parse
 * @param {string} format Format of the date (see date-fns formats)
 */
export const parseDate = (str, format) => {
  // This condition is necessary since date-fns doesn't strictly parse the dates
  // anymore:
  // https://github.com/date-fns/date-fns/issues/942
  if (str.length !== format.length) {
    return undefined;
  }

  const parsed = dateFnsParse(str, format, new Date());
  if (isDate(parsed) && isValid(parsed)) {
    return parsed;
  }

  return undefined;
};

/**
 * Parse a string or take a Date object and interprete it as being in the local time zone
 * @param {string|Date} date String or Date to move to local time zone
 * @returns {Date}
 */
export const parseUTCDateInLocalTimeZone = date => utcToZonedTime(date, 'UTC');

/**
 * Parse a string or take a Date object and interprete it as being in the UTC zone
 * @param {string|Date} date String or Date to move to UTC
 * @returns {Date}
 */
export const parseLocalTimeZoneDateInUTC = date => zonedTimeToUtc(date, 'UTC');

/**
 * Serialise a Date object as a string following a specific format
 * @param {Date} date Date to format
 * @param {string} format Format of the date (see date-fns formats)
 */
export const formatDate = (date, format) => {
  const locale = LOCALES[getLocale()] || LOCALES.en;
  return dateFnsFormat(date, format, { locale });
};

/**
 * Return a readable version of the role of a user for a specific entity
 * @param {string} apiRole Role of the user as stored in the API
 */
export const getReadableRole = (apiRole) => {
  if (!exists(apiRole)) {
    return null;
  }

  const split = apiRole.split('_');
  if (split.length < 2) {
    return null;
  }

  return split[1].toLowerCase();
};

/**
 * Return the bounds of the list of coordinates
 * @param {Array<Array<number>>} coordinatesArray Array of coordinates
 */
export const getCoordinatesBounds = (coordinatesArray) => {
  if (coordinatesArray.length === 0) {
    return {
      sw: { lat: -90, lng: -180 },
      ne: { lat: 90, lng: 180 },
    };
  }

  return coordinatesArray.reduce(
    (res, coordinates) => ({
      sw: {
        lat: Math.min(res.sw.lat, coordinates[0]),
        lng: Math.min(res.sw.lng, coordinates[1]),
      },
      ne: {
        lat: Math.max(res.ne.lat, coordinates[0]),
        lng: Math.max(res.ne.lng, coordinates[1]),
      },
    }),
    {
      sw: { lat: 90, lng: 180 },
      ne: { lat: -90, lng: -180 },
    }
  );
};

/**
 * Generate a blob from the data object and return its URL
 * @param {any} data JSON object
 */
export const generateDataUrl = (data) => {
  const string = JSON.stringify(data);
  const bytes = new TextEncoder().encode(string);
  const blob = new Blob([bytes], {
    type: 'application/json;charset=utf-8'
  });

  return URL.createObjectURL(blob);
};

export const getGraphQLErrorMessage = (paramErr) => {
  let err = 'Please try again in a few minutes.';
  if (paramErr) {
    err = paramErr?.graphQLErrors?.[0]?.message
      || paramErr?.errors?.[0]?.message;
    if (!err && paramErr?.message) {
      err = paramErr.message;
    }
  }

  // react components throws error if the children are objects, to prevent 
  // this converting to string in case the resolved err is still an object.
  return toString(err);
};

export const getErrorMessage = (paramErr) => {
  let err = 'Please try again in a few minutes.';
  if (paramErr) {
    err = paramErr?.errors?.[0]?.message;
    if (!err && paramErr?.message) {
      err = paramErr.message;
    }
  }

  // react components throws error if the children are objects, to prevent 
  // this converting to string in case the resolved err is still an object.
  return toString(err);
};

export const getFormattedDate = (date, format = 'MM/dd/yyyy') => {
  let formattedDate;
  try {
    formattedDate = formatDate(date, format);
  } catch (err) {
    formattedDate = '–';
  }
  return formattedDate;
};

export const getFormattedUTCDate = (date, format = 'MM/dd/yyyy') => {
  let formattedDate;
  try {
    const dateObj = new Date(date);
    formattedDate = dateFnsFormat(addMinutes(dateObj, dateObj.getTimezoneOffset()), format);
  } catch (err) {
    formattedDate = '–';
  }
  return formattedDate;
};

export const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

export const arrayToChunk = (data, size) => {
  const results = [];
  if (Array.isArray(data)) {
    const array = [...data];
    while (array?.length) {
      results.push(array.splice(0, size));
    }
  }

  return results;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    window.location.replace('/logout');
  }
};
