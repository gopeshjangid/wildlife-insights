import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'lib/routes';
import LanguageSelect from 'components/transifex/language-select';
import './style.scss';

const NavUserTooltip = ({ authenticated }) => (
  <div className="c-nav-user-tooltip">
    {authenticated && (
      <Fragment>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link route="profile">
              <a className="nav-link">Account details</a>
            </Link>
          </li>
          <li className="nav-item">
            <a href="/logout" className="nav-link">
              Logout
            </a>
          </li>
        </ul>
        <hr className="mx-3" />
      </Fragment>
    )}
    <LanguageSelect />
  </div>
);

NavUserTooltip.propTypes = {
  authenticated: PropTypes.bool.isRequired
};

export default NavUserTooltip;
