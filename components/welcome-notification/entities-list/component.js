import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'lib/routes';
import { sortEntities } from './helpers';

import './style.scss';

const EntitiesList = ({ organizations, initiatives, projects }) => {
  const sortedOrganizations = useMemo(() => sortEntities(organizations), [organizations]);
  const sortedInitiatives = useMemo(() => sortEntities(initiatives), [initiatives]);
  const sortedProjects = useMemo(() => sortEntities(projects), [projects]);

  return (
    <div className="c-welcome-notification-entities-list">
      {"You've been granted access to the following entities:"}
      {!!organizations.length && (
        <details>
          <summary>
            Organizations <span>({organizations.length})</span>
          </summary>
          <ul>
            {sortedOrganizations.map(organization => (
              <li key={organization.id}>
                <Link route="organizations_show" params={{ organizationId: organization.id }}>
                  <a>{organization.name}</a>
                </Link>{' '}
                as <strong>{organization.role}</strong>
              </li>
            ))}
          </ul>
        </details>
      )}
      {!!initiatives.length && (
        <details>
          <summary>
            Initiatives <span>({initiatives.length})</span>
          </summary>
          <ul>
            {sortedInitiatives.map(initiative => (
              <li key={initiative.id}>
                <Link route="initiatives_show" params={{ initiativeId: initiative.id }}>
                  <a>{initiative.name}</a>
                </Link>{' '}
                as <strong>{initiative.role}</strong>
              </li>
            ))}
          </ul>
        </details>
      )}
      {!!projects.length && (
        <details>
          <summary>
            Projects <span>({projects.length})</span>
          </summary>
          <ul>
            {sortedProjects.map(project => (
              <li key={project.id}>
                <Link
                  route="projects_show"
                  params={{ organizationId: project.organizationId, projectId: project.id }}
                >
                  <a>{project.name}</a>
                </Link>{' '}
                as <strong>{project.role}</strong>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

const entityPropType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
});

EntitiesList.propTypes = {
  organizations: PropTypes.arrayOf(entityPropType).isRequired,
  initiatives: PropTypes.arrayOf(entityPropType).isRequired,
  projects: PropTypes.arrayOf(entityPropType).isRequired,
};

export default EntitiesList;
