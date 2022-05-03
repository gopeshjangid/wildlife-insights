import React from 'react';
import ManagePage from 'layout/manage-page';
import Head from 'layout/head';
import InitiativeForm from 'components/initiatives/form';

const InitiativesNewPage = () => (
  <ManagePage>
    <Head title="New initiative" />
    <h1>New initiative</h1>
    <InitiativeForm />
  </ManagePage>
);

export default InitiativesNewPage;
