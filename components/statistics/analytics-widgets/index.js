import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

const mapStateToProps = (
  { auth: { authenticated }, routes: { query } },
  { usePublicEndpoint }
) => ({
  authenticated: usePublicEndpoint ? false : !!authenticated,
  organizationId: exists(query.organizationId) ? +query.organizationId : null,
  initiativeId: exists(query.initiativeId) ? +query.initiativeId : null,
  projectId: exists(query.projectId) ? +query.projectId : null,
});

export default connect(mapStateToProps)(Component);

export { actions, initialState, reducers };
