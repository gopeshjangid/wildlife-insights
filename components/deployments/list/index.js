import React from 'react';
import { connect } from 'react-redux';
import { exists } from 'utils/functions';
import { PERMISSIONS, can } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { displayInfo } from 'components/notifications/actions';
import Component from './component';
import UploadItem from '../upload-item';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

const mapStateToProps = (state) => {
  const {
    routes: { query },
  } = state;
  const projectId = exists(query.projectId) ? +query.projectId : undefined;
  const { deploymentsList } = state;
  return {
    projectId,
    organizationId: exists(query.organizationId) ? +query.organizationId : undefined,
    canCreate: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.DEPLOYMENT_CREATE),
    canEdit: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.DEPLOYMENT_UPDATE),
    canDelete: can(permissionsSelector(state), 'project', projectId, PERMISSIONS.DEPLOYMENT_DELETE),
    filters: deploymentsList.filters,
    initiativeId: exists(query.initiativeId) ? +query.initiativeId : null,
  };
};

const mapDispatchToProps = dispatch => ({
  createUploadItem: (data) => {
    dispatch(actions.createUploadItem(data));
    dispatch(
      displayInfo({
        uid: data.id,
        autoDismiss: 0,
        dismissible: false,
        message: <UploadItem id={data.id} />,
      })
    );
  },
  setFilters: filters => dispatch(actions.setFilters(filters)),
  reset: () => dispatch(actions.reset()),
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export { actions, initialState, reducers };
