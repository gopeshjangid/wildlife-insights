import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Header from 'layout/header';
import UploadSelectFile from 'components/select-file-dialog';
import UploadModal from 'components/upload';

import './style.scss';

const DownloadNotificationsPage = ({ className, children }) => (
  <div className={classNames('l-download-notifications-page', className)}>
    <Header fixed />
    <div className="l-download-notifications-page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="l-content-region">
              {children}
              <UploadSelectFile />
              <UploadModal />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

DownloadNotificationsPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

DownloadNotificationsPage.defaultProps = { className: null };

export default DownloadNotificationsPage;
