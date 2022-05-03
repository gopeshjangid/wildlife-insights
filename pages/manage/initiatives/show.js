import React from 'react';
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
import initiativeQuery from './initiative.graphql';

const LoadingComponent = () => (
  <div className="text-center">
    <LoadingSpinner inline />
  </div>
);
const Summary = dynamic(() => import('components/summary'), { loading: LoadingComponent });
const Details = dynamic(() => import('components/initiatives/form'), { loading: LoadingComponent });
// const ImageGrid = dynamic(() => import('components/images/grid'), { loading: LoadingComponent });

const TAB_SLUGS = ['summary', 'details', 'identify', 'catalogued'];

const InitiativesShowPage = ({ initiativeId, selectedTabIndex }) => {
  const { data, loading, error } = useQuery(initiativeQuery, {
    variables: {
      id: +initiativeId,
    },
  });

  if (loading && !data?.getInitiative) {
    return (
      <ManagePage>
        <Head title="Initiative" />
        <h1>Initiative</h1>
        <div className="text-center mt-4">
          <LoadingSpinner inline />
        </div>
      </ManagePage>
    );
  }

  if (error) {
    return (
      <ManagePage>
        <Head title="Initiative" />
        <h1>Initiative</h1>
        <div className="alert alert-danger" role="alert">
          {error.message.includes('permissions')
            ? "The initiative doesn't exist or you don't have access to it."
            : 'Unable to load the initiative. Please try again in a few minutes.'}
        </div>
      </ManagePage>
    );
  }

  return (
    <ManagePage>
      <Head title={data.getInitiative.name} />
      <h1>
        {data.getInitiative.name}
        <RestrictedAccessIcon />
      </h1>
      <Tabs
        className="react-tabs manage-tab-nav"
        selectedIndex={selectedTabIndex}
        onSelect={index => Router.pushRoute('initiatives_show', { initiativeId, tab: TAB_SLUGS[index] })
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
          <Summary />
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

InitiativesShowPage.getInitialProps = ({ query }) => {
  const { tab, initiativeId } = query;

  return {
    initiativeId,
    selectedTabIndex: TAB_SLUGS.indexOf(tab) === -1 ? 0 : TAB_SLUGS.indexOf(tab),
  };
};

InitiativesShowPage.propTypes = {
  initiativeId: PropTypes.string.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
};

export default InitiativesShowPage;
