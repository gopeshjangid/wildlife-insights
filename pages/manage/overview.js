import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Tab, Tabs, TabList, TabPanel, resetIdCounter } from 'react-tabs';

import Head from 'layout/head';

import LoadingSpinner from 'components/loading-spinner';
import IdentifyPhotosBadgeNoSSR from 'components/identify-photos-badge/no-ssr';

import { Router } from 'lib/routes';
import ManagePage from 'layout/manage-page';

const LoadingComponent = () => (
  <div className="text-center">
    <LoadingSpinner inline />
  </div>
);
const Summary = dynamic(() => import('components/summary'), { loading: LoadingComponent });
// const ImageGrid = dynamic(() => import('components/images/grid'), { loading: LoadingComponent });

const TAB_SLUGS = ['summary', 'identify', 'catalogued'];

class OverviewPage extends PureComponent {
  static async getInitialProps({ query }) {
    const { tab } = query;

    return {
      selectedTabIndex: TAB_SLUGS.indexOf(tab) === -1 ? 0 : TAB_SLUGS.indexOf(tab),
    };
  }

  static propTypes = { selectedTabIndex: PropTypes.number.isRequired }

  componentWillMount() {
    // https://github.com/reactjs/react-tabs#resetidcounter-void
    resetIdCounter();
  }

  render() {
    const { selectedTabIndex } = this.props;

    return (
      <ManagePage className="page-manage">
        <Head title="Overview" />
        <h1>Overview</h1>
        <Tabs
          className="react-tabs manage-tab-nav"
          selectedIndex={selectedTabIndex}
          onSelect={index => Router.replaceRoute('overview', { tab: TAB_SLUGS[index] })}
        >
          <div className="tabs-container">
            <TabList>
              <Tab>Summary</Tab>
              {/* <Tab>
                Identify
                <IdentifyPhotosBadgeNoSSR title="Photos to identify" />
              </Tab>
              <Tab>Catalogued</Tab> */}
            </TabList>
          </div>
          <TabPanel>
            <Summary />
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
  }
}

export default OverviewPage;
