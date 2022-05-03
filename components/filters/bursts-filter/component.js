import React from 'react';
import PropTypes from 'prop-types';

import T from 'components/transifex/translate';

import './style.scss';

const BurstsFilter = ({ selected, min, max, onChange, title, shouldDisable }) => (
  <div className="c-bursts-filter">
    <div className="input-group">
      <div className="input-group-prepend">
        <span className="input-group-text" id="filter-time-window-prepend">
          <T text={title} />:
        </span>
      </div>
      <input
        className="form-control"
        aria-describedby="filter-time-window-prepend filter-time-window-append"
        type="number"
        min={min}
        max={max}
        step="1"
        disabled={shouldDisable}
        value={selected}
        onChange={({ target }) => {
          const value = +target.value;
          if (!Number.isNaN(value)) {
            const clampedValue = Math.max(min, Math.min(max, value));
            onChange(clampedValue);
          }
        }}
        style={{ width: `calc(${`${selected}`.length}ch + 2rem)` }}
      />
      <div className="input-group-append">
        <span className="input-group-text" id="filter-time-window-append">
          <T text="sec" />
        </span>
      </div>
    </div>
  </div>
);

BurstsFilter.propTypes = {
  selected: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  shouldDisable: PropTypes.bool,
  title: PropTypes.string
};

BurstsFilter.defaultProps = {
  min: 0,
  max: 600,
  shouldDisable: false,
  title: 'Bursts'
};

export default BurstsFilter;
