import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { asField } from 'informed';
import Creatable from 'react-select/lib/Creatable';

import './style.scss';

class CreatableSelect extends PureComponent {
  static propTypes = {
    // @ts-ignore
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = { onChange: () => null };

  render() {
    const { fieldState, fieldApi, ...props } = this.props;
    const { error, value } = fieldState;
    const { setValue, setTouched } = fieldApi;
    const { onChange, onBlur, onCreateOption, ...rest } = props;

    return (
      <Fragment>
        <Creatable
          ref={(node) => {
            this.el = node;
          }}
          isClearable
          isDisabled={!!rest.disabled}
          inputId={rest.id}
          {...rest}
          id={null}
          value={value}
          classNamePrefix="c-form-select"
          onChange={(v) => {
            setValue(v);
            if (onChange) onChange(v);
          }}
          onBlur={(e) => {
            setTouched();
            if (onBlur) onBlur(e);
          }}
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
            <div className="invalid-feedback">
              {error}
            </div>
          )
        }
      </Fragment>
    );
  }
}

export default asField(CreatableSelect);
