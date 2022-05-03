import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { removeNotification } from 'components/notifications/actions';
import { removeUploadItem, updateUploadItem } from '../actions';
import getDeployment from './deployment.graphql';
import Component from './component';

const mapStateToProps = ({ auth: { token }, upload: { uploads } }, { id }) => {
  const item = uploads.byId[id];
  if (!item) return {};

  const itemIndex = uploads.allIds.indexOf(id);
  const previousUploads = uploads.allIds
    .slice(0, itemIndex)
    .map(uploadId => uploads.byId[uploadId]);

  return {
    token,
    status: item.status,
    checkAndEnforceNoDuplicates: item.checkAndEnforceNoDuplicates,
    originalPhotosCnt: item.originalPhotosCnt,
    canUpload:
      item.status === 'created'
      && previousUploads.every(
        upload => upload.status === 'finished' || upload.status === 'failed' || upload.status === 'canceled'
      ),
    files: item.files,
    filesUploaded: item.filesUploaded,
    filesErrored: item.filesErrored,
    filesWithUnknownStatus: item.filesWithUnknownStatus,
    progress: item.files.length
      ? Math.round(
        ((item.filesUploaded.length + item.filesErrored.length + item.filesWithUnknownStatus.length)
          / item.files.length) * 100
      )
      : 0,
    organizationId: item.organizationId,
    projectId: item.projectId,
    deploymentId: item.deploymentId,
    projectType: item.projectType
  };
};

const mapDispatchToProps = (dispatch, { id }) => ({
  onRemove: () => {
    dispatch(removeNotification(id));
    dispatch(removeUploadItem(id));
  },
  updateUploadItem: params => dispatch(updateUploadItem({ id, ...params })),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  graphql(getDeployment, {
    name: 'deployment',
    // @ts-ignore
    skip: ({ projectId, deploymentId }) => !exists(projectId) || !exists(deploymentId),
    // @ts-ignore
    options: ({ projectId, deploymentId }) => ({
      variables: { projectId, id: deploymentId },
    }),
  })
)(Component);
