import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';

const mapStateToProps = (
  { auth: { authenticated }, routes: { query } },
  { usePublicEndpoint }
) => ({
  authenticated: usePublicEndpoint ? false : !!authenticated,
  projectId: exists(query.projectId) ? +query.projectId : null,
  organizationId: exists(query.organizationId) ? +query.organizationId : null,
  initiativeId: exists(query.initiativeId) ? +query.initiativeId : null,
});

export default connect(mapStateToProps)(Component);
