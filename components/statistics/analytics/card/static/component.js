import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from 'components/loading-spinner';
import { exists, getFormattedUTCDate, translateText } from 'utils/functions';
import Tooltip from 'components/tooltip';

const AnalyticsCardStatic = ({
  label,
  parameterKey,
  description,
  type,
  numSpeciesLoading,
  numSpeciesCnt,
  numSpeciesErr,
  wildlifeImagesCountLoading,
  wildlifeImagesCount,
  wildlifeImagesCountErr
}) => {
  let loading;
  let data;
  let error;

  if (parameterKey === 'numSpecies') {
    loading = numSpeciesLoading;
    data = numSpeciesCnt;
    error = numSpeciesErr;
  } else if (parameterKey === 'wildlifeImagesCount') {
    loading = wildlifeImagesCountLoading;
    data = wildlifeImagesCount;
    error = wildlifeImagesCountErr;
  }

  const metric = exists(data) ? data : null;

  if (error) {
    return (
      <div className="card">
        <div className="card-body h-adjustment">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!metric && loading) {
    return (
      <div className="card">
        <div className="card-body h-adjustment">
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        {
          exists(metric) ? (
            <div className="number">
              {
                type === 'date'
                  ? getFormattedUTCDate(metric, 'yyyy-MM-dd')
                  : numeral(metric).format('0,0')
              }
            </div>
          ) : (<div className="number">–</div>)
        }
        <div className="title d-flex justify-content-between">
          {label}
          {description && (
            <Tooltip placement="top" content={<div>{description}</div>}>
              <button
                type="button"
                aria-label={translateText(`More information about the ${label}`)}
                className="btn btn-link m-0 p-0"
              >
                <FontAwesomeIcon icon={faInfoCircle} size="sm" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

AnalyticsCardStatic.propTypes = {
  label: PropTypes.string.isRequired,
  parameterKey: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string.isRequired,
  numSpeciesLoading: PropTypes.bool,
  numSpeciesCnt: PropTypes.number,
  numSpeciesErr: PropTypes.string,
  wildlifeImagesCountLoading: PropTypes.bool,
  wildlifeImagesCount: PropTypes.number,
  wildlifeImagesCountErr: PropTypes.string
};

AnalyticsCardStatic.defaultProps = {
  description: null,
  numSpeciesLoading: false,
  numSpeciesCnt: 0,
  numSpeciesErr: '',
  wildlifeImagesCountLoading: false,
  wildlifeImagesCount: 0,
  wildlifeImagesCountErr: ''
};

export default AnalyticsCardStatic;
