import omit from 'lodash/omit';

import { exists } from 'utils/functions';

/**
 * Get the data to pass to the mutation based on the form's data
 * @param {Object} formData Data of the form
 */
const getMutationData = formData => ({
  ...omit(formData, ['id', '__typename']),
  // null must be returned if no price is set so it is also removed in the API (undefined is
  // considered as if the user didn't want to update the field)
  purchasePrice:
    exists(formData.purchasePrice) && formData.purchasePrice.length
      ? +formData.purchasePrice
      : null,
});

export { getMutationData };
