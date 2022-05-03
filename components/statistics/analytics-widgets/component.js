import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import classNames from 'classnames';

import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import LoadingSpinner from 'components/loading-spinner';
import IdentificationsByTypeWidget from './widgets/identifications-by-type';
import IdentifiedSpeciesWidget from './widgets/identified-species';
import PublicIdentifiedSpeciesWidget from './widgets/public-identified-species';

import analyticsPublicQuery from './analytics-public.graphql';

const WIDGET_DICT = {
  identificationsByType: IdentificationsByTypeWidget,
  identifiedSpecies: IdentifiedSpeciesWidget,
  publicIdentifiedSpecies: PublicIdentifiedSpeciesWidget
};

const AnalyticsWidgets = ({
  authenticated,
  organizationId,
  initiativeId,
  projectId,
  widgets,
  narrow,
}) => {
  // For public(explore) page analytics, a single getAnalyticsPublic api call is used 
  // that returns data for all the charts. For private (authenticated) analytics, 
  // "getAnalyticsByParameter" api call(with respective key) is used for each chart 
  // and is handled in the individual component.

  const [analytics, setAnalytics] = useState(null);

  // WARN: only project level is supported by public query
  const { data, loading, error } = useQuery(analyticsPublicQuery, {
    variables: {
      organizationId,
      initiativeId,
      projectId,
    },
    client: getPublicApolloClient(GQL_PUBLIC_DEFAULT),
    skip: authenticated
  });

  useEffect(() => {
    if (!loading && data?.getAnalyticsPublic) {
      setAnalytics(data?.getAnalyticsPublic);
    }
  }, [data, loading]);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Unable to load the charts. Please try again in a few minutes.
      </div>
    );
  }

  if (!analytics && !authenticated) {
    return (
      <div className="text-center">
        <LoadingSpinner inline />
      </div>
    );
  }

  return (
    <div className="c-analytics-widgets row">
      {widgets.map((key, index) => {
        const Widget = WIDGET_DICT[key];
        if (!Widget) {
          return null;
        }

        return (
          <div
            key={key}
            className={classNames({
              'col-md-12': narrow,
              'col-md-6': !narrow,
              'mt-3': index > (narrow ? 0 : 1),
            })}
          >
            <Widget
              {...(authenticated
                ? { organizationId, initiativeId, projectId }
                : { analytics })}
            />
          </div>
        );
      })}
    </div>
  );
};

AnalyticsWidgets.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  widgets: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(WIDGET_DICT))),
  narrow: PropTypes.bool,
  // Prop used in index.js file, not here
  // eslint-disable-next-line react/no-unused-prop-types
  usePublicEndpoint: PropTypes.bool,
};

AnalyticsWidgets.defaultProps = {
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  widgets: ['identificationsByType', 'identifiedSpecies'],
  narrow: false,
  usePublicEndpoint: false,
};

export default AnalyticsWidgets;
