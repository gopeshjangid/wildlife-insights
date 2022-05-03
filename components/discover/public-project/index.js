import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { setSidebarExpanded, setBasicFilters } from 'components/discover/actions';
import Component from './component';

const mapStateToProps = ({ auth: { authenticated }, routes: { query }, user }) => ({
  authenticated: !!authenticated,
  projectId: exists(query.projectId) ? +query.projectId : undefined,
  projectSlug: exists(query.projectSlug) ? query.projectSlug : undefined,
  fromExplore: !!query.fromExplore,
  user: user.data,
});

const mapDispatchToProps = (dispatch) => ({
  setSidebarExpanded: flag => dispatch(setSidebarExpanded(flag)),
  setBasicFilters: filters => dispatch(setBasicFilters(filters))
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
