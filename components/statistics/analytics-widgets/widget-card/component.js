import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from 'components/tooltip';
import './style.scss';

const WidgetCard = ({ title, description, tooltip, children }) => (
  <div className="c-widget-card card">
    <div className="card-body">
      <h2 className="card-title mb-1">{title}</h2>
      <p className="my-0">{description}</p>
      <div className="content">{children}</div>
      {tooltip
        && (
          <div className="d-flex justify-content-end">
            <Tooltip placement="top" content={<div>{tooltip}</div>}>
              <button
                type="button"
                aria-label={`More information about the ${title}`}
                className="btn btn-link m-0 p-0"
              >
                <FontAwesomeIcon icon={faInfoCircle} size="sm" />
              </button>
            </Tooltip>
          </div>
        )
      }
    </div>
  </div>
);

WidgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tooltip: PropTypes.element,
  children: PropTypes.node,
};

WidgetCard.defaultProps = {
  children: null,
  tooltip: null
};

export default WidgetCard;
