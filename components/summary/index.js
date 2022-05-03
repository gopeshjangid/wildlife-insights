import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import routes from 'lib/routes';
import Component from './component';

import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

const mapStateToProps = ({ routes: { query, pathname }, imageGrid: { projectType }, summary }) => ({
  projectId: exists(query.projectId) ? +query.projectId : null,
  organizationId: exists(query.organizationId) ? +query.organizationId : null,
  initiativeId: exists(query.initiativeId) ? +query.initiativeId : null,
  routeName: routes.match(pathname || '')?.route?.name,
  orgAnalyticType: summary.orgAnalyticType,
  projectType
});

const mapDispatchToProps = dispatch => ({
  setOrgAnalyticType: orgAnalyticType => dispatch(actions.setOrgAnalyticType(orgAnalyticType)),
});


export { actions, reducers, initialState };
export default connect(mapStateToProps, mapDispatchToProps)(Component);
