import React from 'react';
import Head from 'layout/head';
import Header from 'layout/header';
import AnalyticsComponent from 'components/analytics';
import './style.scss';

const AnalyticsPage = () => (
  <div className="analytics-container">
    <Header />
    <Head title="Analytics" />
    <div className="analytics-main">
      <AnalyticsComponent />
    </div>
  </div>
);

export default AnalyticsPage;
