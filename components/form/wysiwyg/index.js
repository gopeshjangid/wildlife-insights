import React, { PureComponent, Fragment } from 'react';
import classnames from 'classnames';
import dynamic from 'next/dynamic';
import { asField } from 'informed';
import nanoid from 'nanoid';

import { exists } from 'utils/functions';

import './style.scss';

const ReactQuillNoSSR = dynamic(() => import('react-quill'), {
  ssr: false,
});

const DEFAULT_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link'],
    ['clean'],
  ],
};

const DEFAULT_FORMATS = ['bold', 'italic', 'underline', 'list', 'bullet', 'indent', 'link'];

class Wysiwyg extends PureComponent {
  state = {
    uniqueId: nanoid(),
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange(content, delta, source, editor) {
    const { onChange, fieldApi } = this.props;
    const { setValue } = fieldApi;

    const html = editor.getHTML();

    setValue(html);
    if (onChange) {
      onChange(html);
    }
  }

  onBlur() {
    const { onBlur, fieldApi } = this.props;
    const { setTouched } = fieldApi;

    setTouched();
    if (onBlur) {
      onBlur();
    }
  }

  render() {
    const { fieldState, modules, formats, ...rest } = this.props;
    const { value, error } = fieldState;
    const { uniqueId } = this.state;

    return (
      <Fragment>
        <div
          className={classnames('c-form-wysiwyg', { '-disabled': !!rest.disabled })}
        >
          {/**
          //@ts-ignore */}
          <ReactQuillNoSSR
            {...rest}
            value={value || ''}
            modules={modules || DEFAULT_MODULES}
            formats={formats || DEFAULT_FORMATS}
            onChange={this.onChange}
            onBlur={this.onBlur}
            // The following attribute in unfortunately not supported, as well as "id"
            aria-describedby={`${rest['aria-describedby']
              || ''} ${uniqueId}-maxLength ${uniqueId}-error`}
            readOnly={!!rest.disabled}
          />
        </div>
        {error && (
          <div id={`${uniqueId}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
        {rest.maxLength && (
          <small id={`${uniqueId}-maxLength`} className="form-text text-muted">
            {value && value !== undefined && value.length > 0
              ? `${value.length}/${rest.maxLength} characters (based on HTML content).`
              : `${rest.maxLength} characters maximum.`}
          </small>
        )}
      </Fragment>
    );
  }
}

/**
 * Validate the value of the wysiwyg
 * @param {string} value Value of the wysiwyg
 * @param {function(any): any} [propValidate] Validation function passed to the wysiwyg
 * @param {any} props Rest of the props passed to the wysiwyg (excluding "validate")
 */
const validate = (value, propValidate, props) => {
  if (exists(props.maxLength) && exists(value) && value.length > props.maxLength) {
    return 'This field contains too many characters. Please respect the limit.';
  }

  return exists(propValidate) ? propValidate(value) : undefined;
};

// There's no way to apply the maxLength validation without creating
// a custom validation function
// Since we want it to be seamless for the dev, but we also want to
// support custom validation, we create the wrapper WysiwygField around
// Informed's own wrapper and our own Wysiwyg component
const WysiwygField = asField(Wysiwyg);
export default ({ ...props }) => (
  <WysiwygField validate={value => validate(value, props.validate, props)} {...props} />
);
