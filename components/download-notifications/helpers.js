import { toString } from 'lodash';

export const joinArrOfStr = (strArr) => {
  return Array.isArray(strArr) ? strArr.join(', ') : toString(strArr);
};
