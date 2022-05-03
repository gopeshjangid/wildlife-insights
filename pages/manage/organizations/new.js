import React from 'react';
import ManagePage from 'layout/manage-page';
import Head from 'layout/head';
import OrganizationForm from 'components/organizations/form';

const OrganizationsNewPage = () => (
  <ManagePage>
    <Head title="New organization" />
    <h1>New organization</h1>
    <OrganizationForm />
  </ManagePage>
);

export default OrganizationsNewPage;
