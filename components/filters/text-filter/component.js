import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const TextFilter = (props) => {
  const { id, disabled, placeholder, onChange } = props;
  const [search, setSearch] = useState('');

  const onInputChange = ({ value }) => {
    setSearch(value);
    onChange(value);
  };

  const clearSearch = () => {
    setSearch('');
    onChange('');
  };
  return (
    <div className="c-text-filter">
      <input
        id={id}
        value={search}
        disabled={disabled}
        placeholder={placeholder}
        type="text"
        onChange={({ target }) => { onInputChange(target); }}
      />
      {!search
        && <img className="searchicon" alt="" src="/static/ic_search_18px.png" />
      }
      {search
        && (
          <button type="button" onClick={clearSearch}>
            <img
              className="close-image"
              alt=""
              src="/static/ic_clear_14px.png"
            />
          </button>
        )
      }
    </div>
  );
};

TextFilter.propTypes = {
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

TextFilter.defaultProps = {
  disabled: false,
  placeholder: 'Search'
};

export default TextFilter;
