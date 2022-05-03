import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import debounce from 'lodash/debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faSearch } from '@fortawesome/free-solid-svg-icons';

import T from 'components/transifex/translate';

import './style.scss';
import { translateText } from 'utils/functions';

/**
 * This component is based on the Popout example here:
 * https://react-select.com/advanced#experimental
 * */
const Dropdown = ({ children, isOpen, target, onClose }) => (
  <div className="dropdown" style={{ position: 'relative' }}>
    {target}
    {isOpen && (
      <Fragment>
        <div className="select">{children}</div>
        {/* eslint-disable-next-line */}
        <div className="select__overlay" onClick={onClose} />
      </Fragment>
    )}
  </div>
);

Dropdown.propTypes = {
  children: PropTypes.element.isRequired,
  isOpen: PropTypes.bool.isRequired,
  target: PropTypes.element.isRequired,
  onClose: PropTypes.func.isRequired
};

const optionPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool
  ])
});

const optionsPropType = PropTypes.arrayOf(optionPropType);

class Filter extends PureComponent {
  static propTypes = {
    isMulti: PropTypes.bool,
    async: PropTypes.bool,
    isLoading: PropTypes.bool,
    isClearable: PropTypes.bool,
    label: PropTypes.string.isRequired,
    labelRenderer: PropTypes.func,
    // @ts-ignore
    options: optionsPropType.isRequired,
    selected: PropTypes.oneOfType([optionPropType, optionsPropType]).isRequired,
    disabled: PropTypes.bool,
    pageSize: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onInputChange: PropTypes.func
  };

  static defaultProps = {
    isMulti: true,
    async: false,
    isClearable: false,
    isLoading: false,
    labelRenderer: null,
    disabled: false,
    pageSize: null,
    onInputChange: () => {}
  };

  state = { isOpen: false };

  /**
   * @param {{ label: any, value: string }[]|{ label: any, value: string }} values
   */
  onChange = values => {
    const { onChange, isMulti } = this.props;

    // Values could be an array or an object depending of the numbers of selections
    // only 1 selected option will be an object
    // more than 1 selection will be an array of objects
    let serializedValues;

    function serializeLabel(item) {
      const { label, textLabel } = item;
      let labelResult;

      // The label of the options can be just a string
      // or a React component whose first element is the
      // real label (other elements can be additional information)
      if (!label) {
        labelResult = null;
      } else if (typeof label === 'string') {
        labelResult = label;
      } else if (textLabel) {
        labelResult = textLabel;
      } else if (label.props && label.props.children) {
        // TODO: this case should be replaced by the one above (textLabel)
        if (typeof label.props.children === 'string') {
          labelResult = label.props.children;
        } else {
          const labelFromChildren = React.Children.map(
            label.props.children,
            child => {
              if (child && typeof child === 'string') {
                return child;
              }
              if (
                child &&
                child.props &&
                typeof child.props.children === 'string'
              ) {
                return child.props.children;
              }
              return null;
            }
          ).find(v => v);
          labelResult = labelFromChildren;
        }
      }

      return {
        ...item,
        label: labelResult
      };
    }

    if (!values) {
      serializedValues = undefined;
    } else if (values instanceof Array) {
      serializedValues = values.map(value => serializeLabel(value));
    } else {
      serializedValues = serializeLabel(values);
    }

    onChange(serializedValues);

    if (!isMulti) this.onClose();
  };

  /**
   * @param {string} search
   */
  onInputChange = debounce(search => {
    const { onInputChange } = this.props;
    onInputChange(search);
  }, 300);

  onClose = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  };

  render() {
    const {
      isMulti,
      async,
      isLoading,
      isClearable,
      label,
      labelRenderer,
      options,
      selected,
      disabled,
      pageSize
    } = this.props;
    const { isOpen } = this.state;

    let ariaLabel;
    if (isMulti) {
      ariaLabel = translateText(
        'Open "{label}" filter ({count} options selected)',
        {
          label: translateText(label),
          count: selected.length
        }
      );
    } else if (!selected) {
      ariaLabel = translateText('Open "{label}" filter', {
        label: translateText(label)
      });
    } else {
      ariaLabel = translateText(
        'Open "{label}" filter ({option} option selected)',
        {
          label: translateText(label),
          option: selected.label
        }
      );
    }

    return (
      <div className="c-filter">
        <Dropdown
          isOpen={isOpen}
          onClose={this.onClose}
          target={
            <button
              type="button"
              className="btn btn-sm dropdown-button"
              aria-label={ariaLabel}
              onClick={this.onClose}
              disabled={disabled}
            >
              {labelRenderer ? (
                labelRenderer(label, selected)
              ) : (
                <Fragment>
                  {isMulti && !!selected.length && (
                    <Fragment>
                      <T text={label} /> &nbsp;
                      {`(${selected.length})`}
                    </Fragment>
                  )}
                  {isMulti && !selected.length && <T text={label} />}
                  {!isMulti && !!selected && (
                    <Fragment>
                      <T text={label} />: &nbsp;{selected.label}
                    </Fragment>
                  )}
                </Fragment>
              )}
              <FontAwesomeIcon className="ml-2" icon={faAngleDown} size="lg" />
            </button>
          }
        >
          <Select
            isMulti={isMulti}
            isLoading={isLoading}
            {...(async ? { filterOption: null } : {})}
            menuIsOpen
            placeholder={translateText('Search...')}
            options={options}
            hideSelectedOptions={false}
            isClearable={isClearable}
            isDisabled={disabled}
            controlShouldRenderValue={false}
            backspaceRemovesValue={false}
            components={{
              DropdownIndicator: () => (
                <FontAwesomeIcon className="mx-2" icon={faSearch} />
              ),
              IndicatorSeparator: null,
              GroupHeading: props => (
                <components.GroupHeading {...props}>
                  {props.children === 'Suggestions' && (
                    <Fragment>
                      <T text="Suggestions" />
                      {pageSize && (
                        <div className="note">
                          <T
                            text="Only the first {pageSize} results are shown"
                            params={{ pageSize }}
                          />
                        </div>
                      )}
                    </Fragment>
                  )}
                  {props.children !== 'Suggestions' && props.children}
                </components.GroupHeading>
              )
            }}
            formatOptionLabel={option => <div>{option.label}</div>}
            classNamePrefix="select"
            onChange={this.onChange}
            value={selected}
            onInputChange={this.onInputChange}
          />
        </Dropdown>
      </div>
    );
  }
}

export default Filter;
