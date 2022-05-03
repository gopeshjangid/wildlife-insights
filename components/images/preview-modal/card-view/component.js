import React, { Fragment, useEffect, useState } from 'react';
import { forEach, map } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { exists } from 'utils/functions';
import './style.scss';

const CardView = ({
  imageGroups,
  selectedBurstImageGroups,
  setSelectedBurstImageGroups,
  selectedImageGroupIndex,
  identify,
  gridType,
  setIsSingleBurstPreview,
  setSelectedImageIndex,
  flagImageSelection,
  projectType,
  tab
}) => {
  const imageGroup = imageGroups[0];
  const [mouseDown, setMouseDown] = useState(false);
  const handleKeyDown = (e) => {
    // START handle CTRL + A or Cmd + A
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 65) {
      e.preventDefault();
      const indexes = [];
      if (selectedBurstImageGroups.length !== imageGroup.length) {
        const imagesLen = imageGroup.length;
        for (let i = 0; i < imagesLen; i += 1) {
          indexes.push(i);
        }
        setSelectedBurstImageGroups(indexes);
      }
    }
    // END handle CTRL + A or Cmd + A
  };

  const handleMouseDown = () => {
    setMouseDown(true);
  };

  const handleMouseUp = () => {
    setMouseDown(false);
  };

  useEffect(() => {
    if (flagImageSelection) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      setSelectedBurstImageGroups([]);
    };
  }, []);

  useEffect(() => {
    setSelectedBurstImageGroups([]);
  }, [selectedImageGroupIndex]);

  const handleShiftClick = (index) => {
    const newSelectedDataFileIds = [...selectedBurstImageGroups];
    let prevIndex;
    let nextIndex;
    for (let i = index; i >= 0; i -= 1) {
      if (newSelectedDataFileIds.indexOf(i) !== -1 && prevIndex === undefined) {
        prevIndex = i;
      }
    }
    if (prevIndex === undefined) {
      prevIndex = index;
    }
    for (let j = index + 1; j < imageGroups.length; j += 1) {
      if (newSelectedDataFileIds.indexOf(j) !== -1 && nextIndex === undefined) {
        nextIndex = j;
      }
    }
    if (nextIndex === undefined) {
      nextIndex = index;
    }
    for (let k = prevIndex; k <= nextIndex; k += 1) {
      if (newSelectedDataFileIds.indexOf(k) === -1) {
        newSelectedDataFileIds.push(k);
      }
    }
    setSelectedBurstImageGroups(newSelectedDataFileIds);
  };

  const toggleselectedBurstImageGroups = (index) => {
    if (flagImageSelection) {
      if (selectedBurstImageGroups.indexOf(index) !== -1) {
        const newSelectedDataFileIds = [...selectedBurstImageGroups];
        newSelectedDataFileIds.splice(
          selectedBurstImageGroups.indexOf(index),
          1,
        );
        setSelectedBurstImageGroups(newSelectedDataFileIds);
      } else {
        setSelectedBurstImageGroups([...selectedBurstImageGroups, index]);
      }
    }
  };

  const handleCtrlClick = (index) => {
    toggleselectedBurstImageGroups(index);
  };

  const handleMouseOver = (e, index) => {
    const newSelectedDataFileIds = [...selectedBurstImageGroups];
    if (mouseDown && newSelectedDataFileIds.indexOf(index) === -1) {
      newSelectedDataFileIds.push(index);
      setSelectedBurstImageGroups(newSelectedDataFileIds);
    }
  };

  const {
    identificationsPerPhoto,
    confirmedIdslabels,
    seqIdsClassifiedByUser
  } = identify;
  return (
    <div className="row c-card-view-burst">
      {imageGroups[0].map((firstImage, index) => {
        const isSequenceProject = projectType === 'sequence';
        const recordId = isSequenceProject ? +firstImage.sequenceId : +firstImage.id;
        const imgIdentifications = identificationsPerPhoto[recordId] || [{}];
        const cnfIdentification = imgIdentifications[0];
        let isClassified = cnfIdentification?.identificationMethod?.mlIdentification;

        if (isSequenceProject && tab === 'identify'
          && exists(cnfIdentification?.identificationMethod?.mlIdentification)
          && !cnfIdentification?.identificationMethod?.mlIdentification
          && seqIdsClassifiedByUser.indexOf(recordId) === -1) {
          isClassified = true;
        }
        const badgeClassName = isClassified ? 'dotted-badge' : 'solid-badge';
        const commonNames = [];

        forEach(cnfIdentification.identifiedObjects, (identifiedObject) => {
          const lbl = confirmedIdslabels[identifiedObject.taxonomyId] || '';
          if (!commonNames.includes(lbl)) {
            commonNames.push(lbl);
          }
        });

        return (
          <div key={firstImage.id}
            className={classnames('col-6 col-md-3 col-xl card', { 'col-xl-tile': gridType === 'tile' })}>
            <div className="image">
              <button
                type="button"
                className={classnames('image-button', { 'image-button-checked': selectedBurstImageGroups.indexOf(index) !== -1 })}
                aria-label={
                  imageGroup.length === 1
                    ? `Open ${firstImage.filename}`
                    : `Open burst (${imageGroup.length} photos)`
                }
                style={{ backgroundImage: `url(${firstImage.thumbnailUrl})` }}
                onDoubleClick={() => {
                  setIsSingleBurstPreview(true);
                  setSelectedImageIndex(index);
                }}
                onClick={(e) => {
                  if (flagImageSelection) {
                    if (e.ctrlKey || e.metaKey) {
                      handleCtrlClick(index);
                    } else if (e.shiftKey) {
                      handleShiftClick(index);
                    }
                  }
                }}
                onMouseOver={(e) => {
                  if (flagImageSelection) {
                    handleMouseOver(e, index);
                  }
                }}
                onFocus={() => undefined}
              />
              {flagImageSelection
                && (
                  <Fragment>
                    <div
                      className={classnames('checkbox', {
                        '-visible': selectedBurstImageGroups.indexOf(index) !== -1
                      })}
                    >
                      <input
                        type="checkbox"
                        name="card-view-checkbox"
                        checked={selectedBurstImageGroups.indexOf(index) !== -1}
                        onChange={() => {
                          toggleselectedBurstImageGroups(index);
                        }}
                        aria-label={
                          imageGroup.length === 1
                            ? `Select photo ${firstImage.filename}`
                            : `Select burst (${imageGroup.length} photos)`
                        }
                      />
                      <div />
                    </div>
                  </Fragment>
                )}
              <div className={classnames('d-flex common-name', { 'common-name-selected': selectedBurstImageGroups.indexOf(index) !== -1 })}>
                {
                  map(commonNames, (val) => {
                    return (
                      <div key={val} className={`common-name-label ${badgeClassName}`}>{val}</div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

CardView.defaultProps = {
  selectedImageGroupIndex: null
};

CardView.propTypes = {
  selectedImageGroupIndex: PropTypes.number,
  imageGroups: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
  ).isRequired,
  selectedBurstImageGroups: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedBurstImageGroups: PropTypes.func.isRequired,
  setSelectedImageIndex: PropTypes.func.isRequired,
  identify: PropTypes.shape({}).isRequired,
  gridType: PropTypes.string.isRequired,
  setIsSingleBurstPreview: PropTypes.func.isRequired,
  flagImageSelection: PropTypes.bool.isRequired,
  projectType: PropTypes.string.isRequired,
  tab: PropTypes.string.isRequired
};

export default CardView;
