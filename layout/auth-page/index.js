import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Header from 'layout/header';

import './style.scss';

const AuthPage = ({ className, children }) => (
  <div className={classNames('l-auth-page', className)}>
    <Header fixed />
    <div className="auth-page-content container">
      {children}
    </div>
  </div>
);

AuthPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

AuthPage.defaultProps = { className: null };

export default AuthPage;
