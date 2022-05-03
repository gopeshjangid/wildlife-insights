import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'lib/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import Tooltip from 'components/tooltip';
import ProjectSearch from 'components/projects/project-search';
import OrganizationsNav from 'components/organizations/nav';
import InitiativesNav from 'components/initiatives/nav';

import './style.scss';

const isOverview = pathname => /overview(\/(summary|identify|catalogued))?/.test(pathname);

class ManageSidebar extends PureComponent {
  el = createRef();

  /**
   * This function might be called by the ancestor component
   */
  focus() {
    this.el.current.focus();
  }

  render() {
    const { pathname } = this.props;

    return (
      <aside ref={this.el} role="menu" tabIndex={0} className="c-manage-sidebar">
        <ProjectSearch />
        <nav className="sidebar-nav">
          <Link route="overview" params={{ tab: 'summary' }}>
            <a className={`nav-item ${isOverview(pathname) ? '-active' : ''}`}>Overview</a>
          </Link>
          <h3>Organizations</h3>
          <OrganizationsNav />
          <h3>Initiatives</h3>
          <InitiativesNav />
        </nav>
        <div className="sidebar-actions">
          <Tooltip
            distance={20}
            onCreate={(tip) => { this.createTooltip = tip; }}
            content={
              (
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <Link route="projects_new">
                      <a // eslint-disable-line
                        className="nav-link"
                        onClick={() => { this.createTooltip.hide(); }}
                      >
                        New project
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link route="organizations_new">
                      <a // eslint-disable-line
                        className="nav-link"
                        onClick={() => { this.createTooltip.hide(); }}
                      >
                        New organization
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link route="initiatives_new">
                      <a // eslint-disable-line
                        className="nav-link"
                        onClick={() => { this.createTooltip.hide(); }}
                      >
                        New initiative
                      </a>
                    </Link>
                  </li>
                </ul>
              )
            }
          >
            <button type="button" className="btn btn-secondary">
              Add new
              <FontAwesomeIcon
                className="ml-2"
                icon={faPlusCircle}
                size="lg"
              />
            </button>
          </Tooltip>
        </div>
      </aside>
    );
  }
}

ManageSidebar.propTypes = {
  pathname: PropTypes.string,
};

ManageSidebar.defaultProps = {
  pathname: null,
};

export default ManageSidebar;
