import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Head from 'layout/head';
import { signInRequest } from 'modules/auth/actions';
import routes from 'lib/routes';
import AuthPage from 'layout/auth-page';
import LoadingSpinner from 'components/loading-spinner';
import '../style.scss';

const SAMLAuthenticationPage = ({
  auth,
  logInRequest,
  tokenFromSAML,
  refreshTokenFromSAML,
  userEmailFromSAML
}) => {
  /*
    handle login flow for SAML auth redirection
  */
  const [isAlreadyLoggedIn] = useState(auth?.authenticated);
  useEffect(() => {
    if (!isAlreadyLoggedIn && tokenFromSAML
      && refreshTokenFromSAML && userEmailFromSAML) {
      // for 'passport-local' handler to be called, it requires non-empty values for 
      // userName and password. for authentication with token, providing invalid 
      // values for email/password, so that 'passport-local' handler gets called
      logInRequest({
        email: 'anonymous',
        password: 'anonymous',
        authToken: tokenFromSAML,
        refreshToken: refreshTokenFromSAML,
        userEmail: decodeURIComponent(userEmailFromSAML)
      });
    }
  }, []);

  useEffect(() => {
    const { status, authenticated, loading } = auth;

    if (!isAlreadyLoggedIn && !loading && status === 'success' && authenticated) {
      // Don't use pushRoute for login
      const { pattern } = routes.findByName('manage');
      window.location.replace(pattern.replace(':tab?', 'summary'));
    }
  }, [auth]);

  const { loading, status, errors } = auth;

  return (
    <AuthPage className="page-sign-in">
      <Head title="SAML Authentication" />
      <div className="row justify-content-center">
        <div className="col col-md-6">
          <h1 className="text-center">SAML Authentication</h1>
          <div className="auth-page-form">
            {
              status === 'error' && errors.map(({ title }, id) => (
                <div
                  className="alert alert-danger"
                  role="alert"
                  key={id}
                  dangerouslySetInnerHTML={{
                    __html: title.replace(/(https?:\/\/[^\s]+)/g, "<a href='$1' target='_blank' >here</a>")
                  }}
                />
              ))
            }
            {
              !isAlreadyLoggedIn && status === 'success' && (
                <div className="alert alert-success" role="alert">
                  You{"'"}ve been logged successfully.
                </div>
              )
            }
            {
              loading && (
                <div className="text-center">
                  <LoadingSpinner inline />
                </div>
              )
            }
            {
              (!tokenFromSAML || !refreshTokenFromSAML || !userEmailFromSAML) && (
                <div className="alert alert-danger" role="alert">
                  Some of the required parameters(authentication token,
                  refresh token or email) is missing.
                </div>
              )
            }
            {
              isAlreadyLoggedIn && (
                <div className="alert alert-danger" role="alert">
                  You are already logged in. Please logout and try again.
                </div>
              )
            }
          </div>
        </div>
      </div>
    </AuthPage>
  );
};

SAMLAuthenticationPage.propTypes = {
  auth: PropTypes.shape({
    authenticated: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
    loading: PropTypes.bool,
    status: PropTypes.string,
    token: PropTypes.string,
  }),
  logInRequest: PropTypes.func,
  tokenFromSAML: PropTypes.string,
  refreshTokenFromSAML: PropTypes.string,
  userEmailFromSAML: PropTypes.string,
};

SAMLAuthenticationPage.defaultProps = {
  auth: {
    authenticated: false,
    errors: null,
    loading: false,
    status: null,
    token: null,
  },
  tokenFromSAML: null,
  refreshTokenFromSAML: null,
  userEmailFromSAML: null,
  logInRequest: () => {
  }
};

const mapStateToProps = ({ auth, routes: { query } }) => ({
  auth,
  tokenFromSAML: query.token || null,
  refreshTokenFromSAML: query.refreshToken || null,
  userEmailFromSAML: query.userEmail || null
});

export default connect(mapStateToProps, { logInRequest: signInRequest })(
  SAMLAuthenticationPage,
);
