import { connect } from 'react-redux';

import Component from './component';

const mapStateToProps = ({
  auth: { token },
  routes: {
    query: { organizationId, initiativeId, projectId },
  },
}) => ({
  organizationId,
  initiativeId,
  projectId,
  token
});

export default connect(mapStateToProps)(Component);
