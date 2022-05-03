import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'components/tooltip';
import { DISABLE_PUBLIC_DOWNLOAD } from 'utils/app-constants';
import T from 'components/transifex/translate';
import DownloadRequestModal from 'components/modal/download-request';
import ContactModal from '../modal/contact-data-provider';
import RequestLocationsModal from '../modal/request-locations';

const UserActions = ({
  authenticated,
  flagEmbargo,
  onClickFilterProject,
  projectId,
  hasSensitiveSpecies,
  user
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRequestLocationsModal, setShowRequestLocationsModal] = useState(false);
  const [showDownloadRequestModal, setShowDownloadRequestModal] = useState(false);

  return (
    <Fragment>
      {
        showContactModal && (
          <ContactModal
            open={showContactModal}
            onClose={() => {
              setShowContactModal(false);
            }}
            projectId={projectId}
          />
        )
      }
      {
        showRequestLocationsModal && (
          <RequestLocationsModal
            open={showRequestLocationsModal}
            onClose={() => {
              setShowRequestLocationsModal(false);
            }}
            projectId={projectId}
          />
        )
      }
      {
        showDownloadRequestModal && (
          <DownloadRequestModal
            open={showDownloadRequestModal}
            onClose={() => setShowDownloadRequestModal(false)}
            email={user.email}
            filters={{ projects: projectId }}
          />
        )
      }
      <div className="form-group row mb-3">
        <div className="col btn-bar">
          <button
            type="button"
            className="btn btn-primary"
            disabled={flagEmbargo || !user || DISABLE_PUBLIC_DOWNLOAD}
            onClick={() => setShowDownloadRequestModal(true)}
          >
            <T text="Download all project data" />
          </button>
          <button type="button" className="btn btn-primary" onClick={onClickFilterProject}>
            <T text="Filter project data" />
          </button>
          <button type="button" className="btn btn-primary"
            disabled={!authenticated}
            onClick={() => {
              setShowContactModal(true);
            }}
          >
            <T text="Contact" />
          </button>
        </div>
      </div>

      {
        hasSensitiveSpecies && (
          <div className="form-group row">
            <div className="col req-locations">
              <p>* Sensitive location data has been anonymized</p>
              <Tooltip placement="left"
                trigger="mouseenter"
                content={(
                  <div className="text-left">
                    <span>
                      This project contains images of sensitive species. Wildlife Insights
                      automatically fuzzes each location where a sensitive species has
                      been captured in order to protect the locations of these species.
                    </span>
                    {' '}
                    <span>
                      <a target="_blank"
                        href="https://www.wildlifeinsights.org/sensitive-species"
                        rel="noopener noreferrer"
                      >
                        Read more
                      </a>
                    </span>
                    {' '}
                    <span>about the Wildlife Insights sensitive species policy.</span>
                  </div>
                )}>
                <button type="button"
                  className="btn btn-link ml-auto"
                  disabled={!authenticated}
                  onClick={() => {
                    setShowRequestLocationsModal(true);
                  }}
                >
                  <T text="Request locations" />
                </button>
              </Tooltip>
            </div>
          </div>
        )
      }
    </Fragment>
  );
};

UserActions.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  flagEmbargo: PropTypes.bool.isRequired,
  onClickFilterProject: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired,
  hasSensitiveSpecies: PropTypes.bool.isRequired,
  user: PropTypes.shape({}).isRequired
};

export default UserActions;
