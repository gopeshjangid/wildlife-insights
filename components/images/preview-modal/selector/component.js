import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import GridSizeButton from 'components/shared/grid-size-button';
import CardView from 'components/images/preview-modal/card-view';
import Tooltip from 'components/tooltip';
import { exists, getFormattedUTCDate } from 'utils/functions';

import './style.scss';

const getDateInUTC = str => getFormattedUTCDate(str, 'MM/dd/yyyy HH:mm:ss');

const ImageSelector = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  identify,
  isSequenceProject,
  tab
}) => {
  const [gridType, setGridType] = useState('grid');
  const {
    identificationsPerPhoto,
    state: identifyState,
    seqIdsClassifiedByUser
  } = identify;
  const imageCount = images.length;
  const onClickPrevious = () => {
    setSelectedImageIndex(selectedImageIndex > 0
      ? selectedImageIndex - 1
      : imageCount - 1);
  };

  const onClickNext = () => {
    setSelectedImageIndex(selectedImageIndex < imageCount - 1
      ? selectedImageIndex + 1
      : 0);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 39) {
      e.preventDefault();
      onClickNext();
    } else if ((e.ctrlKey || e.metaKey) && e.keyCode === 37) {
      e.preventDefault();
      onClickPrevious();
    }
  };

  useEffect(() => {
    // This code makes sure that if a user deletes the last photo of a burst,
    // the selected photo is moved to the last one remaining
    if (imageCount && selectedImageIndex > imageCount - 1) {
      setSelectedImageIndex(imageCount - 1);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageCount, selectedImageIndex, setSelectedImageIndex]);

  let classifiedCount = 0;
  if (identifyState !== 'loading') {
    images.forEach((firstImage) => {
      const recordId = isSequenceProject ? +firstImage.sequenceId : +firstImage.id;
      const imgIdentifications = identificationsPerPhoto[recordId] || [{}];
      const cnfIdentification = imgIdentifications[0];
      let isIdentifiedByCV = cnfIdentification?.identificationMethod?.mlIdentification;

      if (isSequenceProject && tab === 'identify'
        && exists(cnfIdentification?.identificationMethod?.mlIdentification)
        && !cnfIdentification?.identificationMethod?.mlIdentification
        && seqIdsClassifiedByUser.indexOf(recordId) === -1) {
        isIdentifiedByCV = true;
      }

      if (exists(isIdentifiedByCV) && !isIdentifiedByCV) {
        classifiedCount += 1;
      }
    });
  }

  const firstImage = images[0] || { deployment: {} };

  return (
    <div className="c-image-selector">
      <div className="header">
        <div className="deployment-info">
          <div className="title-holder">
            <div className="title">{firstImage?.deployment?.deploymentName}</div>
            <div className="subtitle">Date taken: {getDateInUTC(firstImage?.timestamp)}</div>
          </div>

          <div className="separator"></div>

          <div>
            <div className="title">{classifiedCount}/{images?.length}</div>
            <div className="classified-row">
              <div className="subtitle">Classified</div>
              <div className="more-info">
                <Tooltip placement="right"
                  trigger="mouseenter focus"
                  content={(
                    <div>
                      Learn how to work with{' '}
                      <a target="_blank"
                        href="https://www.wildlifeinsights.org/get-started/review-identifications#bursts"
                        rel="noopener noreferrer"
                      >
                        Bursts
                      </a>
                      {' '}and{' '}
                      <a target="_blank"
                        href="https://www.wildlifeinsights.org/get-started/review-identifications/sequence-projects"
                        rel="noopener noreferrer"
                      >
                        Sequences
                      </a>
                    </div>
                  )}>
                  <button
                    type="button"
                    className="btn btn-link m-0 p-0"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-options">
          <GridSizeButton gridType={gridType}
            setGridType={type => setGridType(type)} />
        </div>
      </div>

      <div className="card-section">
        <CardView imageGroups={[images]} gridType={gridType} />
      </div>
    </div>
  );
};

ImageSelector.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({ thumbnailUrl: PropTypes.string })
  ),
  selectedImageIndex: PropTypes.number.isRequired,
  setSelectedImageIndex: PropTypes.func.isRequired,
  identify: PropTypes.shape({}).isRequired,
  isSequenceProject: PropTypes.bool.isRequired,
  tab: PropTypes.string.isRequired
};

ImageSelector.defaultProps = {
  images: []
};

export default ImageSelector;
