import React, { PureComponent, Fragment } from 'react';
import { BasicCheckbox, asField } from 'informed';
import classNames from 'classnames';
import nanoid from 'nanoid';

class Checkbox extends PureComponent {
  state = { uniqueId: nanoid() }

  render() {
    const { fieldState, fieldApi, ...props } = this.props;
    const { uniqueId } = this.state;
    const { error } = fieldState;

    return (
      <Fragment>
        {error && (
          <div id={`${uniqueId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
        <BasicCheckbox
          fieldApi={fieldApi}
          fieldState={fieldState}
          {...props}
          className={classNames('form-check-input', props.className, error && 'is-invalid')}
          aria-describedby={`${props['aria-describedby'] || ''} ${uniqueId}-error`}
        />
      </Fragment>
    );
  }
}

export default asField(Checkbox);
