import React, { PureComponent, Fragment } from 'react';
import { asField } from 'informed';
import nanoid from 'nanoid';

import { exists } from 'utils/functions';
import ImagesDropzone from 'components/images/dropzone';

class UploadInput extends PureComponent {
  static parseValue(value) {
    const parse = item => ({
      id: item.id,
      name: item.linkPublic,
      type: 'image/jpeg',
      url: item.linkPublic,
      alt: item.text || '',
    });

    if (Array.isArray(value)) {
      return value.map(item => parse(item));
    }

    if (exists(value)) {
      return [parse(value)];
    }

    return value;
  }

  state = {
    uniqueId: nanoid(),
  }

  onChange(files) {
    const { fieldApi } = this.props;
    const { setValue } = fieldApi;
    setValue(files);
  }

  render() {
    const { fieldState, id, multiple, options, ...rest } = this.props;
    const { value, error } = fieldState;
    const { uniqueId } = this.state;

    return (
      <Fragment>
        <div className="c-form-upload-input">
          <ImagesDropzone
            images={value}
            onChange={files => this.onChange(files)}
            options={{
              ...options,
              multiple: exists(multiple) ? multiple : true,
              inputProps: {
                ...((options && options.inputProps) || {}),
                id,
                disabled: !!rest.disabled,
              },
              disabled: !!rest.disabled,
            }}
            {...rest}
          />
        </div>
        {error && (
          <div id={`${uniqueId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
      </Fragment>
    );
  }
}

// asField doesn't copy over the static methods of the
// component so we're doing it manually here
const WrappedComponent /** @type {typeof UploadInput} */ = /** @type {unknown} */ (asField(
  UploadInput
));
// @ts-ignore
WrappedComponent.parseValue = UploadInput.parseValue;

export default WrappedComponent;
