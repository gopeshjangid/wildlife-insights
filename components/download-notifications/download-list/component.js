// @ts-nocheck
import React, { PureComponent, Fragment } from 'react';
import { Query } from 'react-apollo';
import Table from 'react-table';

import { joinArrOfStr } from 'components/download-notifications/helpers';
import { getGraphQLErrorMessage } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import Pagination from 'components/pagination';
import downloadDataQuery from './download-data.graphql';
import './style.scss';

class DownloadDataList extends PureComponent {
  state = {
    page: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30],
    sortColumn: null,
    sortDirection: 1,
  }

  getColumns() {
    return [
      { Header: 'Date', accessor: 'requestedTimestamp', maxWidth: 90 },
      { Header: 'Project', accessor: 'projectShortName', maxWidth: 250 },
      {
        Header: 'Email',
        accessor: 'email',
        maxWidth: 230
      },
      {
        Header: 'Reason',
        accessor: 'intendedUseOfData',
        Cell: props => (<span>{joinArrOfStr(props.value)}</span>)
      },
      {
        Header: 'Expected product',
        accessor: 'expectedProducts',
        Cell: props => (<span>{joinArrOfStr(props.value)}</span>)
      },
    ];
  }

  render() {
    const {
      page,
      pageSize,
      pageSizeOptions,
      sortColumn,
      sortDirection
    } = this.state;

    return (
      <div className="c-download-data-list mt-5">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title mb-0">Download data</h2>
          </div>
          <div className="card-body">
            <Query
              query={downloadDataQuery}
              variables={{
                pageSize,
                pageNumber: page + 1,
                sort: sortColumn
                  ? {
                    column: sortColumn,
                    order: sortDirection === 1 ? 'ASC' : 'DESC',
                  }
                  : null,
              }}
            >
              {({ error, loading, data }) => {
                if (error) {
                  return (
                    <div className="alert alert-danger" role="alert">
                      {getGraphQLErrorMessage(error)}
                    </div>
                  );
                }

                if (loading && !data?.getPublicDownloads) {
                  return (
                    <div className="text-center">
                      <LoadingSpinner inline />
                    </div>
                  );
                }

                const getPublicDownloads = data?.getPublicDownloads
                  || { data: [], meta: { totalPages: 0 } };

                return (
                  <Fragment>
                    <Table
                      manual
                      className="table"
                      data={getPublicDownloads.data}
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
                        pages={getPublicDownloads.meta.totalPages}
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
    );
  }
}

export default DownloadDataList;
