import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import Component from './component';
import getProjects from './query.graphql';

const mapStateToProps = ({ routes: { query } }) => ({
  projectId: query.projectId !== null && query.projectId !== undefined ? +query.projectId : null,
  organizationId: query.organizationId !== null && query.organizationId !== undefined
    ? +query.organizationId
    : null,
  initiativeId: query.initiativeId !== null && query.initiativeId !== undefined
    ? +query.initiativeId
    : null,
});

export default compose(
  connect(mapStateToProps, null),
  graphql(getProjects, {
    // @ts-ignore
    options: ({ organizationId, initiativeId }) => ({
      variables: { organizationId, initiativeId },
    }),
  }),
)(Component);
