import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import dynamic from 'next/dynamic';

import { Router } from 'lib/routes';
import ManagePage from 'layout/manage-page';
import Head from 'layout/head';
import LoadingSpinner from 'components/loading-spinner';
import IdentifyPhotosBadge from 'components/identify-photos-badge';
import RestrictedAccessIcon from 'components/restricted-access-icon';
import EntityDownload from 'components/entity-download';
import UsersPermissions from 'components/users-permissions';
import { setProjectType } from 'components/images/grid/actions';
import projectQuery from './project.graphql';

const LoadingComponent = () => (
  <div className="text-center">
    <LoadingSpinner inline />
  </div>
);
const Summary = dynamic(() => import('components/summary'), { loading: LoadingComponent });
const Details = dynamic(
  {
    modules: () => ({
      ProjectForm: () => import('components/projects/form').then(dep => dep.default),
      SubProjectsList: () => import('components/subprojects/list').then(dep => dep.default),
      LocationsList: () => import('components/locations/list').then(dep => dep.default),
      DeploymentsList: () => import('components/deployments/list').then(dep => dep.default),
    }),
    render: (_, { ProjectForm, SubProjectsList, LocationsList, DeploymentsList }) => (
      <Fragment>
        <ProjectForm />
        <SubProjectsList />
        <LocationsList />
        <DeploymentsList />
      </Fragment>
    ),
  },
  {
    loading: LoadingComponent,
  }
);
const ImageGrid = dynamic(() => import('components/images/grid'), { loading: LoadingComponent });

const TAB_SLUGS = ['summary', 'details', 'identify', 'catalogued'];

const ProjectsShowPage = ({
  organizationId,
  initiativeId,
  projectId,
  selectedTabIndex,
  refetchImages,
  setImageGridProjectType
}) => {
  const [project, setProject] = useState(null);

  const { data, loading, error } = useQuery(projectQuery, {
    variables: {
      organizationId: +organizationId,
      id: +projectId,
    },
  });

  const onRefetchImagesComplete = () => {
    Router.replaceRoute('projects_show', {
      tab: TAB_SLUGS[selectedTabIndex],
      organizationId,
      projectId,
    });
  };

  useEffect(() => {
    if (!loading && data?.getProject) {
      setImageGridProjectType(
        data.getProject?.projectType
          ? data.getProject.projectType.toLowerCase()
          : ''
      );
      setProject(data.getProject);
    }
  }, [loading, data, setProject]);

  useEffect(() => {
    // on unmount of project manage page, reset ProjectType on imageGrid store
    return () => {
      setImageGridProjectType();
    };
  }, []);

  if (loading && !project) {
    return (
      <ManagePage>
        <Head title="Project" />
        <h1>Project</h1>
        <div className="text-center mt-4">
          <LoadingSpinner inline />
        </div>
      </ManagePage>
    );
  }

  if (error) {
    return (
      <ManagePage>
        <Head title="Project" />
        <h1>Project</h1>
        <div className="alert alert-danger" role="alert">
          {error.message.includes('permissions')
            ? "The project doesn't exist or you don't have access to it."
            : 'Unable to load the project. Please try again in a few minutes.'}
        </div>
      </ManagePage>
    );
  }

  return (
    <ManagePage>
      <Head title={project?.name || 'Project'} />
      <h1>
        {project?.shortName || 'Project'}
        <RestrictedAccessIcon />
      </h1>
      <Tabs
        className="react-tabs manage-tab-nav"
        selectedIndex={selectedTabIndex}
        onSelect={(index) => {
          Router.pushRoute(initiativeId ? 'projects_initiative_show' : 'projects_show', {
            organizationId,
            initiativeId,
            projectId,
            tab: TAB_SLUGS[index],
          });
        }}
      >
        <div className="tabs-container">
          <TabList>
            <Tab>Summary</Tab>
            <Tab>Details</Tab>
            <Tab>
              Identify
              <IdentifyPhotosBadge title="Photos to identify" />
            </Tab>
            <Tab>Catalogued</Tab>
          </TabList>
          <div>
            <div className="d-inline-block mr-2">
              <EntityDownload />
            </div>
            <UsersPermissions />
          </div>
        </div>
        <TabPanel>
          <Summary />
        </TabPanel>
        <TabPanel>
          <Details />
        </TabPanel>
        <TabPanel>
          <ImageGrid
            refetchImages={refetchImages}
            onRefetchImagesComplete={onRefetchImagesComplete}
          />
        </TabPanel>
        <TabPanel>
          <ImageGrid />
        </TabPanel>
      </Tabs>
    </ManagePage>
  );
};

ProjectsShowPage.getInitialProps = ({ query }) => {
  const {
    tab,
    organizationId,
    initiativeId,
    projectId,
    'upload-complete': refetchImages
  } = query;

  return {
    organizationId,
    initiativeId,
    projectId,
    selectedTabIndex: TAB_SLUGS.indexOf(tab) === -1 ? 0 : TAB_SLUGS.indexOf(tab),
    refetchImages: !!refetchImages,
  };
};

ProjectsShowPage.propTypes = {
  organizationId: PropTypes.string.isRequired,
  initiativeId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  refetchImages: PropTypes.bool,
};

ProjectsShowPage.defaultProps = {
  initiativeId: null,
  refetchImages: false
};

const mapDispatchToProps = dispatch => ({
  setImageGridProjectType: projectType => dispatch(setProjectType(projectType))
});

export default connect(null, mapDispatchToProps)(ProjectsShowPage);
