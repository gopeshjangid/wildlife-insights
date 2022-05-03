import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faStarOfLife,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

import Tooltip from 'components/tooltip';
import './style.scss';

const CardView = ({
  gridType,
  isBurst,
  imageGroups,
  selectedImageGroups,
  setSelectedImageGroupIndex,
  setSelectedImageGroups,
  selectedImageGroupIndex,
}) => {
  const [mouseDown, setMouseDown] = useState(false);
  const handleKeyDown = (e) => {
    // START handle CTRL + A or Cmd + A
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 65) {
      e.preventDefault();
      const indexes = [];
      if (selectedImageGroups.length !== imageGroups.length) {
        const imagesLen = imageGroups.length;
        for (let i = 0; i < imagesLen; i += 1) {
          indexes.push(i);
        }
        setSelectedImageGroups(indexes);
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
    if (selectedImageGroupIndex === null) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedImageGroupIndex]);

  const handleShiftClick = (index) => {
    const newSelectedDataFileIds = [...selectedImageGroups];
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
    setSelectedImageGroups(newSelectedDataFileIds);
  };

  const toggleSelectedImageGroups = (index) => {
    if (selectedImageGroups.indexOf(index) !== -1) {
      const newSelectedDataFileIds = [...selectedImageGroups];
      newSelectedDataFileIds.splice(
        selectedImageGroups.indexOf(index),
        1,
      );
      setSelectedImageGroups(newSelectedDataFileIds);
    } else {
      setSelectedImageGroups([...selectedImageGroups, index]);
    }
  };

  const handleCtrlClick = (index) => {
    toggleSelectedImageGroups(index);
  };

  const handleMouseOver = (e, index) => {
    const newSelectedDataFileIds = [...selectedImageGroups];
    if (mouseDown && newSelectedDataFileIds.indexOf(index) === -1) {
      newSelectedDataFileIds.push(index);
    }
    setSelectedImageGroups(newSelectedDataFileIds);
  };

  return (
    <div className="row c-card-view">
      {imageGroups.map((imageGroup, index) => {
        const firstImage = imageGroup[0];

        return (
          <div key={firstImage.id}
            className={`col-6 col-md-3 col-xl col-xl-${gridType}`}
          >
            <div className="image">
              <button
                type="button"
                className="image-button"
                aria-label={
                  imageGroup.length === 1
                    ? `Open ${firstImage.filename}`
                    : `Open burst (${imageGroup.length} photos)`
                }
                style={{ backgroundImage: `url(${firstImage.thumbnailUrl})` }}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    handleCtrlClick(index);
                  } else if (e.shiftKey) {
                    handleShiftClick(index);
                  } else {
                    setSelectedImageGroupIndex(index);
                  }
                }}
                onMouseOver={(e) => { handleMouseOver(e, index); }}
                onFocus={() => undefined}
              />
              <div
                className={classnames('checkbox', {
                  '-visible': selectedImageGroups.indexOf(index) !== -1,
                })}
              >
                <input
                  type="checkbox"
                  name="card-view-checkbox"
                  checked={selectedImageGroups.indexOf(index) !== -1}
                  onChange={() => {
                    toggleSelectedImageGroups(index);
                  }}
                  aria-label={
                    imageGroup.length === 1
                      ? `Select photo ${firstImage.filename}`
                      : `Select burst (${imageGroup.length} photos)`
                  }
                />
                <div />
              </div>
              {!isBurst && firstImage.status === 'CV' && (
                <Tooltip
                  trigger="mouseenter focus"
                  distance={10}
                  placement="top"
                  content={<span>Computer vision</span>}
                >
                  <div className="identification-badge -yellow">
                    <FontAwesomeIcon icon={faStarOfLife} />
                  </div>
                </Tooltip>
              )}
              {!isBurst && firstImage.status === 'BLANK' && (
                <Tooltip
                  trigger="mouseenter focus"
                  distance={10}
                  placement="top"
                  content={<span>Blank</span>}
                >
                  <div className="identification-badge -white">
                    <FontAwesomeIcon icon={faTimes} />
                  </div>
                </Tooltip>
              )}
              {!isBurst && firstImage.status === 'VERIFIED' && (
                <Tooltip
                  trigger="mouseenter focus"
                  distance={10}
                  placement="top"
                  content={<span>Verified</span>}
                >
                  <div className="identification-badge -green">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                </Tooltip>
              )}
              {isBurst && (
                <span className="badge badge-pill badge-danger">
                  {imageGroup.length}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

CardView.propTypes = {
  gridType: PropTypes.string.isRequired,
  isBurst: PropTypes.bool.isRequired,
  imageGroups: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
  ).isRequired,
  selectedImageGroups: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedImageGroupIndex: PropTypes.func.isRequired,
  setSelectedImageGroups: PropTypes.func.isRequired,
};

export default CardView;
