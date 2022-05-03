import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';

import { translateText, exists, getGraphQLErrorMessage } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import PieChart from '../../charts/pie-chart';
import WidgetCard from '../../widget-card';
import analyticsQuery from './analytics-by-parameter.graphql';

const imagesByTypeInfo = (
  <div className="text-left">
    <div className="mb-1">The categories displayed here are:</div>
    <ul className="dash-ul">
      <li>Wildlife images is the number of images containing wildlife.</li>
      <li>Non wildlife images is the number of images containing humans, misfires, objects
          like bicycles and cars, domestic animals, and images with No CV result.
      </li>
      <li>Blank images is the number of images with the Blank tag.</li>
      <li>Unknown images is the number of images with the Unknown tag.</li>
    </ul>
  </div>
);

const IdentificationsByTypeWidget = ({
  organizationId,
  initiativeId,
  projectId,
  setWildlifeImagesCountLoading,
  setWildlifeImagesCount,
  setWildlifeImagesCountErr,
  projectType
}) => {
  const [analytics, setAnalytics] = useState(null);
  const {
    data: analyticsData,
    error: analyticsError,
    loading: analyticsLoading
  } = useQuery(analyticsQuery, {
    variables: {
      organizationId,
      initiativeId,
      projectId,
      parameterKey: projectType === 'sequence' ? 'sequencesPerIdentification' : 'imagesPerIdentification'
    },
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (analyticsLoading) {
      setWildlifeImagesCountLoading(true);
    } else if (analyticsError) {
      setWildlifeImagesCountErr(getGraphQLErrorMessage(analyticsError));
    } else if (analyticsData?.getAnalyticsByParameter) {
      setWildlifeImagesCount(analyticsData?.getAnalyticsByParameter?.wildlifeImagesCount);
      setAnalytics(analyticsData?.getAnalyticsByParameter);
    }
  }, [analyticsData, analyticsLoading, analyticsError]);

  const data = useMemo(() => {
    const {
      wildlifeImagesCount,
      nonWildlifeImagesCount,
      blankImagesCount,
      unknownImagesCount,
      wildlifeSequencesCount,
      nonWildlifeSequencesCount,
      blankSequencesCount,
      unknownSequencesCount
    } = analytics || {};
    let result;
    if (projectType === 'sequence') {
      result = [
        {
          name: translateText('Wildlife sequences'),
          value: wildlifeSequencesCount,
          color: '#2E7A4E',
        },
        {
          name: translateText('Non Wildlife sequences'),
          value: nonWildlifeSequencesCount,
          color: '#b00000',
        },
        {
          name: translateText('Blank sequences'),
          value: blankSequencesCount,
          color: '#FBBF53',
        },
        {
          name: translateText('Unknown sequences'),
          value: unknownSequencesCount,
          color: '#D8D8D8',
        },
      ];
    } else {
      result = [
        {
          name: translateText('Wildlife images'),
          value: wildlifeImagesCount,
          color: '#2E7A4E',
        },
        {
          name: translateText('Non Wildlife images'),
          value: nonWildlifeImagesCount,
          color: '#b00000',
        },
        {
          name: translateText('Blank images'),
          value: blankImagesCount,
          color: '#FBBF53',
        },
        {
          name: translateText('Unknown images'),
          value: unknownImagesCount,
          color: '#D8D8D8',
        },
      ];
    }
    return result;
  }, [analytics]);

  const noData = data.every(d => !exists(d.value));

  return (
    <WidgetCard
      title={
        translateText(projectType === 'sequence' ? 'Sequences by type' : 'Images by type')
      }
      description={
        translateText(projectType === 'sequence' ? 'Distribution of sequences by type' : 'Distribution of images by type')
      }
      tooltip={!noData ? imagesByTypeInfo : null}
    >
      {analyticsError && (
        <div className="alert alert-danger" role="alert">
          {getGraphQLErrorMessage(analyticsError)}
        </div>
      )}
      {!analyticsError && analyticsLoading && (
        <div className="text-center">
          <LoadingSpinner inline />
        </div>
      )}
      {!analyticsError && !analyticsLoading && noData && <T text="Data unavailable" />}
      {!analyticsError && !analyticsLoading && !noData && <PieChart data={data} />}
    </WidgetCard>
  );
};

IdentificationsByTypeWidget.propTypes = {
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  setWildlifeImagesCountLoading: PropTypes.func.isRequired,
  setWildlifeImagesCount: PropTypes.func.isRequired,
  setWildlifeImagesCountErr: PropTypes.func.isRequired,
  projectType: PropTypes.string.isRequired,
};

IdentificationsByTypeWidget.defaultProps = {
  organizationId: null,
  initiativeId: null,
  projectId: null,
};

export default IdentificationsByTypeWidget;
