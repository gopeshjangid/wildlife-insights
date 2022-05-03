import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'lib/routes';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import Tooltip from 'components/tooltip';
import NavUserTooltip from 'components/nav-user-tooltip';
import IdentifyPhotosBadgeNoSSR from 'components/identify-photos-badge/no-ssr';

import './style.scss';

export const Logo = () => (
  <a
    href="https://www.wildlifeinsights.org/"
    className="brand"
    rel="noopener noreferrer"
  >
    <img
      srcSet="/static/logo.png, /static/logo@2x.png 2x"
      src="/static/logo.png"
      alt="Wildlife Insights beta"
      className="logo-icon"
    />
  </a>
);

class Header extends PureComponent {
  static propTypes = {
    fixed: PropTypes.bool,
    pathname: PropTypes.string.isRequired,
    user: PropTypes.shape({ data: PropTypes.object }),
    isUserAdmin: PropTypes.bool.isRequired,
    openSelectFileDialog: PropTypes.func,
    isUserWhitelisted: PropTypes.bool.isRequired
  };

  static defaultProps = {
    fixed: false,
    user: { data: null },
    openSelectFileDialog: () => null
  };

  constructor(props) {
    super(props);
    this.openSelectFileDialog = this.openSelectFileDialog.bind(this);
  }

  openSelectFileDialog() {
    const { openSelectFileDialog } = this.props;

    openSelectFileDialog(true);
  }

  render() {
    const {
      fixed,
      pathname,
      user,
      isUserAdmin,
      isUserWhitelisted
    } = this.props;

    if (!user) {
      return (
        <header className={classNames({ 'l-header': true, '-fixed': fixed })}>
          <div className="l-header-container navbar navbar-expand-md">
            <Logo />
            <div className="collapse navbar-collapse">
              <ul className="main-nav navbar-nav ml-auto">
                <li className="nav-item">
                  <Link route="discover">
                    <a
                      className={classNames(
                        'nav-link',
                        pathname.startsWith('/explore') ? '-active' : null
                      )}
                    >
                      Explore Data
                    </a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Tooltip placement="bottom" content={<NavUserTooltip />}>
                    <button type="button" className="nav-link account">
                      Settings
                      <FontAwesomeIcon
                        className="ml-2"
                        icon={faAngleDown}
                        size="lg"
                      />
                    </button>
                  </Tooltip>
                </li>
                <li className="nav-item">
                  <span>
                    <Link route="signin">
                      <a className="btn btn-primary btn-sm">Sign in</a>
                    </Link>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </header>
      );
    }

    let name = user.firstName || user.lastName || 'Account';
    if (name.length > 15) {
      name = `${name.slice(0, 13)}...`;
    }

    return (
      <header className="l-header sticky-top">
        <nav className="l-header-container navbar navbar-expand-md">
          <Logo />
          <div className="collapse navbar-collapse">
            <ul className="main-nav navbar-nav ml-auto">
              {!isUserAdmin && isUserWhitelisted && (
                <Fragment>
                  <li className="nav-item">
                    <Link route="notifications">
                      <a
                        className={classNames(
                          'nav-link',
                          pathname.startsWith('/notifications')
                            ? '-active'
                            : null
                        )}
                      >
                        Notifications
                      </a>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link route="manage">
                      <a
                        className={classNames(
                          'nav-link',
                          pathname.startsWith('/manage') ? '-active' : null
                        )}
                      >
                        Manage
                        <IdentifyPhotosBadgeNoSSR
                          ignoreQuery
                          title="Non-identified photos"
                        />
                      </a>
                    </Link>
                  </li>
                </Fragment>
              )}
              {(process.env.API_URL === 'https://dev.app.wildlifeinsights.org' || process.env.API_URL === 'https://test.app.wildlifeinsights.org' || 
                process.env.NODE_ENV === 'development') && (
                  <li className="nav-item">
                    <Link route="analytics">
                      <a
                        className={classNames(
                          'nav-link',
                          pathname.startsWith('/analytics') ? '-active' : null
                        )}
                      >
                        Analytics
                      </a>
                    </Link>
                  </li>
                )}
              {isUserAdmin && (
                <li className="nav-item">
                  <Link route="account_validation">
                    <a
                      className={classNames(
                        'nav-link',
                        pathname.startsWith('/admin') ? '-active' : null
                      )}
                    >
                      Account validation
                    </a>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link route="discover">
                  <a
                    className={classNames(
                      'nav-link',
                      pathname.startsWith('/explore') ? '-active' : null
                    )}
                  >
                    Explore Data
                  </a>
                </Link>
              </li>
              <li className="nav-item">
                <Tooltip placement="bottom" content={<NavUserTooltip />}>
                  <button type="button" className="nav-link account">
                    {name}
                    <FontAwesomeIcon
                      className="ml-2"
                      icon={faAngleDown}
                      size="lg"
                    />
                  </button>
                </Tooltip>
              </li>
            </ul>

            {/* Upload */}
            {!isUserAdmin && (
              <div className="header-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={isUserWhitelisted ? this.openSelectFileDialog : null}
                  disabled={!isUserWhitelisted}
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }
}

export default Header;
