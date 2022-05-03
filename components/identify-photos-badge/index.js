import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';

const mapStateToProps = ({ routes: { query } }, ownProps) => {
  const ignoreQuery = exists(ownProps.ignoreQuery)
    ? ownProps.ignoreQuery
    : false;

  let projectId;
  if (!ignoreQuery && exists(query.projectId)) projectId = +query.projectId;
  if (exists(ownProps.projectId)) projectId = +ownProps.projectId;

  return { projectId };
};

export default connect(mapStateToProps)(Component);
