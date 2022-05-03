import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { connect } from 'react-redux';

import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import { getGraphQLErrorMessage } from 'utils/functions';
import { getPublicApolloClient } from 'lib/initApollo';
import LoadingSpinner from 'components/loading-spinner';
import taxonomiesQuery from 'components/statistics/analytics-widgets/widgets/identified-species/taxonomies.graphql';
import analyticsQuery from 'components/statistics/analytics-widgets/widgets/identified-species/analytics-by-parameter.graphql';
import * as actions from './actions';
const MAX_ITEMS = 5;

const identifiedSpeciesSummary = ({
  organizationId,
  initiativeId,
  projectId,
  projectType,
  orgAnalyticType,
  saveSpecies
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
      taxonomyUUIDs: ((analytics && analytics[speciesKey]) || [])
        .slice(0, MAX_ITEMS)
        .map(i => i.taxonomies_uuid)
    },
    client: getPublicApolloClient(GQL_PUBLIC_DEFAULT),
    skip: !analytics
  });

  useEffect(() => {
    if (!taxonomiesLoading && taxonomiesData?.getTaxonomiesPublic?.data) {
      setTaxonomies(taxonomiesData.getTaxonomiesPublic.data);
      saveSpecies(taxonomiesData.getTaxonomiesPublic.data);
    }
  }, [taxonomiesData, taxonomiesLoading]);

  useEffect(() => {
    if (analyticsData?.getAnalyticsByParameter) {
      setAnalytics(analyticsData.getAnalyticsByParameter);
    }
  }, [analyticsData, analyticsLoading, analyticsError]);

  const anyLoading = analyticsLoading || taxonomiesLoading;
  const anyError = analyticsError || taxonomiesError;

  const getTaxonomyDataCount = taxonomyKey => {
    let filtered =
      analyticsData?.getAnalyticsByParameter?.imagesPerSpecies?.filter(
        row => row?.taxonomies_uuid === taxonomyKey
      ) || [];

    let finaldata = filtered.length
      ? filtered.reduce((a, c) => a.image_count + c.image_count)
      : 0;

    return finaldata?.image_count || 0;
  };

  return (
    <div className="report-box">
      {anyError && (
        <div className="alert alert-danger" role="alert">
          {taxonomiesError && getGraphQLErrorMessage(taxonomiesError)}
          {analyticsError && getGraphQLErrorMessage(analyticsError)}
        </div>
      )}

      {anyLoading && <LoadingSpinner inline />}

      <span className="report-title">Species in this report</span>

      <table className="project-detail-table">
        <tbody>
          {taxonomies?.map((taxonomy, key) => (
            <tr key={'taxpno' + key}>
              <td className="label-column">{taxonomy?.commonNameEnglish}</td>
              <td className="count-column">
                {getTaxonomyDataCount(taxonomy?.uniqueIdentifier)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  saveSpecies: data => {
    dispatch(actions.saveSpecies(data));
  }
});

export default React.memo(
  connect(
    null,
    mapDispatchToProps
  )(identifiedSpeciesSummary)
);
