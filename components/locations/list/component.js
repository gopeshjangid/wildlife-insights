// @ts-nocheck
import React, { PureComponent, Fragment } from 'react';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import Table from 'react-table';

import { getCountryFromIso } from 'utils/country-codes';
import LoadingSpinner from 'components/loading-spinner';
import Pagination from 'components/pagination';
import LocationModal from 'components/locations/modal/location';
import DeleteEntityModal from 'components/modal/delete-entity';
import T from 'components/transifex/translate';
import DeploymentsMap from 'components/deployments/list/map';
import locationsQuery from './locations.graphql';
import { parseFilters } from './helpers';
import FilterComponent from './filter_component';
import './style.scss';

const NameCell = ({ original, setSelectedLocation }) => (
  <button type="button" className="name-cell" onClick={() => setSelectedLocation(original.id)}>
    {original.placename}
  </button>
);

NameCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedLocation: PropTypes.func.isRequired,
};

const CountryCell = ({ original }) => {
  const country = getCountryFromIso(original.country);
  return <span title={country}>{country}</span>;
};

CountryCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
};

const ActionsCell = ({
  original,
  setSelectedLocation,
  setLocationToDelete,
  canEdit,
  canDelete
}) => (
  <Fragment>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setSelectedLocation(original.id)}
    >
      {canEdit ? 'Edit' : 'See'}
    </button>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setLocationToDelete(original.id)}
      disabled={!canDelete || !original.canDelete}
    >
      Delete
    </button>
  </Fragment>
);

ActionsCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedLocation: PropTypes.func.isRequired,
  setLocationToDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired
};

class LocationsList extends PureComponent {
  static propTypes = {
    projectId: PropTypes.number.isRequired,
    canEdit: PropTypes.bool.isRequired,
    canCreate: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired
  }

  state = {
    page: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30],
    sortColumn: null,
    sortDirection: 1,
    selectedLocation: null,
    isCreating: false,
    showLocationModal: false,
    showDeleteEntityModal: false
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  setCreateLocation() {
    this.setState({ isCreating: true, showLocationModal: true });
  }

  getColumns() {
    const { canEdit, canDelete } = this.props;

    return [
      {
        Header: 'Name',
        accessor: 'placename',
        Cell: props => (
          <NameCell
            {...props}
            setSelectedLocation={
              index => this.setState({
                selectedLocation: index,
                showLocationModal: true
              })
            }
          />
        ),
      },
      {
        Header: 'Country',
        accessor: 'country',
        Cell: props => <CountryCell {...props} />,
      },
      { Header: 'Latitude', accessor: 'latitudeStr' },
      { Header: 'Longitude', accessor: 'longitudeStr' },
      {
        Header: null,
        sortable: false,
        width: 140,
        className: "d-flex justify-content-between",
        Cell: props => (
          <ActionsCell
            {...props}
            setSelectedLocation={
              index => this.setState({
                selectedLocation: index,
                showLocationModal: true
              })
            }
            setLocationToDelete={
              index => this.setState({
                selectedLocation: index,
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

  onSavedModal = (res) => {
    const { isCreating } = this.state;
    if (isCreating) {
      const id = +res.data.createLocation.id;
      this.setState({ selectedLocation: id, isCreating: false });
    }
  };

  onCloseModal = () => {
    this.setState({
      selectedLocation: null,
      isCreating: false,
      showLocationModal: false,
      showDeleteEntityModal: false
    });
  };

  render() {
    const { projectId, canCreate, setFilters, filters } = this.props;
    const {
      page,
      pageSize,
      pageSizeOptions,
      sortColumn,
      sortDirection,
      selectedLocation,
      isCreating,
      showLocationModal,
      showDeleteEntityModal
    } = this.state;

    return (
      <div className="c-locations-list mt-5">
        <div className="card">
          <div className="card-body d-flex justify-content-between">
            <h2 className="card-title mb-0">Locations</h2>
          </div>
          <DeploymentsMap />
          <div className="card-body">
            <Query
              query={locationsQuery}
              variables={{
                projectId,
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
              {({ error, loading, data: { getLocations } }) => {
                if (error) {
                  return (
                    <div className="alert alert-danger" role="alert">
                      Unable to load the locations. Please try again in a few minutes.
                    </div>
                  );
                }

                if (loading && !getLocations) {
                  return (
                    <div className="text-center">
                      <LoadingSpinner inline />
                    </div>
                  );
                }

                const totalRecords = getLocations?.meta?.totalItems || 0;

                return (
                  <Fragment>
                    {showLocationModal &&
                      <LocationModal
                        // Prevent data caching of wrong locations
                        key={+selectedLocation + '-location'}
                        projectId={projectId}
                        id={+selectedLocation}
                        open={selectedLocation !== null || isCreating}
                        onClose={this.onCloseModal}
                        onSaved={this.onSavedModal}
                        isCreating={isCreating}
                      />
                    }
                    {showDeleteEntityModal &&
                      <DeleteEntityModal
                        key={+selectedLocation + '-delete-location'}
                        id={+selectedLocation}
                        projectId={projectId}
                        open={selectedLocation !== null}
                        onClose={this.onCloseModal}
                        entityType="location"
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
                                  onClick={this.setCreateLocation.bind(this, 0)}
                                >
                                  <img alt="" src="/static/ic_add_12px.png" />
                                  <T text="New Location" />
                                </button>
                              </div>
                            )
                          }
                          <div className="count-items"><T text={totalRecords?.toString()} /> <T text="Locations" /></div>
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
                      data={getLocations.data}
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
                        pages={getLocations.meta.totalPages}
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

export default LocationsList;
