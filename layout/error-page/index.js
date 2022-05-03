import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Logo } from 'layout/header/component';

import './style.scss';

const ErrorPage = ({ className, children }) => (
  <div className={classNames('l-error-page', className)}>
    <header className="l-header -no-menu">
      <div className="l-header-container">
        <Logo />
      </div>
    </header>
    <div className="l-error-page-content">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-10 offset-md-1">{children}</div>
        </div>
      </div>
    </div>
  </div>
);

ErrorPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

ErrorPage.defaultProps = { className: null };

export default ErrorPage;
