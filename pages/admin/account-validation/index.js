import React from 'react';

import Head from 'layout/head';
import Header from 'layout/header';
import AccountValidation from 'components/account-validation';

import './style.scss';

const AccountValidationPage = () => (
  <div className="l-account-validation-page p-account-validation-index">
    <Head title="Account validation" />
    <Header />
    <div className="l-account-validation-page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="l-content-region">
              <AccountValidation />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AccountValidationPage;
