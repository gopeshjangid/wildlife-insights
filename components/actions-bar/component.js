import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import differenceWith from 'lodash/differenceWith';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortAmountUp, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';

import { translateText } from 'utils/functions';
import { exists } from 'utils/functions';
import Tooltip from 'components/tooltip';
import GridSizeButton from 'components/shared/grid-size-button';
import { Filter, BurstsFilter, TaxonomyFilter, TextFilter } from 'components/filters';
import { statusOptions, photosOptions } from './constants';

import './style.scss';

const COLUMNS = {
  timestamp: translateText('Date taken'),
  createdAt: translateText('Upload date'),
};

const optionType = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

const selectedType = PropTypes.objectOf(
  PropTypes.oneOfType([optionType, PropTypes.arrayOf(optionType), PropTypes.number])
);

class ActionsBar extends PureComponent {
  static propTypes = {
    /**
     * Which filtres to display
     * */
    filters: PropTypes.arrayOf(PropTypes.string),
    selected: selectedType.isRequired,
    /**
     * Show the current sort
     */
    showSort: PropTypes.bool,
    sortColumn: PropTypes.string,
    organizationId: PropTypes.string,
    projectId: PropTypes.string,
    gridType: PropTypes.string.isRequired,
    deploymentsQuery: PropTypes.shape({}).isRequired,
    subProjectsQuery: PropTypes.shape({}).isRequired,
    setFilters: PropTypes.func.isRequired,
    setGridType: PropTypes.func.isRequired,
    setPageIndex: PropTypes.func.isRequired,
    setSortColumn: PropTypes.func.isRequired,
    tab: PropTypes.string.isRequired,
    projectType: PropTypes.string
  }

  static defaultProps = {
    filters: ['subProjects', 'deployments', 'taxonomies', 'highlighted', 'status'],
    showSort: true,
    sortColumn: null,
    organizationId: null,
    projectId: null,
    projectType: null
  }

  static getFilterOptions(selectedOptions, suggestedOptions) {
    return [
      {
        label: translateText('Selected'),
        options: selectedOptions.sort((a, b) => (a && b
          ? a.label.localeCompare(b.label, 'en', {
            // Really important if we want to make sure the
            // case sensitivity doesn't matter
            sensitivity: 'base',
          })
          : 0)),
      },
      {
        // WARN: Do not change this label unless you make sure
        // to check the Filter component and especially search for
        // GroupHeading
        label: translateText('Suggestions'),
        options: differenceWith(suggestedOptions, selectedOptions, (a, b) => a.value === b.value),
      },
    ];
  }

  static getDateTimeSortColumns(tab) {
    return (tab === 'catalogued'
      ? { ...COLUMNS, lastModified: translateText('Last Modified') } : COLUMNS);
  }

  state = {
    subProjectsSearch: '',
    deploymentsSearch: ''
  }

  render() {
    const {
      filters,
      selected,
      showSort,
      sortColumn,
      organizationId,
      projectId,
      deploymentsQuery,
      subProjectsQuery,
      setFilters,
      setGridType,
      setPageIndex,
      setSortColumn,
      tab,
      projectType,
      gridType
    } = this.props;

    // identify and catalogued tab are for projectType entity only
    if (!projectId || !organizationId) {
      return null;
    }

    const { subProjectsSearch, deploymentsSearch } = this.state;
    const dateTimeSortColumns = ActionsBar.getDateTimeSortColumns(tab);

    return (
      <div className="c-actions-bar">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex flex-grow-1">
            {filters.indexOf('subProjects') !== -1 && (
              <Query
                query={subProjectsQuery}
                // @ts-ignore
                variables={{
                  ...(exists(organizationId)
                    ? { organizationId: +organizationId }
                    : {}),
                  ...(exists(projectId)
                    ? { projectId: +projectId }
                    : {}),
                  name: subProjectsSearch,
                }}
              >
                {({ loading: subProjectsLoading, data }) => {
                  const selectedOptions = selected.subProjectIds || [];
                  const { data: d } = (data
                    && (data.getSubProjects
                      || data.getSubProjectsByOrganization
                      || data.getSubProjectsByProject)) || { data: [] };
                  const suggestedOptions = d.map(({ id, name }) => ({
                    label: name,
                    value: id
                  }));

                  return (
                    <div className="flex-shrink-1 mr-2">
                      <Filter
                        async
                        label={translateText('Subprojects')}
                        isLoading={subProjectsLoading}
                        options={ActionsBar.getFilterOptions(selectedOptions, suggestedOptions)}
                        selected={selectedOptions}
                        pageSize={50}
                        onChange={value => setFilters({
                          ...selected,
                          subProjectIds: value.length ? value : null,
                        })
                        }
                        onInputChange={search => this.setState({ subProjectsSearch: search })}
                      />
                    </div>
                  );
                }}
              </Query>
            )}
            {filters.indexOf('deployments') !== -1 && (
              <Query
                query={deploymentsQuery}
                // @ts-ignore
                variables={{
                  ...(organizationId !== null && organizationId !== undefined
                    ? { organizationId: +organizationId }
                    : {}),
                  ...(projectId !== null && projectId !== undefined
                    ? { projectId: +projectId }
                    : {}),
                  name: deploymentsSearch,
                }}
              >
                {({ loading: deploymentsLoading, data }) => {
                  const selectedOptions = selected.deploymentIds || [];
                  const { data: d } = (data
                    && (data.getDeployments
                      || data.getDeploymentsByOrganization
                      || data.getDeploymentsByProject)) || { data: [] };
                  const suggestedOptions = d.map(({ id, deploymentName }) => ({
                    label: deploymentName,
                    value: id,
                  }));

                  return (
                    <div className="flex-shrink-1 mr-2">
                      <Filter
                        async
                        label={translateText('Camera deployments')}
                        isLoading={deploymentsLoading}
                        options={ActionsBar.getFilterOptions(selectedOptions, suggestedOptions)}
                        selected={selectedOptions}
                        pageSize={50}
                        onChange={value => setFilters({
                          ...selected,
                          deploymentIds: value.length ? value : null,
                        })
                        }
                        onInputChange={search => this.setState({ deploymentsSearch: search })}
                      />
                    </div>
                  );
                }}
              </Query>
            )}
            {filters.indexOf('taxonomies') !== -1 && (
              <div className="flex-shrink-1 mr-2">
                <TaxonomyFilter
                  selected={selected.taxonomyIds || []}
                  formatOptions={ActionsBar.getFilterOptions}
                  projectType={projectType}
                  onChange={value => setFilters({
                    ...selected,
                    taxonomyIds: value.length ? value : null,
                  })}
                />
              </div>
            )}
            <div className="flex-shrink-1 mr-2">
              <Filter
                label={translateText('Status')}
                isMulti={false}
                options={statusOptions}
                pageSize={50}
                selected={selected.status || statusOptions[0]}
                onChange={value => setFilters({
                  ...selected,
                  status: value,
                })
                }
              />
            </div>
            {filters.indexOf('highlighted') !== -1 && (
              <div className="flex-shrink-1 mr-2">
                <Filter
                  isMulti={false}
                  label={translateText('Photos')}
                  options={photosOptions}
                  selected={selected.highlighted || photosOptions[0]}
                  onChange={value => setFilters({
                    ...selected,
                    highlighted: value,
                  })
                  }
                />
              </div>
            )}
            <div className="flex-shrink-1">
              <BurstsFilter
                selected={selected.timeStep}
                onChange={timeStep => setFilters({ ...selected, timeStep })}
                shouldDisable={projectType === 'sequence'}
                title={projectType === 'sequence' ? 'Sequence' : 'Bursts'}
              />
            </div>
          </div>
          {showSort && sortColumn !== null && (
            <Fragment>
              <Tooltip
                placement="bottom"
                distance={10}
                onCreate={(tip) => {
                  this.sortTooltip = tip;
                }}
                content={(
                  <div className="c-actions-bar-sort-tooltip">
                    {Object.keys(dateTimeSortColumns).map(key => (
                      <Fragment key={key}>
                        <input
                          type="radio"
                          id={`sort-${key}`}
                          name="sort"
                          value={key}
                          data-test={
                            (sortColumn[0] === '-'
                              && sortColumn.slice(1, sortColumn.length) === key)
                            || sortColumn === key
                          }
                          defaultChecked={
                            (sortColumn[0] === '-'
                              && sortColumn.slice(1, sortColumn.length) === key)
                            || sortColumn === key
                          }
                          onChange={() => {
                            setPageIndex(0);
                            setSortColumn(sortColumn[0] === '-' ? `-${key}` : key);
                            this.sortTooltip.hide();
                          }}
                        />
                        <label htmlFor={`sort-${key}`}>{dateTimeSortColumns[key]}</label>
                      </Fragment>
                    ))}
                  </div>
                )}
              >
                <button
                  type="button"
                  className="btn btn-sm sort-button flex-shrink-0 d-inline-flex align-items-center ml-3"
                  aria-label={
                    translateText(`Sort by ${dateTimeSortColumns[
                      sortColumn[0] === '-' ? sortColumn.slice(1, sortColumn.length) : sortColumn
                    ]}`)
                  }
                >
                  {
                    dateTimeSortColumns[
                      sortColumn[0] === '-' ? sortColumn.slice(1, sortColumn.length) : sortColumn
                    ]
                  }
                </button>
              </Tooltip>
              <button
                type="button"
                className="btn btn-sm sort-button flex-shrink-0 d-inline-flex align-items-center ml-1"
                onClick={() => {
                  setPageIndex(0);
                  setSortColumn(
                    sortColumn[0] === '-'
                      ? sortColumn.slice(1, sortColumn.length)
                      : `-${sortColumn}`
                  );
                }}
                aria-label={translateText(`Sort by ${sortColumn[0] === '-' ? 'ASC' : 'DESC'} order`)}
              >
                <FontAwesomeIcon icon={sortColumn[0] === '-' ? faSortAmountUp : faSortAmountDown} />
              </button>
            </Fragment>
          )}
        </div>
        <div className="d-flex mt-3">
          <div className="flex-grow-1">
            <TextFilter
              id="searchForFilename"
              placeholder="Search by filename"
              onChange={val => setFilters({
                ...selected,
                fileName: val,
              })
              }
            />
          </div>
          <GridSizeButton gridType={gridType}
            setGridType={type => setGridType(type)} />
        </div>
      </div>
    );
  }
}

export default ActionsBar;
