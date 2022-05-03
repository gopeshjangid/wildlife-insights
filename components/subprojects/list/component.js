// @ts-nocheck
import React, { PureComponent, Fragment } from 'react';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import Table from 'react-table';

import LoadingSpinner from 'components/loading-spinner';
import Pagination from 'components/pagination';
import SubProjectModal from 'components/subprojects/modal/subproject';
import SubProjectDeploymentsModal from 'components/subprojects/modal/deployments';
import DeleteEntityModal from 'components/modal/delete-entity';
import T from 'components/transifex/translate';
import subProjectsQuery from './subprojects.graphql';
import { parseFilters } from './helpers';
import FilterComponent from './filter_component';
import './style.scss';

const NameCell = ({ original, setSelectedSubProject }) => (
  <button type="button" className="name-cell" onClick={() => setSelectedSubProject(original.id, original.name)}>
    {original.name}
  </button>
);

NameCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedSubProject: PropTypes.func.isRequired,
};

const ActionsCell = ({
  original,
  setSelectedSubProject,
  setSubprojectToDelete,
  canEdit,
  canDelete
}) => (
  <Fragment>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setSelectedSubProject(original.id)}
    >
      {canEdit ? 'Edit' : 'See'}
    </button>
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => setSubprojectToDelete(original.id)}
      disabled={!canDelete || !original.canDelete}
    >
      Delete
    </button>
  </Fragment>
);

ActionsCell.propTypes = {
  original: PropTypes.objectOf(PropTypes.any).isRequired,
  setSelectedSubProject: PropTypes.func.isRequired,
  setSubprojectToDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired
};

class SubProjectsList extends PureComponent {
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
    selectedSubProject: null,
    selectedSubProjectName: null,
    isCreating: false,
    showSubProjectModal: false,
    showDeploymentsModal: false,
    showDeleteEntityModal: false
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  setCreateSubProject = () => {
    this.setState({ isCreating: true, showSubProjectModal: true });
  }

  getColumns() {
    const { canEdit, canDelete } = this.props;

    return [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: props => (
          <NameCell
            {...props}
            setSelectedSubProject={(index, subProjectName) => {
              this.setState({
                selectedSubProject: index,
                selectedSubProjectName: subProjectName,
                showDeploymentsModal: true
              });
            }}
          />
        ),
      },
      { Header: 'Number of deployments', accessor: 'deploymentCount' },
      {
        Header: null,
        sortable: false,
        width: 140,
        className: "d-flex justify-content-between",
        Cell: props => (
          <ActionsCell
            {...props}
            setSelectedSubProject={
              index => this.setState({
                selectedSubProject: index,
                showSubProjectModal: true
              })
            }
            setSubprojectToDelete={
              index => this.setState({
                selectedSubProject: index,
                showDeleteEntityModal: true
              })
            }
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )
      },
    ];
  }

  onSavedModal = (res) => {
    const { isCreating } = this.state;
    if (isCreating) {
      const id = +res.data.createSubProject.id;
      this.setState({ selectedSubProject: id, isCreating: false });
    }
  };

  onCloseModal = () => {
    this.setState({
      selectedSubProject: null,
      selectedSubProjectName: null,
      isCreating: false,
      showSubProjectModal: false,
      showDeploymentsModal: false,
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
      selectedSubProject,
      selectedSubProjectName,
      isCreating,
      showSubProjectModal,
      showDeploymentsModal,
      showDeleteEntityModal
    } = this.state;

    return (
      <div className="c-subprojects-list mt-5">
        <div className="card">
          <div className="card-body d-flex justify-content-between">
            <h2 className="card-title mb-0">Subprojects</h2>
          </div>
          <div className="card-body">
            <Query
              query={subProjectsQuery}
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
              {({ error, loading, data: { getSubProjectsByProject } }) => {
                if (error) {
                  return (
                    <div className="alert alert-danger" role="alert">
                      Unable to load the subprojects. Please try again in a few minutes.
                    </div>
                  );
                }

                if (loading && !getSubProjectsByProject) {
                  return (
                    <div className="text-center">
                      <LoadingSpinner inline />
                    </div>
                  );
                }

                const totalRecords = getSubProjectsByProject?.meta?.totalItems || 0;

                return (
                  <Fragment>
                    {showSubProjectModal &&
                      <SubProjectModal
                        key={+selectedSubProject + '-subproject'}
                        projectId={projectId}
                        subProjectId={+selectedSubProject}
                        open={selectedSubProject !== null || isCreating}
                        onClose={this.onCloseModal}
                        onSaved={this.onSavedModal}
                        isCreating={isCreating}
                      />
                    }
                    {showDeleteEntityModal &&
                      <DeleteEntityModal
                        key={+selectedSubProject + '-delete-subproject'}
                        id={+selectedSubProject}
                        open={selectedSubProject !== null}
                        onClose={this.onCloseModal}
                        entityType="subproject"
                      />
                    }
                    {showDeploymentsModal &&
                      <SubProjectDeploymentsModal
                        key={+selectedSubProject + '-subproject-deployments'}
                        subProjectId={+selectedSubProject}
                        subProjectName={selectedSubProjectName}
                        open={selectedSubProject !== null}
                        onClose={this.onCloseModal}
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
                                  onClick={this.setCreateSubProject}
                                >
                                  <img alt="" src="/static/ic_add_12px.png" />
                                  <T text="New Subproject" />
                                </button>
                              </div>
                            )
                          }
                          <div className="count-items"><T text={totalRecords?.toString()} /> <T text="Subprojects" /></div>
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
                      data={getSubProjectsByProject.data}
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
                        pages={getSubProjectsByProject.meta.totalPages}
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

export default SubProjectsList;
