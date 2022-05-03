import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';

const mapStateToProps = (
  {
    routes: {
      query: { organizationId, initiativeId, projectId, tab }
    },
    user: {
      data: { useCommonNames }
    }
  },
  ownProps
) => ({
  organizationId: exists(organizationId) ? +organizationId : null,
  initiativeId: exists(initiativeId) ? +initiativeId : null,
  projectId: exists(projectId) ? +projectId : null,
  tab,
  useCommonNames,
  ...ownProps
});

export default connect(mapStateToProps)(Component);
