const checkTwoDigits = (val) => {
  return val.length === 2 ? val : `0${val}`;
};

/**
 * Return the initial values of the form
 * @param {Object} originalDateTaken datetaken from the API
 */
export const getFormInitialValues = (originalDateTaken) => {
  const arrDateTmp = originalDateTaken.split(' ');
  const arrDate = arrDateTmp[0].split('/');
  const arrTime = arrDateTmp[1].split(':');
  return {
    year: arrDate[2],
    month: arrDate[0],
    day: checkTwoDigits(arrDate[1]),
    hour: arrTime[0] <= 12 ? checkTwoDigits(arrTime[0]) : checkTwoDigits(arrTime[0] - 12),
    minute: checkTwoDigits(arrTime[1]),
    second: checkTwoDigits(arrTime[2]),
    hourformat: arrTime[0] <= 12 ? 'AM' : 'PM',
  };
};

/**
 * Return the serialized values of the form so they can be sent to the API
 * @param {Object<string, any>} values Values of the form
 */
export const serializeBody = (values) => {
  /** @type {any} res */
  const { year, month, day, hour, minute, second, hourformat } = values;
  const newHour = hourformat === 'AM' ? hour : parseInt(hour, 10) + 12;
  const res = {
    timestamp: `${year}-${month}-${day} ${newHour}:${minute}:${second}`,
  };
  return res;
};
