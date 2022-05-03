// @ts-nocheck
import React, { PureComponent, Fragment } from 'react';
import { min, map } from 'lodash';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import Table from 'react-table';
import Pagination from 'components/pagination';
import LoadingSpinner from 'components/loading-spinner';
import DeploymentModal from 'components/deployments/modal/deployment';
import DeploymentBulkUploadModal from 'components/deployments/modal/bulk-upload';
import DeleteEntityModal from 'components/modal/delete-entity';
import T from 'components/transifex/translate';
import Dropdown from 'components/dropdown';
import deploymentsQuery from './deployments.graphql';
import { parseFilters } from './helpers';
import FilterComponent from './filter_component';
import './style.scss';

const NameCell = ({ original, setSelectedDeployment }) => (
  <button type="button" className="name-cell" onClick={() => setSelectedDeployment(original.id)}>
    {original.deploymentName}
  </button>
);

NameCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedDeployment: PropTypes.func.isRequired,
};

const ActionsCell = ({
  original,
  setSelectedDeployment,
  setDeploymentToDelete,
  canEdit,
  canDelete
}) => (
  <Fragment>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setSelectedDeployment(original.id)}
    >
      {canEdit ? 'Edit' : 'See'}
    </button>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setDeploymentToDelete(original.id)}
      disabled={!canDelete || !original.canDelete}
    >
      Delete
    </button>
  </Fragment>
);

ActionsCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedDeployment: PropTypes.func.isRequired,
  setDeploymentToDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired
};

class DeploymentsList extends PureComponent {
  static propTypes = {
    organizationId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    initiativeId: PropTypes.number,
    canEdit: PropTypes.bool.isRequired,
    canCreate: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired
  }

  static defaultProps = {
    initiativeId: null,
  }

  state = {
    page: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30],
    sortColumn: 'startDatetime',
    sortDirection: 1,
    selectedDeployment: null,
    isCreating: false,
    isOpenDropDown: false,
    showBulkUploadModal: false,
    showDeploymentModal: false,
    showDeleteEntityModal: false
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  onSavedModal = (res) => {
    const { isCreating } = this.state;
    if (isCreating) {
      const id = +res.data.createDeployment.id;
      this.setState({ selectedDeployment: id, isCreating: false });
    }
  };

  onCloseModal = () => {
    this.setState({
      selectedDeployment: null,
      isCreating: false,
      showDeploymentModal: false,
      showDeleteEntityModal: false
    });
  };

  onShowBulkUploadModal() {
    this.setState({ showBulkUploadModal: true, isOpenDropDown: false });
  }

  setCreateDeployment() {
    this.setState({
      isCreating: true,
      isOpenDropDown: false,
      showDeploymentModal: true
    });
  }

  getColumns() {
    const { canEdit, canDelete } = this.props;

    return [
      {
        Header: 'Name',
        accessor: 'deploymentName',
        Cell: props => (
          <NameCell
            {...props}
            setSelectedDeployment={
              index => this.setState({
                selectedDeployment: index,
                showDeploymentModal: true
              })
            }
          />
        ),
      },
      { Header: 'Start date', accessor: 'startDatetime' },
      { Header: 'End date', accessor: 'endDatetime' },
      { Header: 'Location', accessor: 'location.placename' },
      {
        Header: null,
        sortable: false,
        width: 140,
        className: "d-flex justify-content-between",
        Cell: props => (
          <ActionsCell
            {...props}
            setSelectedDeployment={
              index => this.setState({
                selectedDeployment: index,
                showDeploymentModal: true
              })
            }
            setDeploymentToDelete={
              index => this.setState({
                selectedDeployment: index,
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

  onCloseBulkUploadModal = () => {
    this.setState({ showBulkUploadModal: false });
  };

  onCloseDropDown = () => {
    this.setState(state => ({ isOpenDropDown: !state.isOpenDropDown }));
  };

  onDeploymentUpload = (data) => {
    const { createUploadItem } = this.props;
    createUploadItem(data);
  }

  render() {
    const { organizationId, projectId, canCreate, setFilters, filters, initiativeId } = this.props;
    const {
      page,
      pageSize,
      pageSizeOptions,
      sortColumn,
      sortDirection,
      selectedDeployment,
      isCreating,
      isOpenDropDown,
      showBulkUploadModal,
      showDeploymentModal,
      showDeleteEntityModal
    } = this.state;
    return (
      <div className="c-deployments-list mt-5">
        <div className="card">
          <div className="card-body d-flex justify-content-between">
            <h2 className="card-title mb-0">Camera deployments</h2>
          </div>
          <div className="card-body">
            <Query
              query={deploymentsQuery}
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
              {({ error, loading, data: { getDeploymentsByProject } }) => {
                let deploymentStartDate = new Date();
                if (error) {
                  return (
                    <div className="alert alert-danger" role="alert">
                      Unable to load the list of camera deployments. Please try again in a few
                      minutes.
                    </div>
                  );
                }

                if (loading && !getDeploymentsByProject) {
                  return (
                    <div className="text-center">
                      <LoadingSpinner inline />
                    </div>
                  );
                }

                const totalRecords = getDeploymentsByProject?.meta?.totalItems || 0;
                if (getDeploymentsByProject.data.length > 0) {
                  deploymentStartDate = new Date(min(map(getDeploymentsByProject.data, 'startDatetime')));
                }

                return (
                  <Fragment>
                    {
                      showDeploymentModal &&
                      <DeploymentModal
                        // Prevent data caching of wrong deployments
                        key={selectedDeployment + '-deployment'}
                        organizationId={+organizationId}
                        projectId={+projectId}
                        id={+selectedDeployment}
                        open={selectedDeployment !== null || isCreating}
                        onClose={this.onCloseModal}
                        onSaved={this.onSavedModal}
                        isCreating={isCreating}
                      />
                    }
                    {
                      showDeleteEntityModal &&
                      <DeleteEntityModal
                        key={+selectedDeployment + '-delete-deployment'}
                        id={+selectedDeployment}
                        projectId={+projectId}
                        open={selectedDeployment !== null}
                        onClose={this.onCloseModal}
                        entityType="deployment"
                      />
                    }
                    {showBulkUploadModal
                      && (
                        <DeploymentBulkUploadModal
                          organizationId={+organizationId}
                          projectId={+projectId}
                          initiativeId={+initiativeId}
                          open={showBulkUploadModal}
                          onClose={this.onCloseBulkUploadModal}
                          onUpload={this.onDeploymentUpload}
                        />)
                    }
                    <div>
                      <div className="actionbar d-flex justify-content-between">
                        <div className="d-flex align-center">
                          {canCreate
                            && (
                              <div className="actionbar-left">
                                <Dropdown
                                  isOpen={isOpenDropDown}
                                  onClose={this.onCloseDropDown}
                                  target={(
                                    <button
                                      type="button"
                                      className="btn"
                                      onClick={this.onCloseDropDown}
                                    >
                                      <img alt="" src="/static/ic_add_12px.png" />
                                      <T text="New Deployment" />
                                    </button>)}
                                >
                                  <ul>
                                    <li role="presentation" onClick={this.setCreateDeployment.bind(this, 0)}>Add deployment</li>
                                    <li role="presentation" onClick={this.onShowBulkUploadModal.bind(this)}>Bulk upload deployments</li>
                                  </ul>
                                </Dropdown>
                              </div>
                            )
                          }
                          <div className="count-items"><T text={totalRecords?.toString()} /> <T text="Camera deployments" /></div>
                        </div>
                        <FilterComponent
                          projectId={projectId}
                          selected={filters}
                          setFilters={setFilters}
                          deploymentStartDate={deploymentStartDate}
                        />
                      </div>
                    </div>
                    <Table
                      manual
                      className="table"
                      data={getDeploymentsByProject.data}
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
                        pages={getDeploymentsByProject.meta.totalPages}
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

export default DeploymentsList;
