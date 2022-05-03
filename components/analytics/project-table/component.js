import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import Table from 'react-table';

import { useQuery } from 'react-apollo-hooks';
import Pagination from 'components/pagination';
import projectQuery from './projects.graphql';
import FilterComponent from '../../subprojects/list/filter_component';
import cataloguedImageCountQuery from './project-catelogued-image-count.graphql';
import { getFormattedUTCDate, getGraphQLErrorMessage } from 'utils/functions';
import T from 'components/transifex/translate';
import LoadingSpinner from 'components/loading-spinner';

import './style.scss';

const ProjectTable = ({
  setSelectedProject,
  selectProject,
  selectedProjectId
}) => {
  const [selectedProject, setProject] = useState(selectedProjectId);
  const [sortDetails, setSortDetail] = useState({
    column: 'name',
    order: 'ASC'
  });
  const [searchQuery, setSearchQuery] = useState(null);
  const [pageData, setPageData] = useState({
    page: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30]
  });

  const { page, pageSize, pageSizeOptions } = pageData;

  const { loading, data, error, refetch } = useQuery(projectQuery, {
    variables: {
      shortName: searchQuery?.name || '',
      pageSize: pageSize,
      pageNumber: page,
      sort: [sortDetails]
    }
  });
  useEffect(() => {
    setSelectedProject(selectedProject);
    selectProject(selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    setSelectedProject(null);
    selectProject(null);
    refetch({
      shortName: searchQuery?.name || '',
      pageSize: pageData.pageSize,
      pageNumber: pageData.page,
      sort: [sortDetails]
    });
  }, [pageData]);

  const getColumns = () => {
    return [
      {
        width: 30,
        sortable: false,
        Cell: ({ original }) => {
          return (
            <div className="checkbox-form">
              <input
                type="checkbox"
                checked={original?.id === selectedProject?.id}
                onChange={e => setProject(e.target.checked ? original : null)}
                className={'grid-checkbox'}
              />
              <label></label>
            </div>
          );
        }
      },
      {
        Header: 'Project Name',
        accessor: 'name',
        width: 350,
        Cell: ({ original }) => {
          return (
            <a
              className="projectNameLink"
              target="__blank"
              href={
                '/manage/organizations/' +
                original?.organizationId +
                '/projects/' +
                original?.id
              }
            >
              {original?.name}
            </a>
          );
        }
      },
      {
        Header: 'Organization',
        accessor: 'Organization',
        width: 280,
        align: 'center'
      },
      {
        Header: 'last updated',
        accessor: 'updatedAt',
        width: 180,
        Cell: ({ original }) => {
          return getFormattedUTCDate(original?.updatedAt, 'dd-MM-yyyy');
        }
      },
      {
        Header: 'Catalogued images',
        accessor: 'images',
        align: 'center',
        width: 130,
        Cell: ({ original }) => {
          return (
            <Query
              query={cataloguedImageCountQuery}
              variables={{
                projectId: Number(original?.id),
                pageSize: 100,
                pageNumber: 1,
                sort: [{ column: 'timestamp', order: 'ASC' }]
              }}
            >
              {countData => {
                if (countData?.loading) {
                  return 'loading...';
                }
                return (
                  <span key={'project-' + original?.id}>
                    {countData?.getDataFilesForProject?.dataFileMeta
                      ?.dataFileCount || 0}
                  </span>
                );
              }}
            </Query>
          );
        }
      }
    ];
  };

  const filterData = projectsList => {
    return projectsList?.map(project => {
      project.Organization = project?.organization?.name;
      return project;
    });
  };

  if (error) {
    return (
      <div className="alert alert-danger project-error" role="alert">
        <T text={getGraphQLErrorMessage(error)} />
      </div>
    );
  }

  let projectsList = data?.getProjects || { data: [] };
  projectsList = filterData(projectsList?.data);
  const meta = data?.getProjects?.meta;

  return (
    <div className="project-table-container">
      <div className="project-main-container">
        {loading ? <LoadingSpinner /> : ''}
        <FilterComponent
          placeHolder="Search Projects"
          selected={searchQuery || {}}
          setFilters={setSearchQuery}
        />
        <Table
          manual
          className="table"
          columns={getColumns()}
          data={projectsList}
          resizable={true}
          showPagination={false}
          sorted={
            sortDetails?.column
              ? [
                  {
                    id: sortDetails?.column,
                    ...(sortDetails?.order ? { asc: true } : { desc: true })
                  }
                ]
              : []
          }
          onSortedChange={([{ desc, id }]) => {
            setSortDetail({
              column: id,
              order: !desc ? 'ASC' : 'DESC'
            });
          }}
        />
        <div className="text-center">
          <Pagination
            pageIndex={page - 1}
            pages={meta?.totalPages || 0}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onChangePage={index => {
              let nextPage = index
                ? index === -1
                  ? meta?.totalPages
                  : index + 1
                : 1;
              setPageData(page => ({ ...page, page: nextPage }));
            }}
            onChangePageSize={pSize => {
              setPageData(page => ({ ...page, page: 1, pageSize: pSize }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

ProjectTable.propTypes = {
  saveFilter: PropTypes.func.isRequired,
  selectProject: PropTypes.func.isRequired
};

export default ProjectTable;
