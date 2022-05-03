/**
 * Return the data to send to the approve mutation based on the form
 * @param {{ users: Array<Object> }} formData Data of the form
 */
export const getApproveMutationData = formData => formData.users
  .filter(user => !!user.approve)
  .map(user => ({
    participantId: user.id,
    whitelisted: true,
  }));

/**
 * Return the data to send to the reject mutation based on the form
 * @param {{ users: Array<Object> }} formData Data of the form
 */
export const getRejectMutationData = formData => formData.users
  .filter(user => !!user.reject)
  .map(user => user.id);

/**
 * Return whether the approve mutation performed all the changes
 * @param {object[]} mutationData Data passed to the mutation
 * @param {object} response Response of the mutation
 */
export const didApproveMutationPerformAllChanges = (mutationData, response) => (
  mutationData.length === response.successfulOperationsCount
);

/**
 * Return whether the reject mutation performed all the changes
 * @param {number[]} mutationData Data passed to the mutation
 * @param {object[]} response Response of the mutation
 */
export const didRejectMutationPerformAllChanges = (mutationData, response) => (
  mutationData.length === response.length && response.every(user => !!user.deleted)
);
