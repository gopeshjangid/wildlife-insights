import { PureComponent } from 'react';

import routes, { Router } from 'lib/routes';
import { isAdminUser, isWhitelistedUser } from 'modules/user/helpers';

/**
 * As we don't have homepage this page is used
 * to redirect to login or projects page
 * depending on user is already logged or not.
 */
class HomePage extends PureComponent {
  static getInitialProps = ({ req, res, store, isServer }) => {
    const manageRoute = routes.findByName('manage');
    const validationRoute = routes.findByName('account_validation');
    const exploreRoute = routes.findByName('discover');

    const isAdmin = isAdminUser(store.getState().user);
    const isUserWhitelisted = isWhitelistedUser(store.getState().user);
    if (req) {
      const reqRoute = isUserWhitelisted ? manageRoute : exploreRoute;
      res.redirect(isAdmin ? validationRoute.getAs() : reqRoute.getAs());
    }

    if (store && !isServer) {
      const storeRoute = isUserWhitelisted ? 'manage' : 'explore';
      Router.replaceRoute(isAdmin ? 'account_validation' : storeRoute);
    }

    return {};
  };

  render() {
    return null;
  }
}

export default HomePage;
