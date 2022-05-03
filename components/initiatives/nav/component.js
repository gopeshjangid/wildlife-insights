import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'lib/routes';
import classNames from 'classnames';
import LoadingSpinner from 'components/loading-spinner';
import ProjectsNav from 'components/projects/nav';

import './style.scss';

class InitiativesNav extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({ getOrganization: PropTypes.object }),
    initiativeId: PropTypes.number,
  };

  static defaultProps = {
    data: { getInitiatives: null, loading: false, error: null },
    initiativeId: null,
  };

  render() {
    const { data: { loading, error, getInitiatives }, initiativeId } = this.props;
    const initiatives = loading || error ? [] : getInitiatives.data;

    return (
      <div className="c-initiatives-nav">
        {
          loading && (
            <div className="text-center">
              <LoadingSpinner inline />
            </div>
          )
        }
        {!loading && initiatives.length === 0 && <p className="no-data">No initiatives added.</p>}
        {
          !loading && initiatives && (
            <ul>
              {initiatives.map(({ id, name }) => (
                <li key={id}>
                  <Link route="initiatives_show" params={{ initiativeId: id }}>
                    <a className={classNames(initiativeId === +id ? '-active' : '')}>
                      {name}
                    </a>
                  </Link>
                  {initiativeId === +id ? <ProjectsNav /> : null}
                </li>
              ))}
            </ul>
          )
        }
      </div>
    );
  }
}

export default InitiativesNav;
