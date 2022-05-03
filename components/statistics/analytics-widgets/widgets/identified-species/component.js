import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';

import { translateText, getGraphQLErrorMessage, exists } from 'utils/functions';
import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import VerticalBarChart from '../../charts/vertical-bar-chart';
import WidgetCard from '../../widget-card';

import taxonomiesQuery from './taxonomies.graphql';
import analyticsQuery from './analytics-by-parameter.graphql';

const MAX_ITEMS = 5;

const identifiedSpeciesInfo = (
  <div>
    The count of images per species includes images that have been
    <a
      href="https://www.wildlifeinsights.org/get-started/data-download/public#verify-data"
      target="_blank"
      rel="noopener noreferrer"
    >
      &nbsp;verified&nbsp;
    </a>
    by project staff and images identified by computer vision that have not
    been verified by project staff.
  </div>
);

const IdentifiedSpeciesWidget = ({
  organizationId,
  initiativeId,
  projectId,
  setNumSpeciesLoading,
  setNumSpeciesCnt,
  setNumSpeciesErr,
  resetAuthStatistics,
  projectType,
  orgAnalyticType
}) => {
  const [taxonomies, setTaxonomies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  let speciesKey = 'imagesPerSpecies';
  let widgetDescription = 'Count of images per species';
  if (projectType === 'sequence' || orgAnalyticType === 'Sequence') {
    widgetDescription = 'Count of sequences per species';
    speciesKey = 'sequencesPerSpecies';
  }
  const {
    data: analyticsData,
    error: analyticsError,
    loading: analyticsLoading
  } = useQuery(analyticsQuery, {
    variables: {
      organizationId,
      initiativeId,
      projectId,
      parameterKey: speciesKey
    },
    fetchPolicy: 'network-only'
  });

  const {
    data: taxonomiesData,
    error: taxonomiesError,
    loading: taxonomiesLoading
  } = useQuery(taxonomiesQuery, {
    variables: {
      taxonomyUUIDs: ((analytics && (analytics[speciesKey])) || [])
        .slice(0, MAX_ITEMS)
        .map(i => i.taxonomies_uuid),
    },
    client: getPublicApolloClient(GQL_PUBLIC_DEFAULT),
    skip: !analytics,
  });

  useEffect(() => {
    return () => {
      resetAuthStatistics();
    }
  }, []);

  useEffect(() => {
    if (!taxonomiesLoading && taxonomiesData?.getTaxonomiesPublic?.data) {
      setTaxonomies(taxonomiesData.getTaxonomiesPublic.data);
    }
  }, [taxonomiesData, taxonomiesLoading]);

  useEffect(() => {
    if (analyticsLoading) {
      setNumSpeciesLoading(true);
    } else if (analyticsError) {
      setNumSpeciesErr(getGraphQLErrorMessage(analyticsError));
    } else if (analyticsData?.getAnalyticsByParameter) {
      setNumSpeciesCnt(analyticsData?.getAnalyticsByParameter[speciesKey]?.length);
      setAnalytics(analyticsData.getAnalyticsByParameter);
    }
  }, [analyticsData, analyticsLoading, analyticsError]);

  const data = useMemo(() => {
    const speciesData = (analytics && analytics[speciesKey]) || [];
    const parsedData = (speciesData || [])
      .map((image, index) => {
        const taxonomy = taxonomies.find(t => t.uniqueIdentifier === image.taxonomies_uuid);

        return {
          id: image.taxonomies_uuid,
          name:
            index < MAX_ITEMS && taxonomy
              ? taxonomy.commonNameEnglish || taxonomy.scientificName
              : undefined,
          value: (projectType === 'sequence' || orgAnalyticType === 'Sequence') ? image.sequence_count : image.image_count,
        };
      });

    const slicedParsedData = parsedData.slice(0, MAX_ITEMS);
    const remainingParsedData = parsedData.slice(MAX_ITEMS, parsedData.length);

    const others = parsedData.length > MAX_ITEMS
      ? remainingParsedData.reduce((res, item) => ({ ...res, value: res.value + item.value }), {
        name: translateText('Others'),
        color: '#d8d8d8',
        value: 0,
      })
      : null;

    return others ? [...slicedParsedData, others] : parsedData;
  }, [analytics, taxonomies]);

  const anyLoading = analyticsLoading || taxonomiesLoading;
  const anyError = analyticsError || taxonomiesError;

  const noData = data.every(d => !exists(d.value));

  return (
    <WidgetCard
      title={translateText('Identified species')}
      description={translateText(widgetDescription)}
      tooltip={!noData ? identifiedSpeciesInfo : null}
    >
      {anyError && (
        <div className="alert alert-danger" role="alert">
          {taxonomiesError && getGraphQLErrorMessage(taxonomiesError)}
          {analyticsError && getGraphQLErrorMessage(analyticsError)}
        </div>
      )}

      {!anyError && anyLoading && (
        <div className="text-center">
          <LoadingSpinner inline />
        </div>
      )}
      {!anyError && !anyLoading && !!taxonomies.length && !data.length && <T text="Data unavailable" />}
      {!anyError && !anyLoading && !!taxonomies.length && !!data.length && <VerticalBarChart data={data} />}
    </WidgetCard>
  );
};

IdentifiedSpeciesWidget.propTypes = {
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  setNumSpeciesLoading: PropTypes.func.isRequired,
  setNumSpeciesCnt: PropTypes.func.isRequired,
  setNumSpeciesErr: PropTypes.func.isRequired,
  resetAuthStatistics: PropTypes.func.isRequired,
  projectType: PropTypes.string.isRequired,
  orgAnalyticType: PropTypes.string.isRequired
};

IdentifiedSpeciesWidget.defaultProps = {
  organizationId: null,
  initiativeId: null,
  projectId: null
};

export default IdentifiedSpeciesWidget;
