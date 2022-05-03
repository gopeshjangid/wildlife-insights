import React, { useState, useEffect, useMemo, useCallback } from 'react';

import PublicPage from 'layout/public-page';
import Head from 'layout/head';
import Header from 'layout/header';
import PublicProject from 'components/discover/public-project';
import './style.scss';

const PublicProjectPage = () => {
  return (
    <div className="p-public-project">
      <PublicPage>
        <Header fixed />
        <Head title={'Public project'} />
        <PublicProject />
      </PublicPage>
    </div>
  );
}
export default PublicProjectPage;
