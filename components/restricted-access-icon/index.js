import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';

const mapStateToProps = (state, ownProps) => {
  const { query } = state.routes;

  // By default, this component indicates a read-only access based on the entity the user is looking
  // at (it looks at eventual IDs of entities in the store)
  // In other cases, this component can directly receive these IDs as props. When this happens,
  // ignoreQuery must also be set so it knows it has to ignore what's in the store
  const ignoreQuery = exists(ownProps.ignoreQuery) ? ownProps.ignoreQuery : false;

  // Based on what's said in the previous comment, we try to retrieve and parse the organizationId,
  // initiativeId and projectId from either the store or the component's props
  let organizationId;
  if (!ignoreQuery && exists(query.organizationId)) organizationId = +query.organizationId;
  if (exists(ownProps.organizationId)) organizationId = +ownProps.organizationId;

  let initiativeId;
  if (!ignoreQuery && exists(query.initiativeId)) initiativeId = +query.initiativeId;
  if (exists(ownProps.initiativeId)) initiativeId = +ownProps.initiativeId;

  let projectId;
  if (!ignoreQuery && exists(query.projectId)) projectId = +query.projectId;
  if (exists(ownProps.projectId)) projectId = +ownProps.projectId;

  // At this point, we know which of the organizationId, initiativeId and projectId are defined
  // The following lines determines which entity type and entity ID we want to indicate the
  // read-only access for
  let entity = 'organization';
  let entityId = organizationId;

  if (exists(initiativeId)) {
    entity = 'initiative';
    entityId = initiativeId;
  }

  if (exists(projectId)) {
    entity = 'project';
    entityId = projectId;
  }

  return {
    readAccessOnly: !can(
      permissionsSelector(state),
      entity,
      entityId,
      PERMISSIONS[`${entity.toUpperCase()}_UPDATE`]
    ),
  };
};

export default connect(mapStateToProps)(Component);
