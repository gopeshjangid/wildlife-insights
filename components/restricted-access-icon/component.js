import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

import Tooltip from 'components/tooltip';

import './style.scss';

const RestrictedAccessIcon = ({ readAccessOnly }) => {
  if (!readAccessOnly) {
    return null;
  }

  return (
    <Tooltip
      placement="right"
      trigger="mouseenter"
      distance={10}
      content={<span className="font-weight-bold">Read access only</span>}
    >
      <div className="c-restricted-access-icon">
        <FontAwesomeIcon className="icon" icon={faLock} size="xs" />
      </div>
    </Tooltip>
  );
};

RestrictedAccessIcon.propTypes = {
  // The following prop is only used in the index.js file, but the Typescript linter complains
  // if it's not defined here
  // eslint-disable-next-line react/no-unused-prop-types
  ignoreQuery: PropTypes.bool,
  readAccessOnly: PropTypes.bool.isRequired,
};

RestrictedAccessIcon.defaultProps = {
  ignoreQuery: false,
};

export default RestrictedAccessIcon;
