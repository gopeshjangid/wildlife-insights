import { connect } from 'react-redux';
import { removeNotification } from 'components/notifications/actions';
import { removeUploadItem, updateUploadItem } from '../list/actions';
import Component from './component';

const mapStateToProps = ({ auth: { token }, deploymentsList: { uploads } }, { id }) => {
  const item = uploads.byId[id];
  if (!item) {
    return {};
  }

  const itemIndex = uploads.allIds.indexOf(id);
  const previousUploads = uploads.allIds
    .slice(0, itemIndex)
    .map(projectId => uploads.byId[projectId]);
  return {
    token,
    status: item.status,
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
    projectId: item.projectId,
    organizationId: item.organizationId,
    initiativeId: item.initiativeId,
    message: item.message,
    errorFilePath: item.errorFilePath,
    totalRecords: item.totalRecords,
    failedRecords: item.failedRecords,
  };
};

const mapDispatchToProps = (dispatch, { id }) => ({
  onRemove: () => {
    dispatch(removeNotification(id));
    dispatch(removeUploadItem(id));
  },
  updateUploadItem: params => dispatch(updateUploadItem({ id, ...params })),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);
