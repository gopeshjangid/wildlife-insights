import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { uniq } from 'lodash';

import { SEQUENCE_PROJECT } from 'utils/app-constants';

const NoIdentificationState = ({
  images,
  isBurst,
  projectType,
  isSingleBurstPreview,
  bulkSelectedIdsInBurst,
  selectedImageIndex,
  canIdentify,
  onClickMarkAsBlank,
  onClickMarkAsBlankInBurst,
  onClickAddIdentification
}) => {

  const entityKeyId = projectType === SEQUENCE_PROJECT ? 'sequenceId' : 'id';
  const handleMarkAsBlank = () => {
    if (isBurst) {
      let entityIds = [];
      if (isSingleBurstPreview) {
        const id = images.length && images[selectedImageIndex] ?
          (images[selectedImageIndex])[entityKeyId] : null;
        if (id) {
          entityIds = [...entityIds, id];
        }
      } else {
        if (Array.isArray(bulkSelectedIdsInBurst) && bulkSelectedIdsInBurst.length) {
          entityIds = [...entityIds, ...bulkSelectedIdsInBurst];
        } else {
          images.forEach(image => {
            if (image[entityKeyId]) {
              entityIds.push(image[entityKeyId]);
            }
          });
        }
      }

      onClickMarkAsBlankInBurst({
        identifiedObjects: [],
        entityIds: uniq(entityIds)
      });
    } else {
      onClickMarkAsBlank();
    }
  };

  const handleAddIdentification = () => {
    let entityIds = [];
    if (isBurst) {
      if (isSingleBurstPreview) {
        const id = images.length && images[selectedImageIndex] ?
          (images[selectedImageIndex])[entityKeyId] : null;
        if (id) {
          entityIds = [...entityIds, id];
        }
      } else {
        if (Array.isArray(bulkSelectedIdsInBurst) && bulkSelectedIdsInBurst.length) {
          entityIds = [...entityIds, ...bulkSelectedIdsInBurst];
        } else {
          images.forEach(image => {
            if (image[entityKeyId]) {
              entityIds.push(image[entityKeyId]);
            }
          });
        }
      }
    }

    onClickAddIdentification(entityIds);
  };

  return (
    <Fragment>
      <div className="scroll-container">
        <div className="message">No identification</div>
      </div>
      {canIdentify && (
        <div className="fixed-container mt-3 text-center">
          <button
            type="button"
            className="btn btn-secondary btn-sm mb-3"
            onClick={handleMarkAsBlank}
          >
            Mark as blank
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddIdentification}
          >
            Add identification
          </button>
        </div>
      )}
    </Fragment>
  )
};

NoIdentificationState.propTypes = {
  images: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  isBurst: PropTypes.bool.isRequired,
  projectType: PropTypes.string.isRequired,
  isSingleBurstPreview: PropTypes.bool.isRequired,
  bulkSelectedIdsInBurst: PropTypes.array,
  selectedImageIndex: PropTypes.number.isRequired,
  canIdentify: PropTypes.bool.isRequired,
  onClickMarkAsBlank: PropTypes.func.isRequired,
  onClickMarkAsBlankInBurst: PropTypes.func.isRequired,
  onClickAddIdentification: PropTypes.func.isRequired
};

NoIdentificationState.defaultProps = {
  bulkSelectedIdsInBurst: null,
};

export default NoIdentificationState;
