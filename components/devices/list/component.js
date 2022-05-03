// @ts-nocheck
import React, { PureComponent, Fragment } from 'react';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import Table from 'react-table';

import { translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import Pagination from 'components/pagination';
import LoadingSpinner from 'components/loading-spinner';
import DevicesModal from 'components/devices/modal/device';
import DeleteEntityModal from 'components/modal/delete-entity';
import devicesQuery from './devices.graphql';
import { parseFilters } from './helpers';
import FilterComponent from './filter_component';
import './style.scss';

const NameCell = ({ original, setSelectedDevice }) => (
  <button
    type="button"
    className="name-cell"
    onClick={() => setSelectedDevice(original.id)}
  >
    {original.name}
  </button>
);

NameCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedDevice: PropTypes.func.isRequired,
};

const ActionsCell = ({
  original,
  setSelectedDevice,
  setDeviceToDelete,
  canEdit,
  canDelete
}) => (
  <Fragment>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setSelectedDevice(original.id)}
    >
      {translateText(canEdit ? 'Edit' : 'See')}
    </button>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setDeviceToDelete(original.id)}
      disabled={!canDelete || !original.canDelete}
    >
      Delete
    </button>
  </Fragment>
);

ActionsCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedDevice: PropTypes.func.isRequired,
  setDeviceToDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired
};

class DevicesList extends PureComponent {
  static propTypes = {
    organizationId: PropTypes.number.isRequired,
    canCreate: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired
  };

  state = {
    page: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30],
    sortColumn: null,
    sortDirection: 1,
    selectedDevice: null,
    isCreating: false,
    showDeviceModal: false,
    showDeleteEntityModal: false
  };

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  onClickCreate = () => {
    this.setState({ isCreating: true, showDeviceModal: true });
  };

  onCloseModal = () => {
    this.setState({
      selectedDevice: null,
      isCreating: false,
      showDeviceModal: false,
      showDeleteEntityModal: false
    });
  };

  onSavedModal = (res) => {
    const { isCreating } = this.state;

    if (isCreating) {
      const id = +res.data.createDevice.id;
      this.setState({ selectedDevice: id, isCreating: false });
    }
  };

  getColumns() {
    const { canEdit, canDelete } = this.props;

    return [
      {
        Header: translateText('Name'),
        accessor: 'name',
        Cell: props => (
          <NameCell
            {...props}
            setSelectedDevice={index => this.setState({ selectedDevice: index })
            }
          />
        ),
      },
      { Header: translateText('Model'), accessor: 'model' },
      { Header: translateText('Serial number'), accessor: 'serialNumber' },
      { Header: translateText('Purchase date'), accessor: 'purchaseDate' },
      {
        Header: null,
        sortable: false,
        width: 140,
        className: "d-flex justify-content-between",
        Cell: props => (
          <ActionsCell
            {...props}
            setSelectedDevice={
              index => this.setState({
                selectedDevice: index,
                showDeviceModal: true,
              })
            }
            setDeviceToDelete={
              index => this.setState({
                selectedDevice: index,
                showDeleteEntityModal: true
              })
            }
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ),
      },
    ];
  }

  render() {
    const { organizationId, canCreate, setFilters, filters } = this.props;
    const {
      page,
      pageSize,
      pageSizeOptions,
      sortColumn,
      sortDirection,
      selectedDevice,
      isCreating,
      showDeviceModal,
      showDeleteEntityModal
    } = this.state;

    return (
      <div className="c-devices-list mt-5">
        <div className="card">
          <div className="card-body d-flex justify-content-between">
            <h2 className="card-title mb-0">
              <T text="Cameras" />
            </h2>
          </div>
          <div className="card-body">
            <Query
              query={devicesQuery}
              variables={{
                organizationId,
                pageSize,
                pageNumber: page + 1,
                sort: sortColumn
                  ? {
                    column: sortColumn,
                    order: sortDirection === 1 ? 'ASC' : 'DESC',
                  }
                  : null,
                filters: parseFilters(filters),
              }}
            >
              {({ error, loading, data: { getDevices } }) => {
                if (error) {
                  return (
                    <div className="alert alert-danger" role="alert">
                      <T text="Unable to load the list of cameras. Please try again in a few minutes." />
                    </div>
                  );
                }

                if (loading && !getDevices) {
                  return (
                    <div className="text-center">
                      <LoadingSpinner inline />
                    </div>
                  );
                }

                const totalRecords = getDevices?.meta?.totalItems || 0;

                return (
                  <Fragment>
                    {showDeviceModal &&
                      <DevicesModal
                        // Prevent data caching of wrong devices
                        key={+selectedDevice + '-device'}
                        organizationId={organizationId}
                        id={+selectedDevice}
                        open={selectedDevice !== null || isCreating}
                        isCreating={isCreating}
                        onClose={this.onCloseModal}
                        onSaved={this.onSavedModal}
                      />
                    }
                    {showDeleteEntityModal &&
                      <DeleteEntityModal
                        key={+selectedDevice + '-delete-device'}
                        id={+selectedDevice}
                        organizationId={organizationId}
                        open={selectedDevice !== null}
                        onClose={this.onCloseModal}
                        entityType="device"
                      />
                    }
                    <div>
                      <div className="actionbar d-flex justify-content-between">
                        <div className="d-flex align-baseline">
                          {canCreate
                            && (
                              <div className="actionbar-left">
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={this.onClickCreate}
                                >
                                  <img alt="" src="/static/ic_add_12px.png" />
                                  <T text="New Camera" />
                                </button>
                              </div>
                            )
                          }
                          <div className="count-items"><T text={totalRecords?.toString()} /> <T text="Cameras" /></div>
                        </div>
                        <FilterComponent
                          selected={filters}
                          setFilters={setFilters}
                        />
                      </div>
                    </div>
                    <Table
                      manual
                      className="table"
                      data={getDevices.data}
                      columns={this.getColumns()}
                      resizable={false}
                      showPagination={false}
                      sorted={
                        sortColumn
                          ? [
                            {
                              id: sortColumn,
                              ...(sortDirection === 1
                                ? { asc: true }
                                : { desc: true }),
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
                        pages={getDevices.meta.totalPages}
                        pageSize={pageSize}
                        pageSizeOptions={pageSizeOptions}
                        onChangePage={index => this.setState({ page: index })}
                        onChangePageSize={pSize => this.setState({ page: 0, pageSize: pSize })
                        }
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

export default DevicesList;
