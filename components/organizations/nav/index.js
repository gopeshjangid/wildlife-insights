import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import Component from './component';
import getOrganizations from './query.graphql';

const mapStateToProps = state => ({
  user: state.user.data,
  organizationId: state.routes.query.organizationId,
  initiativeId: state.routes.query.initiativeId,
  projectId: state.routes.query.projectId,
});

export default compose(
  connect(mapStateToProps),
  graphql(getOrganizations)
)(Component);
