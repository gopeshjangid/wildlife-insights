import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import Tooltip from 'components/tooltip';
import {
  DISABLE_PUBLIC_DOWNLOAD,
  MAX_PUBLIC_DOWNLOAD_LIMIT
} from 'utils/app-constants';
import DownloadRequestModal from 'components/modal/download-request';
import LoginModal from './modal/sign-in';

const DiscoverDownload = ({ userData, filters, dataLoading, imagesCount }) => {
  const canDownloadData = !dataLoading && imagesCount <= MAX_PUBLIC_DOWNLOAD_LIMIT;
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [showDownloadRequestModal, setShowDownloadRequestModal] = useState(false);

  if (!userData) {
    return (
      <Fragment>
        <button type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowSigninModal(true)}
        >
          Download data
        </button>
        {showSigninModal
          && <LoginModal open={showSigninModal} onClose={() => setShowSigninModal(false)} />
        }
      </Fragment>
    );
  }

  if (DISABLE_PUBLIC_DOWNLOAD) {
    return (
      <Tooltip
        placement="left"
        trigger="mouseenter focus"
        content={<div>Coming soon!</div>}
      >
        <button type="button" className="btn btn-secondary btn-sm disabled">
          Download data
        </button>
      </Tooltip>
    );
  }

  return (
    <Fragment>
      <Tooltip placement="left"
        isVisible={canDownloadData ? false : undefined}
        trigger="mouseenter focus"
        content={(
          <div className="text-left">
            {`Please select ${numeral(MAX_PUBLIC_DOWNLOAD_LIMIT).format('0,0')} records or less to continue with the data download.`}
          </div>
        )}
      >
        <div className="d-inline-block">
          <button type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDownloadRequestModal(true)}
            disabled={!canDownloadData}
          >
            Download data
          </button>
        </div>
      </Tooltip>
      {showDownloadRequestModal
        && (
          <DownloadRequestModal
            open={showDownloadRequestModal}
            onClose={() => setShowDownloadRequestModal(false)}
            email={userData.email}
            filters={filters}
          />)
      }
    </Fragment>
  );
};

DiscoverDownload.propTypes = {
  userData: PropTypes.shape({}),
  filters: PropTypes.shape({}).isRequired,
  dataLoading: PropTypes.bool,
  imagesCount: PropTypes.number,
};

DiscoverDownload.defaultProps = {
  userData: null,
  dataLoading: false,
  imagesCount: 0
};

export default DiscoverDownload;
