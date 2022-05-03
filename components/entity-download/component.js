import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from 'react-apollo-hooks';
import axios from 'axios';
import { get } from 'lodash';

import { requestEntityDownload } from 'lib/axiosRequestHelper';
import { LOADING, SUCCESS, FAILED } from 'utils/app-constants';
import {
  getFormattedDate,
  getConcernedEntity,
  getErrorMessage,
  getGraphQLErrorMessage
} from 'utils/functions';
import Tooltip from 'components/tooltip';
import LoadingSpinner from 'components/loading-spinner';

import mutationGetDownloadDetails from './download-details.graphql';
import './style.scss';

// for cancelling in-flight axios requests
let cancelRequestSource = axios.CancelToken.source();
let cancelReqToken = cancelRequestSource.token;

const EntityDownload = ({
  organizationId,
  initiativeId,
  projectId,
  token
}) => {
  // There are two operations inlvolved in EntityDownload. First/initial part is to get the
  // "downloadDetailsState" (lastRequestTime and availableNow). After downloadDetailsState is resolved,
  // then user is given the option to request a new download as part of "downloadRequestState".
  const [downloadDetailsState, setDownloadDetailsState] = useState(undefined);
  const [downloadRequestState, setDownloadRequestState] = useState(undefined);
  const [downloadRequestError, setDownloadRequestError] = useState(undefined);

  const [
    downloadDetailsMutation,
    { data: downloadDetailsData, error: downloadDetailsError }
  ] = useMutation(mutationGetDownloadDetails);

  const entity = getConcernedEntity(organizationId, initiativeId, projectId);

  const onShown = () => {
    downloadDetailsMutation({
      variables: {
        entityType: entity.type,
        entityId: entity.id,
      }
    }).then(({ errors }) => {
      if (errors?.length) {
        setDownloadDetailsState(FAILED);
      } else {
        setDownloadDetailsState(SUCCESS);
      }
    }).catch(() => {
      setDownloadDetailsState(FAILED);
    });
  };

  useEffect(() => {
    return () => {
      cancelRequestSource.cancel('cancelling pending download requests.');
    };
  }, []);

  const onHidden = () => {
    setDownloadDetailsState(undefined);
    setDownloadRequestState(undefined);
    setDownloadRequestError(undefined);
  };

  const onSubmit = () => {
    // check if current cancelReqToken is already cancelled (has 
    // 'reason' key). if yes, then with that token, axios request 
    // will not work. so update cancelReqToken for next request
    if (cancelReqToken?.reason) {
      cancelRequestSource = axios.CancelToken.source();
      cancelReqToken = cancelRequestSource.token;
    }

    setDownloadRequestState(LOADING);
    requestEntityDownload(entity.type, entity.id, token, cancelReqToken)
      .then(() => {
        setDownloadRequestState(SUCCESS);
      }).catch(err => {
        // check statusCode and statusTitle to determine 
        // the specific error message to display
        const errData = get(err, 'response.data.errors[0]');
        const status = get(errData, 'status');
        const statusText = get(errData, 'title') || '';

        let errMsg = getErrorMessage(err);
        if (status === 403 && statusText.toLowerCase() === 'forbidden') {
          const entityType = entity.type;
          if (entityType === 'project') {
            errMsg = 'Project Contributors and Taggers are restricted from downloading data. If you\'d like to download data, please contact the Project Owner.';
          } else if (entityType === 'organization') {
            errMsg = 'Organization Contributors are restricted from downloading data. If you\'d like to download data, please contact the Organization Owner.';
          }
        }

        setDownloadRequestState(FAILED);
        setDownloadRequestError(errMsg);
      });
  };

  const getReqDownloadBtn = () => {
    return (
      <div className="form-actions mt-3">
        <button
          type="button"
          className="btn btn-primary mr-3"
          onClick={onSubmit}
          disabled={downloadRequestState === LOADING}
        >
          Request data
        </button>
        {(downloadRequestState === LOADING) && (
          <Fragment>
            <LoadingSpinner inline mini />
            <span className="ml-1">Loading...</span>
          </Fragment>
        )}
      </div>
    );
  }

  const getToolTipContent = () => {
    // If downloadDetailsState (initial state) is not resolved yet, loading spinner is displayed.
    // At a time, only one state is displayed (downloadDetailsState or downloadRequestState).
    // downloadDetailsState is displayed first. After downloadDetailsState is resolved(either with
    // success or error), and user has requested a download, then downloadRequestState is displayed.
    if (downloadDetailsState) {
      if (!downloadRequestState || downloadRequestState === LOADING) {
        if (downloadDetailsState === SUCCESS) {
          // as part of downloadDetailsState, display lastRequestTime and request download button.
          // if lastRequestTime exists and availableNow is false, then the current download request is in progress.
          const lastRequestTime = get(
            downloadDetailsData,
            'getLatestBatchDownloadDetails.requestTime'
          );

          const availableNow = get(
            downloadDetailsData,
            'getLatestBatchDownloadDetails.availableNow'
          );

          return (
            <Fragment>
              {lastRequestTime
                ? (
                  <Fragment>
                    <p className="font-weight-bold mb-2">Your last download was requested on:</p>
                    <p className="italic">
                      {getFormattedDate(new Date(lastRequestTime), 'MM/dd/yyyy HH:mm:ss')}
                    </p>
                  </Fragment>)
                : (<p>There is no previous download request for this entity.</p>)
              }
              {(lastRequestTime && availableNow === false)
                ? (
                  <p className="font-weight-normal">
                    Your request is being processed. {"You'll"} receive an email with a
                    link to your data once it is ready.
                  </p>
                )
                : getReqDownloadBtn()
              }
            </Fragment>
          );
        } else {
          return (
            <Fragment>
              <div className="alert alert-danger" role="alert">
                {getGraphQLErrorMessage(downloadDetailsError)}
              </div>
              {getReqDownloadBtn()}
            </Fragment>
          );
        }
      } else {
        return (
          <Fragment>
            {
              downloadRequestState === SUCCESS && (
                <Fragment>
                  <p className="font-weight-bold mb-2">Download request successful!</p>
                  <p>{"You'll"} receive an email with the link to download the
                    data package shortly. The data package will contain
                    metadata and instructions to download images.
                  </p>
                </Fragment>
              )
            }
            {
              downloadRequestState === FAILED && (
                <div className="alert alert-danger" role="alert">
                  {downloadRequestError}
                </div>
              )
            }
          </Fragment>
        );
      }
    } else {
      return (
        <div className="spinner">
          <LoadingSpinner inline mini />
          <span>Loading...</span>
        </div>
      );
    }
  }

  return (
    <Tooltip
      placement="left"
      onHidden={onHidden}
      onShown={onShown}
      content={(
        <div className="c-download-tooltip">
          {getToolTipContent()}
        </div>
      )}
    >
      <button type="button" className="btn btn-secondary btn-sm">
        Download
      </button>
    </Tooltip>
  );
};

EntityDownload.propTypes = {
  organizationId: PropTypes.string,
  initiativeId: PropTypes.string,
  projectId: PropTypes.string,
  token: PropTypes.string
};

EntityDownload.defaultProps = {
  organizationId: undefined,
  initiativeId: undefined,
  projectId: undefined,
  token: null
};

export default EntityDownload;
