// @ts-nocheck
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { TextFilter, DateRangeFilter } from 'components/filters';
import subProjectDeploymentsQuery from './subproject-deployments.graphql';
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
    subProjectId: PropTypes.number.isRequired
  }

  render() {
    const { selected, setFilters, deploymentStartDate, subProjectId } = this.props;
    return (
      <div className="d-flex align-bottom subproject-dep-filter">
        <div className="flex-shrink-1 name-filter">
          <TextFilter
            id="subProjectDeploymentSearch"
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
            query={subProjectDeploymentsQuery}
            variables={{
              pageSize: 1,
              pageNumber: 1,
              sort: {
                column: 'endDatetime',
                order: 'DESC',
              },
              filters: { subprojectId: subProjectId }
            }}
          >
            {({ error, loading, data: { getDeployments } }) => {
              if (loading && !getDeployments) {
                return null;
              }
              return (
                <DateRangeFilter
                  defaultFromDate={new Date(deploymentStartDate)}
                  defaultToDate={new Date()}
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
