import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';

import { getAuthApolloClient } from 'lib/initApollo';
import { GQL_GET_DATA_FILES } from 'utils/app-constants';
import { exists } from 'utils/functions';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';
import { parseFilters } from './helpers';
import Component from './component';

import getProjectImages from './project-images.graphql';
import getIdentifyProjectImages from './identify-project-images.graphql';

const mapStateToProps = ({ imageGrid, routes: { query } }) => ({
  organizationId: query.organizationId,
  initiativeId: query.initiativeId,
  projectId: query.projectId,
  forceImageRefetch: imageGrid.forceImageRefetch,
  anyImageClassfied: imageGrid.anyImageClassfied,
  pageSize: imageGrid.pageSize,
  projectType: imageGrid.projectType,
  pageSizeOptions: imageGrid.pageSizeOptions,
  pageIndex: imageGrid.pageIndex,
  selectedImageGroupIndex: imageGrid.selectedImageGroupIndex,
  sortColumn: imageGrid.sortColumn,
  filters: imageGrid.filters,
  identify: !!query.tab && query.tab === 'identify'
});

const mapDispatchToProps = dispatch => ({
  setFilters: filters => dispatch(actions.setFilters(filters)),
  reset: () => dispatch(actions.reset()),
  setPageIndex: index => dispatch(actions.setPageIndex(index)),
  setPageSize: pageSize => dispatch(actions.setPageSize(pageSize)),
  setSelectedImageGroupIndex: index => dispatch(actions.setSelectedImageGroupIndex(index)),
  setForceImageRefetch: () => dispatch(actions.setForceImageRefetch(false)),
  setAnyImageClassfied: () => dispatch(actions.setAnyImageClassfied(false))
});

const getSort = (sortColumn) => {
  if (!sortColumn) {
    return null;
  }

  let sortField = sortColumn;
  let sortOrder = 'ASC';
  if (sortField[0] === '-') {
    sortField = sortField.slice(1, sortField.length);
    sortOrder = 'DESC';
  }

  // for sort by "date taken" or "upload date", add additional sort
  // parameter of "filename"
  const addFileNameSort = sortField === 'timestamp' || sortField === 'createdAt';

  return [
    {
      column: sortField,
      order: sortOrder
    },
    ...(addFileNameSort
      ? [{ column: 'filename', order: sortOrder }]
      : []
    )
  ];
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  // NOTE: Any change to this query must be reflected in the component
  // composed by this file (see refetchDataAndCheckState)
  graphql(getProjectImages, {
    // @ts-ignore
    skip: ({ projectId, identify }) => identify || !exists(projectId),
    // @ts-ignore
    options: ({ projectId, pageSize, pageIndex, sortColumn, filters }) => ({
      ssr: false,
      variables: {
        projectId: +projectId,
        pageSize,
        pageNumber: pageIndex + 1,
        sort: getSort(sortColumn),
        filters: parseFilters(filters),
      },
      fetchPolicy: 'cache-and-network',
      client: getAuthApolloClient(GQL_GET_DATA_FILES)
    }),
  }),
  // NOTE: Any change to this query must be reflected in the component
  // composed by this file (see refetchDataAndCheckState)
  graphql(getIdentifyProjectImages, {
    // @ts-ignore
    skip: ({ projectId, identify }) => !identify || !exists(projectId),
    // @ts-ignore
    options: ({ projectId, pageSize, pageIndex, sortColumn, filters }) => ({
      ssr: false,
      variables: {
        projectId: +projectId,
        pageSize,
        pageNumber: pageIndex + 1,
        sort: getSort(sortColumn),
        filters: parseFilters(filters),
      },
      fetchPolicy: 'cache-and-network',
      client: getAuthApolloClient(GQL_GET_DATA_FILES)
    }),
  })
)(Component);

export { actions, initialState, reducers };
