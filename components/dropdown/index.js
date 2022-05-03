import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({ children, isOpen, target, onClose }) => (
  <div style={{ position: 'relative' }}>
    {target}
    {
      isOpen && (
        <Fragment>
          <div className="select">{children}</div>
          {/* eslint-disable-next-line */}
          <div className="select__overlay" onClick={onClose} />
        </Fragment>
      )
      }
  </div>
);

Dropdown.propTypes = {
  children: PropTypes.element.isRequired,
  isOpen: PropTypes.bool.isRequired,
  target: PropTypes.element.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Dropdown;
