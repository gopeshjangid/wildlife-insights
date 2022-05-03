import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import { map, groupBy, sortBy, filter } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { Link } from 'lib/routes';
import { exists } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import Project from './project';

import ProjectsQuery from './projects.graphql';
import OrganizationsQuery from './organizations.graphql';

import './style.scss';

const ProjectsGrid = ({ organizationId, initiativeId, projectId }) => {
  const { data, loading, error } = useQuery(ProjectsQuery, {
    variables: {
      organizationId,
      initiativeId,
    },
    skip: projectId
  });

  const { data: orgData } = useQuery(OrganizationsQuery, {
    skip: projectId || organizationId
  });

  if (exists(projectId)) {
    return null;
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        Unable to load the list of projects. Please try again in a few minutes.
      </div>
    );
  }

  if (loading && (!data || !data.getProjects)) {
    return (
      <div className="text-center mt-4">
        <LoadingSpinner inline />
      </div>
    );
  }

  if (!exists(organizationId) && !exists(initiativeId)) {
    /** @type {Object<string,any[]>} projectsByOrgId */
    const projectsByOrgId = groupBy(data.getProjects.data, p => p.organization.id);
    const organizations = sortBy(
      Object.keys(projectsByOrgId).map(id => ({
        id,
        /** @type {string} */
        name: projectsByOrgId[id][0].organization.name,
      })),
      org => org.name
    );
    const orgKeys = map(organizations, 'id');
    const allOrgs = orgData?.getOrganizations?.data || [];
    allOrgs.forEach((row) => {
      if (!orgKeys.includes(row.id)) {
        organizations.push(row);
      }
    });

    return (
      <div className="c-projects-grid">
        {organizations.map(organization => (
          <div key={organization.id} className="mt-4">
            <h2>
              <Link
                route="organizations_show"
                params={{
                  organizationId: organization.id,
                  tab: 'details',
                }}
              >
                <a className="organization-title">
                  {organization.name}
                  <FontAwesomeIcon className="ml-2" icon={faInfoCircle} size="sm" />
                </a>
              </Link>
            </h2>
            <div className="row">
              {projectsByOrgId[organization.id]
              && projectsByOrgId[organization.id].map(project => (
                <Project key={project.id} project={project} />
              ))
              }
              {!projectsByOrgId[organization.id]
                && (
                <div className="item col-6 col-md-3">
                  <div className="thumbnail empty-org">
                    Either there is no project in the organization or you do not have access to any of the projects in the organization.
                  </div>
                </div>
                )
              }
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="c-projects-grid">
      <div className="row mb-2">
        <div className="col">
          <h2>Projects</h2>
        </div>
      </div>
      <div className="row">
        {data.getProjects.data.map(project => (
          <Project key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

ProjectsGrid.propTypes = {
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
};

ProjectsGrid.defaultProps = {
  organizationId: undefined,
  initiativeId: undefined,
  projectId: undefined,
};

export default ProjectsGrid;
