const NProgress = require('nprogress');
const createRoutes = require('next-routes');

// @ts-ignore Types are broken
const routes = createRoutes();

const enable_analytics_route = true;

routes.add('home', '/', 'home');

// User and Authentication
routes.add('confirmed', '/account-confirmed', 'account-confirmed');
routes.add('signin', '/login', 'sign-in');
routes.add('signup', '/join', 'sign-up');
routes.add('resetpassword', '/reset-password', 'reset-password');
routes.add('profile', '/profile', 'profile/edit');

// saml authentication
routes.add(
  'saml_authentication',
  '/saml-authentication',
  'sign-in/saml-authentication'
);

// Manage
routes.add('manage', '/manage', 'manage');
routes.add('overview', '/manage/overview/:tab?', 'manage/overview');

// Admin
routes.add('account_validation', '/admin/accounts', 'admin/account-validation');

if (enable_analytics_route) {
  routes.add('analytics', '/analytics', 'analytics');
}

// Organizations
routes.add(
  'organizations_new',
  '/manage/organizations/new',
  'manage/organizations/new'
);
routes.add(
  'organizations_show',
  '/manage/organizations/:organizationId/:tab?',
  'manage/organizations/show'
);

// Initiatives
routes.add(
  'initiatives_new',
  '/manage/initiatives/new',
  'manage/initiatives/new'
);
routes.add(
  'initiatives_show',
  '/manage/initiatives/:initiativeId/:tab?',
  'manage/initiatives/show'
);

// The next route is public
routes.add(
  'public_initiatives_show',
  '/initiatives/:initiativeId/:initiativeSlug',
  'public/initiatives/show'
);

// Projects
routes.add('projects_new', '/manage/projects/new', 'manage/projects/new');
routes.add(
  'projects_show',
  '/manage/organizations/:organizationId/projects/:projectId/:tab?',
  'manage/projects/show'
);
routes.add(
  'projects_initiative_show',
  '/manage/organizations/:organizationId/initiative/:initiativeId/projects/:projectId/:tab?',
  'manage/projects/show'
);

// The next routes are public
// NOTE: any change to the Discover URLs must be ported over to the redirections made in
// server/index.js
routes.add('discover', '/explore', 'public/discover');
routes.add(
  'discover_project',
  '/explore/:projectId/:projectSlug',
  'public/discover'
);

routes.add(
  'public_project_show',
  '/public-project/:projectId/:projectSlug',
  'public/project'
);

// Terms & Privacy
routes.add('terms', '/terms-of-service', 'terms');
routes.add('privacy', '/privacy-policy', 'privacy');

routes.add('notifications', '/notifications', 'download-notifications');

// Pubic image access
routes.add('public_image', '/download/:id/data-files/:uuid', 'public-image');

// We add the progress bar at the top of the file
routes.Router.events.on('routeChangeStart', () => NProgress.start());
routes.Router.events.on('routeChangeComplete', () => NProgress.done());
routes.Router.events.on('routeChangeError', () => NProgress.done());

const exportedModule = routes;
exportedModule.Link = routes.Link;
exportedModule.Router = routes.Router;

module.exports = exportedModule;
