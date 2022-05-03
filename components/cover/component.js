import React from 'react';
import PropTypes from 'prop-types';

import { exists } from 'utils/functions';

import './style.scss';

const Cover = ({ image, children, className }) => (
  <div
    className={`c-cover${exists(className) ? ` ${className}` : ''}`}
    style={{
      ...(image ? { backgroundImage: `url(${image})` } : {})
    }}
  >
    {image && <div className="overlay" />}
    <div className="content">
      {children}
    </div>
  </div>
);

Cover.propTypes = {
  /**
   * Background image
   */
  image: PropTypes.string,
  /**
   * Content to display on top of the image
   */
  children: PropTypes.node,
  /**
   * Additional className
   */
  className: PropTypes.string
};

Cover.defaultProps = {
  image: null,
  children: null,
  className: null
};

export default Cover;
