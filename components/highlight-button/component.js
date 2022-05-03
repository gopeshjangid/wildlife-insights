import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';

import Tooltip from 'components/tooltip';

/**
 * A wrapper around the button itself
 * It's used to display a warning when the user is about to highlight a photo
 */
const Wrapper = ({ highlighted, children, disabled }) => {
  if (highlighted || disabled) {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <Tooltip
      trigger="mouseenter focus"
      placement="top"
      content={<div>Highlighted photos are publicly made available.</div>}
    >
      {children}
    </Tooltip>
  );
};

Wrapper.propTypes = {
  highlighted: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
  disabled: PropTypes.bool.isRequired,
};

const HighlightButton = ({ className, highlighted, onClick, iconSize, label, disabled }) => {

  const handleKeyDown = (e) => {
    // Ctrl + H for highlight image
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 72 && !disabled) {
      e.preventDefault();
      onClick(highlighted);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [highlighted]);

  const onClickButton = () => onClick(highlighted);
  return (
    <Wrapper highlighted={highlighted} disabled={disabled}>
      <button type="button" className={className} onClick={onClickButton} disabled={disabled}>
        <FontAwesomeIcon
          className={label ? 'mb-2' : undefined}
          icon={highlighted ? faStarSolid : faStar}
          size={iconSize}
          aria-label={!label && (highlighted ? 'Highlighted' : 'Highlight')}
        />
        {label}
      </button>
    </Wrapper>
  );
};

HighlightButton.propTypes = {
  /** Class to give to the button */
  className: PropTypes.string,
  /** Whether the button is active or not */
  highlighted: PropTypes.bool.isRequired,
  /** Callback executed when the user clicks the button */
  onClick: PropTypes.func.isRequired,
  /** Size of the icon */
  iconSize: PropTypes.string,
  /** Label to displayed below the icon */
  label: PropTypes.string,
  /** Whether the button is disabled */
  disabled: PropTypes.bool,
};

HighlightButton.defaultProps = {
  className: undefined,
  iconSize: '1x',
  label: undefined,
  disabled: false,
};

export default HighlightButton;
