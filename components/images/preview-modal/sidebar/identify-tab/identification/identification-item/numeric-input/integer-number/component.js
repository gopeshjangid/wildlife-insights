import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const IntegerInput = ({
  id,
  min,
  max,
  defaultValue,
  value,
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value || defaultValue || '');

  useEffect(() => {
    onChange(inputValue);
  }, []);

  const onInputChange = e => {
    let newValue = e.target.value;
    if (min && newValue < min) {
      newValue = '';
    } else if (max && newValue > max) {
      newValue = inputValue;
    }

    if (newValue !== inputValue) {
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  const onInputKeyPress = e => {
    let key = e.charCode || e.keyCode || 0;
    // disallow decimal key for integer only input
    if (key === 46) {
      e.preventDefault();
    }
  };

  const onInputBlur = e => {
    const fieldValue = e.target.value;
    if (defaultValue && (fieldValue === '' || fieldValue === null || fieldValue === undefined)) {
      setInputValue(defaultValue);
      onChange(defaultValue);
    }
  };

  return (
    <div className="c-integer-input">
      <input type="number"
        id={id}
        className="form-control form-control-sm"
        value={inputValue}
        onChange={onInputChange}
        onKeyPress={onInputKeyPress}
        onBlur={onInputBlur}
        {...min ? { min: min } : ''}
        {...max ? { max: max } : ''}
      />
    </div>
  );
};

IntegerInput.propTypes = {
  id: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  defaultValue: PropTypes.number,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  onChange: PropTypes.func
};

IntegerInput.defaultProps = {
  id: 'integer-input',
  min: null,
  max: null,
  defaultValue: null,
  value: null,
  onChange: () => {
  },
};

export default IntegerInput;
