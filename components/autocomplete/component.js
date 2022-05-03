import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';

import LoadingSpinner from 'components/loading-spinner';
import './style.scss';

const Autocomplete = (
  {
    suggestions,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    getSuggestionValue,
    onSuggestionSelected,
    renderSuggestion,
    inputProps,
    loading,
  },
) => (
  <div className="c-autocomplete">
    {loading && <LoadingSpinner transparent inline mini />}
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      shouldRenderSuggestions={() => true}
      onSuggestionSelected={onSuggestionSelected}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  </div>
);

Autocomplete.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSuggestionsFetchRequested: PropTypes.func,
  onSuggestionsClearRequested: PropTypes.func,
  getSuggestionValue: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func.isRequired,
  renderSuggestion: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]).isRequired,
  inputProps: PropTypes.objectOf(PropTypes.any),
  loading: PropTypes.bool,
};

Autocomplete.defaultProps = {
  onSuggestionsFetchRequested: () => {
  },
  onSuggestionsClearRequested: () => {
  },
  inputProps: { className: 'form-control' },
  loading: false,
};

export default Autocomplete;
