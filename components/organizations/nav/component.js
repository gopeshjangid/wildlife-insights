import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'lib/routes';

import LoadingSpinner from 'components/loading-spinner';
import ProjectsNav from 'components/projects/nav';

import './style.scss';

class OrganizationsNav extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({ getOrganizations: PropTypes.object }),
    organizationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initiativeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  };

  static defaultProps = {
    data: { getOrganizations: {}, loading: false, error: null },
    organizationId: null,
    initiativeId: null,
    projectId: null,
    user: null,
  };

  render() {
    const {
      data: { loading, getOrganizations },
      organizationId,
      initiativeId,
      projectId,
      user,
    } = this.props;

    const organizations = (getOrganizations && getOrganizations.data) || [];

    /**
     * What to render and when:
     *
     *            | organizations.length | !organizations.length
     *  ----------|----------------------|-----------------------
     *  loading   | show organizations   | show spinner
     *  ----------|----------------------|-----------------------
     *  !loading  | show organizations   | show empty result
     *
     * NOTE: apollo will set loading to true whenever data is fetched
     * and even if it's already cached
     * Since the component is mount every time the user navigates, we
     * only want to show a spinner if we don't have anything cached
     * If the data is updated, then it will be automatically reflected
     * in the UI without a previous spinner
     */

    return (
      <div className="c-organizations-nav">
        {
          (loading && !organizations.length) && (
            <div className="text-center">
              <LoadingSpinner inline />
            </div>
          )
        }
        {
          !loading
          && organizations.length === 0
          && <p className="no-data">No organizations added.</p>
        }
        {
          !!organizations.length && (
            <ul>
              {organizations.map(({ id, name }) => (
                <li key={id}>
                  <Link
                    params={{ organizationId: id }}
                    route="organizations_show"
                  >
                    <a
                      className={
                        classNames(
                          (!projectId || !!initiativeId) && organizationId === id ? '-active' : ''
                        )
                      }
                    >
                      {
                        /My first organization/i.test(name)
                          ? `${user.firstName || ''} ${user.lastName || ''}`
                          : name
                      }
                    </a>
                  </Link>
                  {organizationId === id && !initiativeId && (
                    <ProjectsNav organizationId={id} />
                  )}
                </li>
              ))}
            </ul>
          )
        }
      </div>
    );
  }
}

export default OrganizationsNav;
