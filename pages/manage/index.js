import React from 'react';
import dynamic from 'next/dynamic';

import Head from 'layout/head';
import ManagePage from 'layout/manage-page';
import LoadingSpinner from 'components/loading-spinner';
import ProjectSearch from 'components/projects/project-search';
import Tutorial from 'components/tutorial';

import './style.scss';

const ProjectsGrid = dynamic(() => import('components/projects/grid'), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <LoadingSpinner inline />
    </div>
  ),
});

const ManageIndexPage = () => (
  <ManagePage className="p-manage-index">
    <Head title="Your projects" />
    <Tutorial />
    <div className="page-title d-flex justify-content-between align-items-center">
      <h1>Your projects</h1>
      <ProjectSearch />
    </div>
    <ProjectsGrid />
  </ManagePage>
);

export default ManageIndexPage;
