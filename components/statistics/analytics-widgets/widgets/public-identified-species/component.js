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

const IdentifiedSpeciesWidget = ({ analytics }) => {
  const [taxonomies, setTaxonomies] = useState([]);

  // WARN: only project level is supported by public query
  const { data: taxonomiesData, loading, error } = useQuery(taxonomiesQuery, {
    variables: {
      taxonomyUUIDs: (analytics.imagesPerSpecies || [])
        .slice(0, MAX_ITEMS)
        .map(i => i.taxonomies_uuid),
    },
    client: getPublicApolloClient(GQL_PUBLIC_DEFAULT),
  });

  useEffect(() => {
    if (!loading && taxonomiesData?.getTaxonomiesPublic?.data) {
      setTaxonomies(taxonomiesData.getTaxonomiesPublic.data);
    }
  }, [taxonomiesData, loading]);

  const data = useMemo(() => {
    const { imagesPerSpecies } = analytics;

    const parsedData = (imagesPerSpecies || [])
      .map((image, index) => {
        const taxonomy = taxonomies.find(t => t.uniqueIdentifier === image.taxonomies_uuid);

        return {
          id: image.taxonomies_uuid,
          name:
            index < MAX_ITEMS && taxonomy
              ? taxonomy.commonNameEnglish || taxonomy.scientificName
              : undefined,
          value: image.image_count,
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

  const noData = data.every(d => !exists(d.value));

  return (
    <WidgetCard
      title={translateText('Identified species')}
      description={translateText('Count of images per species')}
      tooltip={!noData ? identifiedSpeciesInfo : null}
    >
      {error && (
        <div className="alert alert-danger" role="alert">
          {getGraphQLErrorMessage(error)}
        </div>
      )}
      {!error && loading && !taxonomies.length && (
        <div className="text-center">
          <LoadingSpinner inline />
        </div>
      )}
      {!error && !!taxonomies.length && !data.length && <T text="Data unavailable" />}
      {!error && !!taxonomies.length && !!data.length && <VerticalBarChart data={data} />}
    </WidgetCard>
  );
};

IdentifiedSpeciesWidget.propTypes = {
  analytics: PropTypes.shape({}).isRequired,
};

export default IdentifiedSpeciesWidget;
