import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import nanoid from 'nanoid';
import { asField } from 'informed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { exists } from 'utils/functions';

// This can't be transformed into a function because there's some type issues with informed
class ToggleButton extends PureComponent {
  state = {
    uniqueId: nanoid(),
  }

  render() {
    const { fieldState, fieldApi, label, className, disabled } = this.props;
    const { uniqueId } = this.state;
    const { value, error } = fieldState;

    return (
      <Fragment>
        <button
          type="button"
          className={`btn ${exists(className) ? className : ''} ${value === true ? 'active' : ''}`}
          data-toggle="button"
          aria-pressed={value === true}
          aria-disabled={disabled}
          disabled={disabled}
          onClick={() => !disabled && fieldApi.setValue(!value)}
        >
          <FontAwesomeIcon icon={value === true ? faCheckCircle : faCircle} className="mr-2" />
          {label}
        </button>
        {error && (
          <div id={`${uniqueId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
      </Fragment>
    );
  }
}

ToggleButton.propTypes = {
  fieldState: PropTypes.shape({ value: PropTypes.any, error: PropTypes.any }).isRequired,
  fieldApi: PropTypes.shape({ setValue: PropTypes.func }).isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

ToggleButton.defaultProps = {
  className: undefined,
  disabled: false,
};

export default asField(ToggleButton);
