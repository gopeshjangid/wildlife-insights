import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { asField } from 'informed';
import AsyncSelect from 'react-select/lib/Async';
import nanoid from 'nanoid';

import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import './style.scss';

class LookupSelect extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    fetchInitialOptions: PropTypes.func.isRequired,
    fetchResults: PropTypes.func.isRequired,
    initialLoadingSpinner: PropTypes.bool
  }

  static defaultProps = {
    onChange: () => null,
    initialLoadingSpinner: true
  }

  state = { uniqueId: nanoid(), isLoading: true }

  isMounted = true;

  componentDidMount() {
    this.populateInitialOptions();
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  updateState = obj => {
    if (this.isMounted) {
      this.setState(obj);
    }
  };

  async populateInitialOptions() {
    const { fetchInitialOptions, onChange, fieldState, fieldApi } = this.props;
    const { value } = fieldState;
    const { setValue } = fieldApi;

    let completeOptions;
    if (Array.isArray(value)) {
      completeOptions = await fetchInitialOptions((value || []).map(option => option.value));
    } else {
      completeOptions = await fetchInitialOptions([].map(option => option.value));
    }

    try {
      setValue(completeOptions);
    } catch (e) { } // eslint-disable-line no-empty

    if (onChange) {
      onChange(completeOptions);
    }

    this.updateState({ isLoading: false });
  }

  render() {
    const {
      fieldState,
      fieldApi,
      fetchResults,
      initialLoadingSpinner,
      ...props
    } = this.props;
    const { error, value } = fieldState;
    const { setValue, setTouched } = fieldApi;
    const { onChange, onBlur, initialValue, forwardedRef, ...rest } = props;
    const { uniqueId, isLoading } = this.state;

    if (isLoading && initialLoadingSpinner) {
      return (
        <div>
          <LoadingSpinner inline mini />
          <T text="Loading..." />
        </div>
      );
    }

    return (
      <Fragment>
        <AsyncSelect
          ref={(node) => {
            this.el = node;
          }}
          isClearable={false}
          isDisabled={!!rest.disabled}
          inputId={rest.id}
          {...rest}
          id={null}
          // Needed so we can reset the select using Informed's setValue elsewhere
          // https://github.com/joepuzzo/informed/issues/34
          value={value === undefined ? null : value}
          classNamePrefix="c-form-lookup-select"
          aria-describedby={`${props['aria-describedby']} ${uniqueId}-error`}
          onChange={(v) => {
            setValue(v);
            if (onChange) {
              onChange(v);
            }
          }}
          onBlur={(e) => {
            setTouched();
            if (onBlur) {
              onBlur(e);
            }
          }}
          defaultOptions
          loadOptions={fetchResults}
          cacheOptions
        />
        <input
          tabIndex={-1}
          autoComplete={props.autoComplete}
          value={value || ''}
          required={props.required}
          onChange={props.onChange}
          className="sr-only"
          onFocus={() => this.el.focus()}
        />
        {error && (
          <div id={`${uniqueId}-maxLength`} className="invalid-feedback">
            {error}
          </div>
        )}
      </Fragment>
    );
  }
}

export default asField(LookupSelect);
