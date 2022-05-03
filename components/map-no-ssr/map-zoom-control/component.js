import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { MAP } from 'react-google-maps/lib/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

import Tooltip from 'components/tooltip';
import './style.scss';

const MapZoomControl = ({
  node,
  minZoom,
  maxZoom,
  enableKeyboardZoom,
  toggleImageControl
}, context) => {
  const map = context[MAP];

  const [zoom, setZoom] = useState(map.getZoom());

  const onClickZoomIn = () => setZoom(zoom + 1);
  const onClickZoomOut = () => setZoom(zoom - 1);

  useEffect(() => {
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    const onZoomChanged = () => setZoom(map.getZoom());
    const listener = google.maps.event.addListener(map, 'zoom_changed', onZoomChanged);
    return () => listener.remove();
  }, [map, setZoom]);

  useEffect(() => {
    const controls = map.controls[google.maps.ControlPosition.TOP_RIGHT];
    const index = controls.length;
    controls.push(node);

    return () => {
      controls.removeAt(index);
    };
  }, [map, node]);

  const handleKeyDown = (e) => {
    if (enableKeyboardZoom) {
      if (e.keyCode === 38) {
        e.preventDefault();
        onClickZoomIn();
      } else if (e.keyCode === 40) {
        e.preventDefault();
        onClickZoomOut();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const renderToggleImageControl = () => {
    if (toggleImageControl) {
      const { showOriginalImage, callBack } = toggleImageControl;
      return (
        <Tooltip
          trigger="mouseenter focus"
          placement="left"
          content={(
            <span className="text-left">
              {
                showOriginalImage ? 'View web-optimized image'
                  : 'View high resolution image'
              }
            </span>
          )}
        >
          <button
            type="button"
            className={
              `control-style mt-2 img-toggle-control img-toggle-control-${showOriginalImage
                ? 'active' : 'inactive'}`
            }
            onClick={() => {
              callBack(!showOriginalImage)
            }}
          >
            <img alt=""
              src={
                showOriginalImage ? "/static/expand_active.png"
                  : "/static/expand_inactive.png"
              }
            />
          </button>
        </Tooltip >
      );
    }
    return null;
  }

  return createPortal(
    <div className="c-map-zoom-control">
      <button
        type="button"
        className="control-style zoom-in"
        aria-label="Zoom in"
        onClick={onClickZoomIn}
        disabled={zoom >= maxZoom}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <button
        type="button"
        className="control-style zoom-out"
        aria-label="Zoom out"
        onClick={onClickZoomOut}
        disabled={zoom <= minZoom}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      {renderToggleImageControl()}
    </div >,
    node
  );
};

MapZoomControl.contextTypes = {
  [MAP]: PropTypes.shape({}),
};

export default MapZoomControl;
