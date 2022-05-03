import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Header from 'layout/header';
import UploadSelectFile from 'components/select-file-dialog';
import UploadModal from 'components/upload';

import './style.scss';

const SimplePage = ({ className, children }) => (
  <div className={classNames('l-simple-page', className)}>
    <Header fixed />
    <div className="l-simple-page-content">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-10 offset-md-1">
            {children}
          </div>
        </div>
      </div>
    </div>
    <UploadSelectFile />
    <UploadModal />
  </div>
);

SimplePage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

SimplePage.defaultProps = { className: null };

export default SimplePage;
