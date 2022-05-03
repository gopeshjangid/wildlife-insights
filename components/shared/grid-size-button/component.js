import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faThLarge } from '@fortawesome/free-solid-svg-icons';

import './style.scss';

const GridSizeButton = ({ gridType, setGridType }) => {
  return (
    <div className="c-grid-size-control">
      <span className="mr-3">Grid Size</span>
      <button
        type="button"
        className={`btn btn-sm btn-icon mr-2 ${gridType === 'grid' ? 'active-selection' : ''}`}
        onClick={() => setGridType('grid')}
      >
        <FontAwesomeIcon icon={faTh} />
      </button>
      <button
        type="button"
        className={`btn btn-sm btn-icon ${gridType === 'tile' ? 'active-selection' : ''}`}
        onClick={() => setGridType('tile')}
      >
        <FontAwesomeIcon icon={faThLarge} />
      </button>
    </div>
  );
};

GridSizeButton.propTypes = {
  gridType: PropTypes.string.isRequired,
  setGridType: PropTypes.func.isRequired
};

export default GridSizeButton;
