import initialState from './initial-state';
import * as actions from './actions';

export default {
  [/** @type {any} */(actions.setGridType)]: (state, { payload }) => ({
    ...state,
    gridType: payload
  }),
  [/** @type {any} */(actions.setFilters)]: (state, { payload }) => ({
    ...state,
    filters: payload,
    selectedImageGroups: [],
  }),
  [/** @type {any} */(actions.setPageIndex)]: (state, { payload }) => ({
    ...state,
    pageIndex: payload,
    selectedImageGroups: [],
  }),
  [/** @type {any} */(actions.setPageSize)]: (state, { payload }) => ({
    ...state,
    pageSize: payload,
    selectedImageGroups: [],
  }),
  [/** @type {any} */(actions.setSelectedImageGroupIndex)]: (state, { payload }) => ({
    ...state,
    selectedImageGroupIndex: payload,
    selectedImageIndex: 0,
  }),
  [/** @type {any} */(actions.setSelectedImageIndex)]: (state, { payload }) => ({
    ...state,
    selectedImageIndex: payload,
  }),
  [/** @type {any} */(actions.setSortColumn)]: (state, { payload }) => ({
    ...state,
    sortColumn: payload,
    selectedImageGroups: [],
  }),
  [/** @type {any} */(actions.setSelectedImageGroups)]: (state, { payload }) => ({
    ...state,
    selectedImageGroups: payload,
  }),
  [/** @type {any} */(actions.setSelectedBurstImageGroups)]: (state, { payload }) => ({
    ...state,
    selectedBurstImageGroups: payload,
  }),
  [/** @type {any} */(actions.setIsSingleBurstPreview)]: (state, { payload }) => ({
    ...state,
    isSingleBurstPreview: payload,
  }),
  [/** @type {any} */(actions.reset)]: state => {
    // preserve sequence states between identify and catalogue tabs
    const sequenceTypeStatesToPreserve = state.projectType === 'sequence' ? {
      projectType: state.projectType,
      pageSize: 500,
      filters: {
        ...initialState.filters,
        timeStep: 60
      }
    } : {};
    return ({
      ...state,
      ...initialState,
      ...sequenceTypeStatesToPreserve,
      projectType: state.projectType,
    });
  },
  [/** @type {any} */(actions.setProjectType)]: (state, { payload }) => {
    if (payload === 'sequence') {
      return {
        ...state,
        projectType: payload,
        pageSize: 500,
        filters: {
          ...state.filters,
          timeStep: 60
        }
      };
    }

    return {
      ...state,
      projectType: payload ? payload : initialState.projectType,
      filters: {
        ...state.filters,
        timeStep: initialState.filters.timeStep
      }
    };
  },
  [/** @type {any} */(actions.setForceImageRefetch)]: (state, { payload }) => ({
    ...state,
    forceImageRefetch: !!payload,
  }),
  [/** @type {any} */(actions.setAnyImageClassfied)]: (state, { payload }) => ({
    ...state,
    anyImageClassfied: !!payload,
  })
};
