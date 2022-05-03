// @ts-nocheck
import React, { PureComponent, Fragment } from 'react';
import { min, map } from 'lodash';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Query } from 'react-apollo';
import Table from 'react-table';

import { translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import LoadingSpinner from 'components/loading-spinner';
import Pagination from 'components/pagination';
import { parseFilters } from './helpers';
import FilterComponent from './filter_component';
import subProjectDeploymentsQuery from './subproject-deployments.graphql';
import './style.scss';

class SubProjectDeploymentsModal extends PureComponent {
  static propTypes = {
    subProjectId: PropTypes.number.isRequired,
    subProjectName: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
  }

  static defaultProps = {
    onClose: () => { }
  }

  state = {
    page: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30],
    sortColumn: 'startDatetime',
    sortDirection: 1
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  getColumns() {
    return [
      { Header: 'Deployment name', accessor: 'deploymentName' },
      { Header: 'Start date', accessor: 'startDatetime' },
      { Header: 'End date', accessor: 'endDatetime' },
      { Header: 'Location', accessor: 'location.placename' }
    ];
  }

  render() {
    const { open, onClose, subProjectId, subProjectName, setFilters, filters } = this.props;

    const {
      page,
      pageSize,
      pageSizeOptions,
      sortColumn,
      sortDirection
    } = this.state;

    // getDeployments api call accepts subprojectId as a filter parameter
    let filtersWithSubProjectId = { ...parseFilters(filters), subprojectId: subProjectId };

    return (
      <ReactModal
        isOpen={open}
        onRequestClose={onClose}
        className="c-subproject-deployment-modal"
        contentLabel={translateText('Subproject Deployments List')}
      >
        <div className="mt-4">
          <div className="card">
            <div className="card-body mt-2">
              <Query
                query={subProjectDeploymentsQuery}
                variables={{
                  pageSize,
                  pageNumber: page + 1,
                  sort: sortColumn
                    ? {
                      column: sortColumn,
                      order: sortDirection === 1 ? 'ASC' : 'DESC',
                    }
                    : null,
                  filters: filtersWithSubProjectId
                }}
              >
                {({ error, loading, data: { getDeployments } }) => {
                  let deploymentStartDate = new Date();
                  if (error) {
                    return (
                      <div className="alert alert-danger" role="alert">
                        Unable to load the list of camera deployments. Please try again in a few
                        minutes.
                      </div>
                    );
                  }

                  if (loading && !getDeployments) {
                    return (
                      <div className="text-center">
                        <LoadingSpinner inline />
                      </div>
                    );
                  }

                  if (getDeployments.data.length > 0) {
                    deploymentStartDate = new Date(min(map(getDeployments.data, 'startDatetime')));
                  }

                  const totalRecords = getDeployments?.meta?.totalItems || 0;

                  return (
                    <Fragment>
                      <div>
                        <div className="actionbar d-flex subproject-topbar align-center">
                          <div className="d-flex title-filter-container">
                            <div className="d-flex title-container align-center">
                              <div className="title">
                                <h2>{subProjectName}</h2>
                              </div>

                              <div className="count-items">
                                <T text={totalRecords?.toString()} /> <T text="Camera deployments" />
                              </div>
                            </div>

                            <FilterComponent
                              subProjectId={subProjectId}
                              selected={filters}
                              setFilters={setFilters}
                              deploymentStartDate={deploymentStartDate}
                            />
                          </div>
                          <div className="close-btn-container">
                            <button type="button" className="close-btn" onClick={onClose}>
                              <img alt="" src="/static/ic_cancel_24px.png" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <Table
                        manual
                        className="table"
                        data={getDeployments.data}
                        columns={this.getColumns()}
                        resizable={false}
                        showPagination={false}
                        sorted={
                          sortColumn
                            ? [
                              {
                                id: sortColumn,
                                ...(sortDirection === 1 ? { asc: true } : { desc: true }),
                              },
                            ]
                            : []
                        }
                        onSortedChange={([{ desc, id }]) => {
                          this.setState({
                            page: 0,
                            sortColumn: id,
                            sortDirection: desc ? -1 : 1,
                          });
                        }}
                        pageSize={pageSize}
                      />
                      <div className="text-center">
                        <Pagination
                          pageIndex={page}
                          pages={getDeployments.meta.totalPages}
                          pageSize={pageSize}
                          pageSizeOptions={pageSizeOptions}
                          onChangePage={index => this.setState({ page: index })}
                          onChangePageSize={pSize => this.setState({ page: 0, pageSize: pSize })}
                        />
                      </div>
                    </Fragment>
                  );
                }}
              </Query>
            </div>
          </div>
        </div>
      </ReactModal>
    );
  }
}

export default SubProjectDeploymentsModal;
