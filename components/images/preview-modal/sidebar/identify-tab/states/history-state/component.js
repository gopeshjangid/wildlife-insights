import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import Identification from '../../identification';

const HistoryState = ({ identifications, onClickCancelHistory }) => (
  <Fragment>
    <div className="scroll-container">
      {identifications.map(ident => (
        <Identification
          key={ident.id}
          identification={{ ...ident, confidence: [ident.confidence, ident.confidence] }}
          canRemove={false}
          readOnly
        />
      ))}
    </div>
    <div className="fixed-container mt-3 text-center">
      <button type="button" className="btn btn-primary" onClick={onClickCancelHistory}>
        Cancel
      </button>
    </div>
  </Fragment>
);

HistoryState.propTypes = {
  identifications: PropTypes.arrayOf(
    PropTypes.shape({
      blankYn: PropTypes.bool.isRequired,
      identifiedObjects: PropTypes.array.isRequired,
    })
  ).isRequired,
  onClickCancelHistory: PropTypes.func.isRequired,
};

export default HistoryState;
