export default {
  errors: null,
  data: null,

  isFetching: false,
  fetchingStatus: null,

  isSaving: false,
  savingStatus: null,

  permissions: {
    /** @type {Object<number, string>} organizations */
    organizations: {},
    /** @type {Object<number, string>} initiatives */
    initiatives: {},
    /** @type {Object<number, string>} projects */
    projects: {},
  },
};
