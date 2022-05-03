import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

class CheckboxFilter extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    selected: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  }

  static defaultProps = {
    disabled: false
  }

  onChange = (e) => {
    const { onChange } = this.props;
    onChange(e.target.checked);
  }

  render() {
    const { id, label, disabled, selected } = this.props;

    return (
      <div className="c-checkbox-filter form-check">
        <input
          type="checkbox"
          id={id}
          className="form-check-input"
          value={selected}
          onChange={this.onChange}
          disabled={disabled}
        />
        <label htmlFor={id} className="form-check-label">
          {label}
        </label>
      </div>
    );
  }
}

export default CheckboxFilter;
