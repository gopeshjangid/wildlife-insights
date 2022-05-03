import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'lib/routes';
import classNames from 'classnames';

import LoadingSpinner from 'components/loading-spinner';
import './style.scss';

class ProjectsNav extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      getOrganization: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    projectId: PropTypes.number
  };

  static defaultProps = {
    data: { getProjects: null, loading: false, error: null },
    projectId: null
  };

  render() {
    const {
      data: { loading, error, getProjects },
      projectId,
    } = this.props;

    const projects = (getProjects && getProjects.data) || [];

    /**
     * What to render and when:
     *
     *            | projects.length | !projects.length
     *  ----------|-----------------|------------------
     *  loading   | show project    | show spinner
     *  ----------|-----------------|------------------
     *  !loading  | show project    | show empty result
     *
     * NOTE: apollo will set loading to true whenever data is fetched
     * and even if it's already cached
     * Since the component is mount every time the user navigates, we
     * only want to show a spinner if we don't have anything cached
     * If the data is updated, then it will be automatically reflected
     * in the UI without a previous spinner
     */

    return (
      <div className="c-projects-nav">
        {error && (
          <div className="alert alert-danger" role="alert">
            Unable to load the projects. Please try again in a few minutes.
          </div>
        )}
        {
          (loading && !projects.length) && (
            <div className="text-center">
              <LoadingSpinner inline />
            </div>
          )
        }
        {!loading && projects.length === 0 && (
          <p className="no-data">No projects added.</p>
        )}
        {!!projects.length && (
          <ul>
            {projects.map(({ id, shortName, organizationId }) => (
              <li key={id}>
                <Link
                  route='projects_show'
                  params={{ projectId: id, organizationId }}
                >
                  <a className={classNames(projectId === +id ? '-active' : '')}>
                    {shortName}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default ProjectsNav;
