import React from 'react';
import Head from 'layout/head';
import { Link } from 'lib/routes';
import AuthPage from 'layout/auth-page';

const AccountConfirmedPage = () => (
  <AuthPage>
    <Head title="Account verified" />
    <div className="row justify-content-center">
      <div className="col col-md-6">
        <h1 className="text-center">Account verified</h1>
        <div className="auth-page-form">
          <div className="alert alert-success" role="alert">
            Your email address has been verified!
          </div>
          <p>
            If {'you\'re'} a member of our trusted tester program, please contact us at{' '}
            <a href="mailto:info@wildlifeinsights.org">info@wildlifeinsights.org</a> to let us know
            your email has been verified.
          </p>
          <p>
            If {'you\'d'} like to apply to our trusted tester program, please contact{' '}
            <a href="mailto:info@wildlifeinsights.org">info@wildlifeinsights.org</a> with a
            description of your projects and datasets and a member of the Wildlife Insights
            team will reach out. {'We\'re'} accepting new trusted testers on a rolling basis and are
            working hard to make Wildlife Insights available to as many users as possible.
          </p>
          <h2>What does it mean to be a trusted tester of Wildlife Insights?</h2>
          <p>
            While Wildlife Insights is in beta, {'we\'re'} looking for trusted testers who can
            provide feedback on the platform (and bug reports help too!). We want to hear more about
            what works, what needs work, and how we can make Wildlife Insights even better for you.
            As a tester, we rely on your feedback to guide future development.
          </p>
          <p>
            Thanks for your efforts to help Wildlife Insights grow! {'We\'re'} excited to help you
            manage and share your wildlife data, and your feedback will help us reach that goal!
          </p>
          <p className="mt-5 text-center">
            <Link route="/discover">
              <a className="btn btn-primary">Start exploring the data now</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  </AuthPage>
);

export default AccountConfirmedPage;
