import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import dynamic from 'next/dynamic';

import { Router } from 'lib/routes';
import ManagePage from 'layout/manage-page';
import Head from 'layout/head';
import LoadingSpinner from 'components/loading-spinner';
// import IdentifyPhotosBadge from 'components/identify-photos-badge';
import RestrictedAccessIcon from 'components/restricted-access-icon';
import EntityDownload from 'components/entity-download';
import UsersPermissions from 'components/users-permissions';
import organizationQuery from './organization.graphql';

const LoadingComponent = () => (
  <div className="text-center">
    <LoadingSpinner inline />
  </div>
);
const Summary = dynamic(() => import('components/summary'), { loading: LoadingComponent });
const Details = dynamic(
  {
    modules: () => ({
      OrganizationForm: () => import('components/organizations/form').then(dep => dep.default),
      DevicesList: () => import('components/devices/list').then(dep => dep.default),
    }),
    render: (_, { OrganizationForm, DevicesList }) => (
      <Fragment>
        <OrganizationForm />
        <DevicesList />
      </Fragment>
    ),
  },
  {
    loading: LoadingComponent,
  }
);
// const ImageGrid = dynamic(() => import('components/images/grid'), { loading: LoadingComponent });

const TAB_SLUGS = ['summary', 'details', 'identify', 'catalogued'];

const OrganizationsShowPage = ({ organizationId, selectedTabIndex }) => {
  const { data, loading, error } = useQuery(organizationQuery, {
    variables: {
      organizationId: +organizationId,
    },
  });

  if (loading && !data?.getOrganization) {
    return (
      <ManagePage>
        <Head title="Organization" />
        <h1>Organization</h1>
        <div className="text-center mt-4">
          <LoadingSpinner inline />
        </div>
      </ManagePage>
    );
  }

  if (error) {
    return (
      <ManagePage>
        <Head title="Organization" />
        <h1>Organization</h1>
        <div className="alert alert-danger mt-4" role="alert">
          {error.message.includes('permissions')
            ? "The organization doesn't exist or you don't have access to it."
            : 'Unable to load the organization. Please try again in a few minutes.'}
        </div>
      </ManagePage>
    );
  }

  return (
    <ManagePage>
      <Head title={data.getOrganization.name} />
      <h1>
        {data.getOrganization.name}
        <RestrictedAccessIcon />
      </h1>
      <Tabs
        className="react-tabs manage-tab-nav"
        selectedIndex={selectedTabIndex}
        onSelect={index => Router.pushRoute('organizations_show', {
          organizationId,
          tab: TAB_SLUGS[index],
        })
        }
      >
        <div className="tabs-container">
          <TabList>
            <Tab>Summary</Tab>
            <Tab>Details</Tab>
            {/* <Tab>
              Identify
              <IdentifyPhotosBadge title="Photos to identify" />
            </Tab>
            <Tab>Catalogued</Tab> */}
          </TabList>
          <div>
            <div className="d-inline-block mr-2">
              <EntityDownload />
            </div>
            <UsersPermissions />
          </div>
        </div>
        <TabPanel>
          <Summary organizationData={data.getOrganization} />
        </TabPanel>
        <TabPanel>
          <Details />
        </TabPanel>
        {/* <TabPanel>
          <ImageGrid />
        </TabPanel>
        <TabPanel>
          <ImageGrid />
        </TabPanel> */}
      </Tabs>
    </ManagePage>
  );
};

OrganizationsShowPage.getInitialProps = ({ query }) => {
  const { tab, organizationId } = query;

  return {
    organizationId,
    selectedTabIndex: TAB_SLUGS.indexOf(tab) === -1 ? 0 : TAB_SLUGS.indexOf(tab),
  };
};

OrganizationsShowPage.propTypes = {
  organizationId: PropTypes.string.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
};

export default OrganizationsShowPage;
