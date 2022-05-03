import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Header from 'layout/header';

import './style.scss';

const Page = ({ className, children }) => (
  <div className={classNames('l-page', className)}>
    <Header />
    <div className="l-page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
);

Page.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Page.defaultProps = { className: null };

export default Page;
