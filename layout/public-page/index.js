import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import UploadSelectFile from 'components/select-file-dialog';
import UploadModal from 'components/upload';

import './style.scss';

const PublicPage = ({ className, children }) => (
  <div className={classNames('l-public-page', className)}>
    {children}
    <UploadSelectFile />
    <UploadModal />
  </div>
);

PublicPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

PublicPage.defaultProps = { className: null };

export default PublicPage;
