import React, { PureComponent, Fragment } from 'react';
import { TextArea as BasicTextArea, asField } from 'informed';
import classNames from 'classnames';
import nanoid from 'nanoid';

class TextArea extends PureComponent {
  state = { uniqueId: nanoid() };

  render() {
    const { fieldState, ...props } = this.props;
    const { uniqueId } = this.state;
    const { value, error } = fieldState;

    return (
      <Fragment>
        <BasicTextArea
          field={props.field}
          {...props}
          className={classNames(
            'form-control',
            props.className,
            error && 'is-invalid ',
          )}
          aria-describedby={`${props['aria-describedby'] || ''} ${uniqueId}-maxLength ${uniqueId}-error`}
        />
        {
          error && (
            <div id={`${uniqueId}-error`} className="invalid-feedback">
              {error}
            </div>
          )
        }
        {
          props.maxLength && (
            <small
              id={`${uniqueId}-maxLength`}
              className="form-text text-muted"
            >
              {
                value && value !== undefined && value.length > 0
                  ? `${value.length}/${props.maxLength} characters.`
                  : `${props.maxLength} characters maximum.`
              }
            </small>
          )
        }
      </Fragment>
    );
  }
}

export default asField(TextArea);
