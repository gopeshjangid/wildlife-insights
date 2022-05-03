import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Header from 'layout/header';
import UploadModal from 'components/upload';
import UploadSelectFile from 'components/select-file-dialog';
import NavDrawer from 'components/nav-drawer';
import Breadcrumbs from 'components/breadcrumbs';

import './style.scss';

const ManagePage = ({ className, children }) => (
  <div className={classNames('l-manage-page', className)}>
    <Header />
    <NavDrawer />
    <Breadcrumbs />
    <div className="l-manage-page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="l-content-region">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
    <UploadSelectFile />
    <UploadModal />
  </div>
);

ManagePage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

ManagePage.defaultProps = { className: null };

export default ManagePage;
