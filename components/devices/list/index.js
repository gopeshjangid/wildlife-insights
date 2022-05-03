import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import Component from './component';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

const mapStateToProps = (state) => {
  const {
    routes: { query },
  } = state;
  const organizationId = exists(query.organizationId)
    ? +query.organizationId
    : undefined;
  const { devicesList } = state;
  return {
    organizationId,
    canCreate: can(
      permissionsSelector(state),
      'organization',
      organizationId,
      PERMISSIONS.DEVICE_CREATE
    ),
    canEdit: can(
      permissionsSelector(state),
      'organization',
      organizationId,
      PERMISSIONS.DEVICE_UPDATE
    ),
    canDelete: can(
      permissionsSelector(state),
      'organization',
      organizationId,
      PERMISSIONS.DEVICE_DELETE
    ),
    filters: devicesList.filters,
  };
};

const mapDispatchToProps = dispatch => ({
  setFilters: filters => dispatch(actions.setFilters(filters)),
  reset: () => dispatch(actions.reset()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
export { actions, initialState, reducers };
