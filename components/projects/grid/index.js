import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';

const mapStateToProps = ({ routes: { query } }) => ({
  organizationId: exists(query.organizationId) ? +query.organizationId : undefined,
  initiativeId: exists(query.initiativeId) ? +query.initiativeId : undefined,
  projectId: exists(query.projectId) ? +query.projectId : undefined,
});

export default connect(mapStateToProps)(Component);
