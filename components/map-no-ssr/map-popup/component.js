import React from 'react';
import PropTypes from 'prop-types';
import { InfoWindow } from 'react-google-maps';

import './style.scss';

const MapPopup = ({ open, ...props }) => {
  if (!open) {
    return null;
  }

  return <InfoWindow {...props} />;
};

MapPopup.propTypes = {
  open: PropTypes.bool,
};

MapPopup.defaultProps = {
  open: false,
};

export default MapPopup;
