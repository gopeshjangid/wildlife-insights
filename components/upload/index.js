import { compose, graphql } from 'react-apollo';
import React from 'react';
import { connect } from 'react-redux';

import { can, PERMISSIONS } from 'modules/user/helpers';
import { permissionsSelector } from 'modules/user/selectors';
import { closeSelectFileDialog } from 'components/select-file-dialog/actions';
import { displayInfo } from 'components/notifications/actions';
import UploadItem from './upload-item';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';
import Component from './component';

import createLocation from './createLocation.graphql';
import createDeployment from './createDeployment.graphql';
import createDevice from 'components/devices/modal/device/create-device.graphql';

export { actions, reducers, initialState };

const mapStateToProps = (state) => {
  const {
    upload: { modal },
    routes: { query },
    user,
  } = state;
  return {
    deployment: modal.deployment,
    files: modal.files,
    isEditing: modal.isEditing,
    isOpen: modal.isOpen,
    project: modal.project,
    organizationId: query.organizationId,
    projectId: query.projectId,
    canCreateDeploymentForProject: projectId => can(permissionsSelector(state), 'project', projectId, PERMISSIONS.DEPLOYMENT_CREATE),
    canCreateLocationForProject: projectId => can(permissionsSelector(state), 'project', projectId, PERMISSIONS.LOCATION_CREATE),
    projectsPermissions: user.permissions.projects,
    isProjectTagger: user.permissions?.projects[query.projectId]?.role === 'PROJECT_TAGGER',
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
  closeSelectFileDialog: () => dispatch(closeSelectFileDialog()),
  closeModal: () => dispatch(actions.closeModal()),
  updateData: data => dispatch(actions.updateData(data)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  graphql(createDevice, {
    name: 'createDevice',
    // @ts-ignore
    options: {
      // Needs to be a function because of a bug of apollo-client:
      // https://github.com/apollographql/apollo-client/issues/3540#issuecomment-441288962
      refetchQueries: () => ['getDevices', 'getDevice'],
    },
  }),
  graphql(createLocation, {
    name: 'createLocation',
    // @ts-ignore
    options: {
      // Needs to be a function because of a bug of apollo-client:
      // https://github.com/apollographql/apollo-client/issues/3540#issuecomment-441288962
      refetchQueries: () => ['getLocations', 'getLocation'],
    },
  }),
  graphql(createDeployment, {
    name: 'createDeployment',
    // @ts-ignore
    options: {
      // Needs to be a function because of a bug of apollo-client:
      // https://github.com/apollographql/apollo-client/issues/3540#issuecomment-441288962
      refetchQueries: () => ['getDeployments', 'getDeployment'],
    },
  })
)(Component);