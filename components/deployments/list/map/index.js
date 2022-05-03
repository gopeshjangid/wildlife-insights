import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';

const mapStateToProps = ({ routes: { query } }) => ({
  projectId: exists(query.projectId) ? +query.projectId : null,
});

export default connect(mapStateToProps)(Component);
