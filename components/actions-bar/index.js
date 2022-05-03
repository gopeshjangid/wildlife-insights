import { connect } from 'react-redux';
import {
  setGridType,
  setPageIndex,
  setSortColumn
} from 'components/images/grid/actions';
import Component from './component';
import getProjectDeployments from './project-deployments.graphql';
import getOrganizationDeployments from './organization-deployments.graphql';
import getDeployments from './deployments.graphql';
import getProjectSubProjects from './project-subprojects.graphql';
import getOrganizationSubProjects from './organization-subprojects.graphql';
import getSubProjects from './subprojects.graphql';

const getDeploymentQuery = (organizationId, projectId) => {
  if (projectId !== null && projectId !== undefined) {
    return getProjectDeployments;
  }

  if (organizationId !== null && organizationId !== undefined) {
    return getOrganizationDeployments;
  }

  return getDeployments;
};

const getSubProjectQuery = (organizationId, projectId) => {
  if (projectId !== null && projectId !== undefined) {
    return getProjectSubProjects;
  }

  if (organizationId !== null && organizationId !== undefined) {
    return getOrganizationSubProjects;
  }

  return getSubProjects;
};

const mapStateToProps = ({
  imageGrid,
  routes: { query },
}) => ({
  projectId: query.projectId,
  organizationId: query.organizationId,
  sortColumn: imageGrid.sortColumn,
  projectType: imageGrid.projectType,
  deploymentsQuery: getDeploymentQuery(query.organizationId, query.projectId),
  subProjectsQuery: getSubProjectQuery(query.organizationId, query.projectId),
  tab: query.tab,
  gridType: imageGrid.gridType
});

const mapDispatchToProps = dispatch => ({
  setGridType: type => dispatch(setGridType(type)),
  setPageIndex: pageIndex => dispatch(setPageIndex(pageIndex)),
  setSortColumn: sortColumn => dispatch(setSortColumn(sortColumn)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
