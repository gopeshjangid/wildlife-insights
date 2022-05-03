import React from 'react';
import PropTypes from 'prop-types';

const MetadataItem = ({ label, children }) => (
  <div className="row mt-1">
    <div className="col-5 font-weight-bold">
      {label}
    </div>
    <div className="col-7">
      <span>{children}</span>
    </div>
  </div>
);

MetadataItem.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default MetadataItem;
