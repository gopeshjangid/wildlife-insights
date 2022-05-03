import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { asField } from 'informed';
import ReactSelect from 'react-select';
import nanoid from 'nanoid';

import './style.scss';

class Select extends PureComponent {
  static propTypes = {
    // @ts-ignore
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = { onChange: () => null };

  state = { uniqueId: nanoid() };

  render() {
    const { fieldState, fieldApi, ...props } = this.props;
    const { error, value } = fieldState;
    const { setValue, setTouched } = fieldApi;
    const { onChange, onBlur, initialValue, forwardedRef, customComponent, ...rest } = props;
    const { uniqueId } = this.state;

    if (value && value.value && !value.label) {
      const existingOption = rest.options.find(o => o.value === value.value);
      value.label = existingOption ? existingOption.label : null;
    }

    return (
      <Fragment>
        <ReactSelect
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
          classNamePrefix="c-form-select"
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
          components={customComponent ? { Option: customComponent } : null}
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
        {
          error && (
          <div id={`${uniqueId}-maxLength`} className="invalid-feedback">
            {error}
          </div>
          )
        }
      </Fragment>
    );
  }
}

export default asField(Select);
