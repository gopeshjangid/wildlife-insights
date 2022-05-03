import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from 'react-apollo-hooks';
import classNames from 'classnames';

import Tooltip from 'components/tooltip';
import { exists, getGraphQLErrorMessage } from 'utils/functions';
import { BBOX_SUPPORT_START_DATE } from '../../../constants';
import updateBboxUserResponse from './update-bbox-user-response.graphql';
import getDataFileQuery from './getDataFile.graphql';

const BBoxSettings = ({
  image,
  showBoundingBoxesOnImage,
  showBoundingBoxSettings,
  onToggleBoundingBoxes,
  displaySuccess,
  displayError
}) => {
  const [isBeforeBBoxCVModel] = useState(
    image?.createdAt ? (new Date(image.createdAt) < new Date(BBOX_SUPPORT_START_DATE)) : true
  );

  const { data, refetch: refetchGetDataFile } = useQuery(getDataFileQuery, {
    variables: {
      projectId: image && +image.deployment.projectId,
      deploymentId: image && +image.deployment.id,
      id: image && +image.id
    },
    skip: !image || !showBoundingBoxesOnImage || !showBoundingBoxSettings
  });

  const [mutate] = useMutation(updateBboxUserResponse, {
    // @ts-ignore
    refetchQueries: refetchGetDataFile,
  });

  const onUserResponse = (userRes) => {
    mutate({
      variables: {
        projectId: image && +image.deployment.projectId,
        id: image && +image.id,
        body: { hasBoundingBox: userRes }
      }
    }).then(() => {
      displaySuccess({
        children: (
          <span className="notification-title">
            Photo updated
          </span>
        )
      });
    }).catch((error) => {
      displayError({
        title: 'Unable to save the response',
        message: getGraphQLErrorMessage(error),
      });
    });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 89 && showBoundingBoxSettings) {
      e.preventDefault();
      // Ctrl + Y
      onUserResponse(true);
    } else if ((e.ctrlKey || e.metaKey) && e.keyCode === 74 && showBoundingBoxSettings) {
      e.preventDefault();
      // Ctrl + J
      onUserResponse(false);
    }
    return false;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getDataFileResolved = exists(data?.getDataFile?.hasBoundingBox);

  if (!image) {
    return null;
  }

  if (showBoundingBoxSettings) {
    return (
      <div className="bounding-box-section mt-3">
        <hr />
        <div className="toggle-container">
          <div className="d-flex">
            <span className="labels">Bounding boxes</span>
            <Tooltip placement="top"
              trigger="mouseenter focus"
              content={(
                <div className="text-left">
                  <p>
                    Your feedback helps us improve future classification. Bounding
                    boxes predict where there are objects of interest in an image but
                    do not correspond with the computer vision species identification
                    above. Select &quot;Yes&quot; if every animal in the image has a
                    bounding box around it.
                  </p>
                  <a target="_blank"
                    href="https://wildlifeinsights.org/about-wildlife-insights-ai#faqs"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                </div>
              )}>
              <button type="button">
                <img alt="" className="align-baseline" src="/static/ic_help_outline_24px.png" />
              </button>
            </Tooltip>
          </div>
          <span className="pt-1">
            <label className="switch">
              <input type="checkbox"
                checked={showBoundingBoxesOnImage}
                onChange={({ target }) => onToggleBoundingBoxes(target.checked)}
              />
              <span className="slider round" />
            </label>
          </span>
        </div>
        {
          showBoundingBoxesOnImage && (
            <div className="bbox-user-response">
              <p className="labels">Does every animal have a bounding box?</p>
              <div className="user-options">
                <button type="button"
                  className={classNames({
                    'btn btn-primary action-btn-1': true,
                    'active-btn': getDataFileResolved && data.getDataFile.hasBoundingBox
                  })}
                  onClick={() => onUserResponse(true)}
                >
                  Yes
                </button>
                <button type="button"
                  className={classNames({
                    'btn btn-primary action-btn-1': true,
                    'active-btn': getDataFileResolved && !data.getDataFile.hasBoundingBox
                  })}
                  onClick={() => onUserResponse(false)}
                >
                  No
                </button>
              </div>
            </div>
          )
        }
        <hr />
      </div>
    );
  }

  return (
    <div className="bounding-box-section mt-3">
      <hr />
      <p className="labels">
        {
          isBeforeBBoxCVModel
            ? 'This image predates bounding boxes.'
            : 'No bounding boxes were detected in this image.'
        }
      </p>
      <hr />
    </div>
  );
};

BBoxSettings.propTypes = {
  image: PropTypes.shape({}),
  showBoundingBoxesOnImage: PropTypes.bool.isRequired,
  showBoundingBoxSettings: PropTypes.bool.isRequired,
  onToggleBoundingBoxes: PropTypes.func.isRequired,
  displaySuccess: PropTypes.func.isRequired,
  displayError: PropTypes.func.isRequired,
};

BBoxSettings.defaultProps = {
  image: null
};

export default BBoxSettings;
