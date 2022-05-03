import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import IntegerInput from './numeric-input/integer-number';

class IdentificationItem extends PureComponent {
  static propTypes = {
    readOnly: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    renderEmptyValue: PropTypes.bool,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
    ]),
    min: PropTypes.number,
    max: PropTypes.number,
    defaultValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
    ]),
    pageSize: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    renderEmptyValue: false,
    value: null,
    pageSize: null,
    onChange: () => {
    },
  };

  render() {
    const {
      readOnly,
      label,
      type,
      renderEmptyValue,
      value,
      options,
      pageSize,
      onChange,
      min,
      max,
      defaultValue
    } = this.props;

    // If the item is read-only, we don't display any input
    if (readOnly) {
      if (!renderEmptyValue && (value === null || value === undefined)) {
        return null;
      }

      return (
        <div className="form-group row">
          <div className="col-5 label">{label}</div>
          <div className="col-7">
            <span>{value && value.toString()}</span>
          </div>
        </div>
      );
    }

    // Otherwise, we need to compute a unique id for the
    // input and we make sure the value of the input is not null
    // or undefined as the input is controlled
    const slug = `identification-item-${label.replace(/\s/g, '-')}`;
    let inputValue = value;
    if (value === null || value === undefined) {
      if (type === 'text') {
        inputValue = '';
      } else if (type === 'checkbox') {
        inputValue = false;
      }
    }

    // The autocomplete input is way different from the others
    if (type === 'autocomplete') {
      return (
        <div className="form-group row">
          <div className="col-12">
            <Select
              isClearable={false}
              classNamePrefix="c-form-select"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                }
              }}
              {...this.props}
              inputId={slug}
              value={
                inputValue !== null && inputValue !== undefined
                  ? options.find(o => o.value === inputValue)
                  : inputValue
              }
              options={options}
              onChange={(option) => {
                if (!Array.isArray(option)) {
                  // @ts-ignore
                  onChange(option.value);
                }
              }}
              components={{
                ...(pageSize ? {
                  MenuList: props => (
                    <components.MenuList {...props}>
                      <div className="menu-header">
                        <span>Only the first</span>
                        <span> {pageSize} </span>
                        <span>results are shown</span>
                      </div>
                      {props.children}
                    </components.MenuList>
                  ),
                } : {}),
              }}
            />
          </div>
        </div>
      );
    }

    // The select input is also using a custom element
    if (type === 'select') {
      return (
        <div className="form-group row">
          <label className="col-5" htmlFor={slug}>
            {label}
          </label>
          <div className="col-7">
            <Select
              isClearable={false}
              classNamePrefix="c-form-select"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                }
              }}
              {...this.props}
              inputId={slug}
              value={
                inputValue !== null && inputValue !== undefined
                  ? options.find(o => o.value === inputValue)
                  : inputValue
              }
              options={options}
              onChange={option => onChange(option.value)}
            />
          </div>
        </div>
      );
    }

    // integerinput is a custom element(to allow for integers only)
    if (type === 'integerinput') {
      return (
        <div className="form-group row">
          <label className="col-5" htmlFor={slug}>
            {label}
          </label>
          <div className="col-7">
            <IntegerInput
              id={slug}
              min={min}
              max={max}
              defaultValue={defaultValue}
              value={inputValue}
              onChange={onChange} />
          </div>
        </div>
      );
    }

    return (
      <div className="form-group row">
        <label className="col-5" htmlFor={slug}>
          {label}
        </label>
        <div className="col-7">
          <input
            type={type}
            id={slug}
            className="form-control form-control-sm"
            {...type === 'checkbox'
              ? { checked: inputValue }
              : { value: inputValue }}
            onChange={({ target }) => {
              if (type === 'checkbox') {
                onChange(target.checked);
              } else {
                onChange(target.value);
              }
            }}
          />
        </div>
      </div>
    );
  }
}

export default IdentificationItem;
