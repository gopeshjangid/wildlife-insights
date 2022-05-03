import React from 'react';
import Head from 'layout/head';
import DownloadNotificationPage from 'layout/download-notifications-page';
import DownloadMessages from 'components/download-notifications/messages';
import DownloadDataList from 'components/download-notifications/download-list';
import SpeciesRequest from 'components/download-notifications/species-request';

import './style.scss';

const DownloadNotifications = () => (
  <DownloadNotificationPage className="p-download-notifications-index">
    <Head title="Download notifications" />
    <div className="page-title justify-content-between align-items-center">
      <SpeciesRequest />
      <DownloadMessages />
      <DownloadDataList />
    </div>
  </DownloadNotificationPage>
);

export default DownloadNotifications;
