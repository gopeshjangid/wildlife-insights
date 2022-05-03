import React from 'react';
import ManagePage from 'layout/manage-page';
import Head from 'layout/head';
import ProjectForm from 'components/projects/form';

const ProjectsNewPage = () => (
  <ManagePage>
    <Head title="New Project" />
    <h1>New project</h1>
    <ProjectForm />
  </ManagePage>
);

export default ProjectsNewPage;
