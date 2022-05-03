import React, { PureComponent, Fragment } from 'react';
import { BasicRadioGroup, Radio, asField } from 'informed';
import classNames from 'classnames';
import nanoid from 'nanoid';

class RadioGroup extends PureComponent {
  state = { uniqueId: nanoid() }

  render() {
    const { fieldState, fieldApi, children, ...props } = this.props;
    const { uniqueId } = this.state;
    const { error } = fieldState;

    return (
      <Fragment>
        <BasicRadioGroup
          field={props.field}
          fieldState={fieldState}
          fieldApi={fieldApi}
          {...props}
          className={classNames('form-control', props.className, error && 'is-invalid ')}
          aria-describedby={`${props['aria-describedby'] || ''} ${uniqueId}-error`}
        >
          {children}
        </BasicRadioGroup>
        {error && (
          <div id={`${uniqueId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
      </Fragment>
    );
  }
}

const RadioGroupField = asField(RadioGroup);

export { RadioGroupField as RadioGroup, Radio };
