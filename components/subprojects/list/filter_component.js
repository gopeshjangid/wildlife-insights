// @ts-nocheck
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TextFilter } from 'components/filters';

const optionType = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

class FilterComponent extends PureComponent {
  static propTypes = {
    selected: PropTypes.objectOf(
      PropTypes.oneOfType([optionType, PropTypes.arrayOf(optionType), PropTypes.number, PropTypes.string])
    ).isRequired,
    setFilters: PropTypes.func.isRequired,
  }

  render() {
    const { selected, setFilters } = this.props;

    return (
      <div className="d-flex align-baseline">
        <div className="flex-shrink-1 mr-2">
          <TextFilter
            id="subProjectSearch"
            placeholder="Search for a name"
            onChange={val => setFilters({
              ...selected,
              name: val,
            })
            }
          />
        </div>
      </div>
    );
  }
}

export default FilterComponent;
