import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { useQuery } from 'react-apollo-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from 'components/loading-spinner';
import { exists, getFormattedUTCDate, getGraphQLErrorMessage, translateText } from 'utils/functions';
import Tooltip from 'components/tooltip';
import AnalyticsCardStatic from './static';
import analyticsQuery from './analytics-by-parameter.graphql';

const AnalyticsCard = ({
  label,
  parameterKey,
  description,
  type,
  organizationId,
  initiativeId,
  projectId
}) => {
  let renderStatic = false;
  if ((exists(organizationId) || exists(initiativeId) || exists(projectId))
    && (parameterKey === 'numSpecies' || parameterKey === 'wildlifeImagesCount')) {
    renderStatic = true;
  }

  const { loading, data, error } = useQuery(analyticsQuery, {
    variables: {
      organizationId, initiativeId, projectId, parameterKey
    },
    skip: renderStatic,
    fetchPolicy: 'network-only'
  });

  if (renderStatic) {
    return (
      <AnalyticsCardStatic {...{ label, parameterKey, description, type }} />
    );
  }

  const metric = exists(data?.getAnalyticsByParameter)
    ? data.getAnalyticsByParameter[parameterKey] : null;

  if (error) {
    return (
      <div className="card">
        <div className="card-body h-adjustment">
          <div className="alert alert-danger" role="alert">
            {getGraphQLErrorMessage(error)}
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

AnalyticsCard.propTypes = {
  label: PropTypes.string.isRequired,
  parameterKey: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string.isRequired,
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number
};

AnalyticsCard.defaultProps = {
  organizationId: null,
  initiativeId: null,
  projectId: null,
  description: null
};

export default AnalyticsCard;
