export default {
  /**
   * @type {string} state - General state of the Identify tab
   *
   * The states are:
   * - idle
   * - loading
   * - error
   * - loaded
   * - editing
   * - history
   * */
  state: 'idle',
  // eslint-disable-next-line max-len
  /** @type {Object<string, Object[]>} identifications - Identifications of the selected photo or burst */
  identificationsPerPhoto: {},
  confirmedIdslabels: {},
  seqIdsClassifiedByUser: [],
  /** @type {object} userIdentification - Identification made by the user */
  userIdentification: null,
  disableConfirmHumanPhotoDeletionPopup: false,
};
