import React, { PureComponent } from 'react';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PQueue from 'p-queue';
import { translateText } from 'utils/functions';
import ProgressSpinner from 'components/progress-spinner';
import T from 'components/transifex/translate';
import { uploadCSVFile, generateErrorFile } from './helpers';
import './style.scss';

class UploadItem extends PureComponent {
  static propTypes = {
    // Verified:
    token: PropTypes.string,
    status: PropTypes.string,
    canUpload: PropTypes.bool,
    progress: PropTypes.number,
    files: PropTypes.arrayOf(PropTypes.object),
    filesUploaded: PropTypes.arrayOf(PropTypes.string),
    filesErrored: PropTypes.arrayOf(PropTypes.string),
    filesWithUnknownStatus: PropTypes.arrayOf(PropTypes.string),
    projectId: PropTypes.number,
    organizationId: PropTypes.number,
    initiativeId: PropTypes.number,
    onRemove: PropTypes.func.isRequired,
    updateUploadItem: PropTypes.func.isRequired,
    totalRecords: PropTypes.number,
    failedRecords: PropTypes.number,
    errorFilePath: PropTypes.string,
    message: PropTypes.string,
  }

  static defaultProps = {
    token: null,
    status: 'created',
    canUpload: false,
    progress: 0,
    files: [],
    filesUploaded: [],
    filesErrored: [],
    filesWithUnknownStatus: [],
    projectId: null,
    organizationId: null,
    initiativeId: null,
    totalRecords: null,
    failedRecords: null,
    errorFilePath: null,
    message: null,
  }

  state = {
    errorFileUrl: undefined,
    failedStatus: ['DEPLOYMENTS_CREATED_PARTIALLY', 'VALIDATION_FAILED'],
  }

  constructor(props) {
    super(props);
    this.onChangeOnlineStatus = this.onChangeOnlineStatus.bind(this);
  }

  componentDidMount() {
    const { canUpload } = this.props;
    window.addEventListener('online', this.onChangeOnlineStatus);
    window.addEventListener('offline', this.onChangeOnlineStatus);
    if (canUpload) {
      this.upload();
    }
  }

  componentDidUpdate(prevProps) {
    const { canUpload } = this.props;
    if (!prevProps.canUpload && canUpload) {
      this.upload();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.onChangeOnlineStatus);
    window.removeEventListener('offline', this.onChangeOnlineStatus);
  }

  onChangeOnlineStatus() {
    const isOnline = navigator.onLine;
    const { status, updateUploadItem } = this.props;

    if (!isOnline && status === 'uploading') {
      this.queue.pause();
      updateUploadItem({ status: 'paused' });
    } else if (isOnline && status === 'paused') {
      this.queue.start();
      updateUploadItem({ status: 'uploading' });
    }
  }

  onCancel() {
    const { updateUploadItem, filesUploaded, filesErrored, filesWithUnknownStatus } = this.props;

    const pendingUploads = this.queue.pending;
    const uploadStarted = pendingUploads > 0 || filesUploaded.length > 0
      || filesErrored.length > 0 || filesWithUnknownStatus.length > 0;

    this.queue.clear();

    if (uploadStarted) {
      if (pendingUploads > 0) {
        updateUploadItem({ status: 'canceling' });
      } else {
        updateUploadItem({ status: 'canceled' });
      }
    } else {
      updateUploadItem({ status: 'canceled' });
    }
  }

  onClickReload = (organizationId, projectId, initiativeId) => {
    const { onRemove } = this.props;

    // Removing upload item when user clicks on reload button
    onRemove();

    if (initiativeId) {
      window.location.replace(`/manage/organizations/${organizationId}/initiative/${initiativeId}/projects/${projectId}/details`);
    } else {
      window.location.replace(`/manage/organizations/${organizationId}/projects/${projectId}/details`);
    }
  }

  upload() {
    const { files, projectId, updateUploadItem, token } = this.props;

    // We'll execute the uploads 6 at a time
    this.queue = new PQueue({ concurrency: 6, autoStart: false });
    /**
     * List of the names of files successfully uploaded
     * @type {string[]}
     */
    const filesUploaded = [];

    /**
     * List of the names of files that failed to upload despite
     * the second attempt
     * @type {string[]}
     */
    const filesErrored = [];

    /**
     * List of the names of the files whose status is unknown (might or might not be uploaded to the
     * server)
     * @type {string[]}
     */
    const filesWithUnknownStatus = [];

    /**
     * List of the names of the files to try to re-upload once
     * because they've failed the first time
     * @type {string[]}
     */
    const filesToRetry = [];

    const getPromise = async (file) => {
      return new Promise((resolve, reject) => {
        // The offline and online events are delayed on Chrome and Safari for about 1s
        // The timeout prevents many deployments from trying to upload during the lapse of time between
        // the actual connection loss and the offline event, thus reducing the number of unknowns
        // to the strict minimum (number of parallel connections)
        setTimeout(() => {
          // The upload might have been paused because of the offline event, but the queue still
          // triggered the next wave of uploads
          // After the timeout, we need to check if we can still upload
          if (this.queue.isPaused) {
            reject();
          } else {
            resolve();
          }
        }, 1000);
      })
        .then(() => uploadCSVFile({ authToken: token, projectId, file }))
        .then((resp) => {
          filesUploaded.push(file.instance.name);
          updateUploadItem({ filesUploaded, message: resp.data.message, errorFilePath: resp.data?.errorFilePath, totalRecords: resp.data?.totalRecords, failedRecords: resp.data?.failedRecords });
        })
        .catch((error) => {
          if (!error) {
            // This case only happen if the upload was paused but the queue still triggered the next
            // wave of uploads
            // In that case, we just push back the files to the queue, with the same priority
            this.queue.add(() => getPromise(file), { priority: 1 });
          } else if (error.response) {
            // The server rejected the file
            // If the upload for this file hasn't been retried once, we do it
            if (filesToRetry.indexOf(file.instance.name) === -1) {
              filesToRetry.push(file.instance.name);
              this.queue.add(() => getPromise(file), { priority: 0 });
            } else {
              filesErrored.push(file.instance.name);
              updateUploadItem({ filesErrored });
            }
          } else {
            // The most likely reason to end up here is that we lost the connection
            // The front-end has no way to know the status of the file without using unique IDs so
            // we'll tag the file as having an unknown status
            filesWithUnknownStatus.push(file.instance.name);
            updateUploadItem({ filesWithUnknownStatus });
          }
        });
    };

    const isOnline = navigator.onLine;
    // We update the UI
    updateUploadItem({ status: isOnline ? 'uploading' : 'paused' });

    // We add the files to the queue
    this.queue.addAll(files.map(file => () => getPromise(file)), { priority: 1 });

    if (isOnline) {
      this.queue.start();
    }

    this.queue.onIdle().then(() => {
      const { status, message, totalRecords, failedRecords } = this.props;
      const { failedStatus } = this.state;
      if (status === 'canceling') {
        updateUploadItem({ status: 'canceled' });
      } else if (!filesErrored.length && !filesWithUnknownStatus.length) {
        if (includes(failedStatus, message)) {
          updateUploadItem({ status: 'failed' });
        } else {
          updateUploadItem({ status: 'finished' });
        }
      } else {
        const totalUploaded = totalRecords - failedRecords;
        const fileUrl = generateErrorFile(
          totalUploaded,
          filesWithUnknownStatus
        );
        this.setState({ errorFileUrl: fileUrl });
        updateUploadItem({ status: 'failed' });
      }
    });
  }

  render() {
    const { errorFileUrl } = this.state;
    const {
      filesUploaded,
      filesWithUnknownStatus,
      progress,
      status,
      onRemove,
      totalRecords,
      failedRecords,
      errorFilePath,
      organizationId,
      projectId,
      initiativeId,
    } = this.props;
    const totalUploaded = totalRecords - failedRecords;
    return (
      <div className="c-upload-item">
        <div className="notification-title">
          {status === 'created' && (
            <T text="Upload in waiting" />
          )}
          {status === 'uploading' && (
            <T text="Validating bulk Uploads" />
          )}
          {status === 'paused' && (
            <T text="Upload paused!" />
          )}
          {status === 'finished' && <T text="Upload complete!" />}
          {status === 'canceling' && <T text="Canceling upload..." />}
          {status === 'canceled' && <T text="Upload canceled!" />}
          {status === 'failed' && (
            <span className="text-danger">
              <T text="Bulk upload failed!" />
            </span>
          )}
        </div>
        <div className="notification-message notification-action">
          {status !== 'failed' && status !== 'canceling' && status !== 'canceled'
            && status !== 'paused' && (
            <T text="Deployments" />
          )}
          {status === 'canceling' && (
            <T text="Some deployments are still being processed by the server." />
          )}
          {status === 'canceled' && (
            <span>
              {!filesUploaded.length && <T text="None of the deployments were uploaded." />}
              {!!filesUploaded.length && !filesWithUnknownStatus.length && (
                <T
                  text="{uploaded} deployments(s) were uploaded before you canceled."
                  params={{ uploaded: totalUploaded }}
                />
              )}
              {!!filesUploaded.length && !!filesWithUnknownStatus.length && (
                <T
                  text="Between {uploaded} and {total} deployments(s) were uploaded before you canceled."
                  params={{
                    uploaded: filesUploaded.length,
                    total: filesUploaded.length + filesWithUnknownStatus.length,
                  }}
                />
              )}
            </span>
          )}
          {status === 'failed' && (
            <span>
              <T
                text={totalRecords ? '{errored}/{total} deployments(s) failed' : 'deployments(s) failed'}
                params={{
                  errored: failedRecords,
                  total: totalRecords
                }}
              />
            </span>
          )}
        </div>
        {status === 'uploading' && <ProgressSpinner progress={progress / 100} />}
        {(status === 'uploading' || status === 'paused') && (
          <button
            type="button"
            className="btn btn-secondary btn-sm notification-action-button"
            onClick={() => this.onCancel()}
          >
            <T text="Cancel" />
          </button>
        )}
        {status === 'finished' && (
          <button
            type="button"
            className="btn btn-secondary btn-sm notification-action-button"
            onClick={() => this.onClickReload(organizationId, projectId, initiativeId)}
          >
            <T text="Reload" />
          </button>
        )}
        {status === 'canceled' && errorFilePath && (
          <a
            download="Upload report"
            href={errorFilePath}
            className="btn btn-secondary btn-sm notification-action-button"
          >
            <T text="Get report" />
          </a>
        )}
        {status === 'failed' && (
          <a
            target="_errorfile"
            download={errorFileUrl ? translateText('Upload report.txt') : null}
            href={errorFilePath || errorFileUrl}
            className="btn btn-secondary btn-sm notification-action-button"
          >
            <T text="Get report" />
          </a>
        )}
        {(status === 'finished' || status === 'failed' || status === 'canceled') && (
          <button
            type="button"
            className="notification-close-button"
            aria-label={translateText('Close notification')}
            onClick={onRemove}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    );
  }
}

export default UploadItem;
