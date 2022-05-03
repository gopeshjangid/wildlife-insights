// @ts-nocheck
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { TextFilter, DateRangeFilter } from 'components/filters';
import deploymentsQuery from './deployments.graphql';
import './style.scss';

const optionType = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

class FilterComponent extends PureComponent {
  static propTypes = {
    selected: PropTypes.objectOf(
      PropTypes.oneOfType([optionType, PropTypes.arrayOf(optionType), PropTypes.number, PropTypes.string])
    ).isRequired,
    setFilters: PropTypes.func.isRequired,
    deploymentStartDate: PropTypes.instanceOf(Date).isRequired,
    projectId: PropTypes.number.isRequired,
  }

  render() {
    const { selected, setFilters, deploymentStartDate, projectId } = this.props;
    return (
      <div className="d-flex align-baseline">
        <div className="flex-shrink-1 name-filter">
          <TextFilter
            id="deploymentSearch"
            placeholder="Search for a name or location"
            onChange={val => setFilters({
              ...selected,
              nameLoc: val,
            })
            }
          />
        </div>
        <div className="flex-shrink-1 mr-2">
          <Query
            query={deploymentsQuery}
            variables={{
              projectId,
              pageSize: 1,
              pageNumber: 1,
              sort: {
                column: 'endDatetime',
                order: 'DESC',
              },
            }}
          >
            {({ error, loading, data: { getDeploymentsByProject } }) => {
              // let deploymentEndDate = new Date();
              if (loading && !getDeploymentsByProject) {
                return null;
              }
              let deploymentEndDate = new Date();
              if (!error && getDeploymentsByProject.data.length > 0) {
                deploymentEndDate = new Date(`${getDeploymentsByProject.data[0].endDatetime}T00:00:00`);
              }
              return (
                <DateRangeFilter
                  defaultFromDate={new Date(deploymentStartDate)}
                  defaultToDate={deploymentEndDate}
                  onChange={(startDate, endDate) => setFilters({
                    ...selected,
                    startDate,
                    endDate
                  })
                  }
                  flagSetFilterOnMount
                />
              );
            }}
          </Query>
        </div>
      </div>
    );
  }
}

export default FilterComponent;
