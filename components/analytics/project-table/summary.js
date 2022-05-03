import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Query } from 'react-apollo';
import LoadingSpinner from 'components/loading-spinner';

import './style.scss';
import analyticsQuery from './analytics-by-parameter.graphql';

const ProjectSummary = ({ organizationId, projectId }) => {
  const analyticsParams = [
    { label: 'Species', key: 'numSpecies' },
    { label: 'Total Images', key: 'numImages' },
    { label: 'Cameras', key: 'numDevices' },
    { label: 'Sampling Days', key: 'samplingDaysCount' },
    { label: 'Locations', key: 'uniqueLocations' },
    { label: 'Deployments', key: 'numDeployments' }
  ];

  return (
    <table className="project-detail-table">
      <tbody>
        {analyticsParams?.map((param, index) => (
          <Query
            query={analyticsQuery}
            variables={{
              organizations: Number(organizationId),
              initiativeId: null,
              projectId: Number(projectId),
              parameterKey: param?.key || ''
            }}
            key={'query-' + index}
          >
            {res => {
              if (res?.loading) {
                return (
                  <tr key={'sumamry-loading-' + index}>
                    <td>loading...</td>
                  </tr>
                );
              }

              return (
                <tr key={'sumamry-' + index}>
                  <td className="label-column">{param?.label}</td>
                  <td className="count-column">
                    {res?.data?.getAnalyticsByParameter[param?.key] || 0}
                  </td>
                </tr>
              );
            }}
          </Query>
        ))}
      </tbody>
    </table>
  );
};

ProjectSummary.propTypes = {
  organizationId: PropTypes.number,
  projectId: PropTypes.number
};

const mapStateToProps = state => {
  return { ...state?.analytics };
};

export default React.memo(
  connect(
    mapStateToProps,
    null
  )(ProjectSummary)
);
