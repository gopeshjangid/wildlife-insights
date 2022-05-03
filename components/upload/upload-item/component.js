import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes ,faMinus } from '@fortawesome/free-solid-svg-icons';
import PQueue from 'p-queue';
import { chunk, get, remove } from 'lodash';
import axios from 'axios';

import { getAuthApolloClient } from 'lib/initApollo';
import {
  GQL_DEFAULT,
  LOADING,
  SUCCESS,
  FAILED,
  IMAGE_PROJECT
} from 'utils/app-constants';
import { Router } from 'lib/routes';
import { uploadFile, uploadFileOnBucket } from 'lib/axiosRequestHelper';
import { adjustDataFilesSequence } from 'components/upload/helpers';
import {
  exists,
  getGraphQLErrorMessage,
  translateText
} from 'utils/functions';
import ProgressSpinner from 'components/progress-spinner';
import T from 'components/transifex/translate';
import { generateCancelFile, generateErrorFile } from '../helpers';
import getDataFileForIdentifyQuery from './get-data-file.graphql';
import sequenceUpdateQuery from 'utils/shared-gql-queries/adjust-datafiles-for-sequence.graphql';
import getUploadUrlQuery from './get-upload-url.graphql';
import getDataFileUploadStatus from './get-data-file-upload-status.graphql';
import getDataFileNamesList from './get-data-file-names-list.graphql';

import './style.scss';

const RETRY_LIMIT = 2;
const CONCURRENT_CHUNK_SIZE = 6;
const GET_FILE_NAMES_API_CHUNK_SIZE = 2000;

// for cancelling in-flight axios requests
let cancelRequestSource = axios.CancelToken.source();
let cancelReqToken = cancelRequestSource.token;

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
    organizationId: PropTypes.number,
    projectId: PropTypes.number,
    deploymentId: PropTypes.number,
    projectType: PropTypes.string,
    deployment: PropTypes.shape({
      getDeployment: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    onRemove: PropTypes.func.isRequired,
    updateUploadItem: PropTypes.func.isRequired,
    checkAndEnforceNoDuplicates: PropTypes.bool,
    originalPhotosCnt: PropTypes.number,
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
    organizationId: null,
    projectId: null,
    deploymentId: null,
    deployment: {},
    projectType: 'image',
    checkAndEnforceNoDuplicates: true,
    originalPhotosCnt: 0,
  }

  state = {
    errorFileUrl: undefined,
    cancelFileUrl: undefined,
    // only when "checkAndEnforceNoDuplicates" flag is true, handle different states(loading/success/failed) 
    // of "getDataFilesByFileName" api call (before actual image upload).
    getDataFileNamesState: '',
    getDataFileNamesErrMsg: ''
  }

  constructor(props) {
    super(props);

    this.onChangeOnlineStatus = this.onChangeOnlineStatus.bind(this);
    this.shouldWaitForSequenceApiResponse = false;
    // set to true when actual image upload has started
    this.hasUploadStarted = false;
  }

  componentDidMount() {
    const { canUpload } = this.props;

    window.addEventListener('online', this.onChangeOnlineStatus);
    window.addEventListener('offline', this.onChangeOnlineStatus);

    if (canUpload) {
      this.initUpload();
    }
  }

  componentDidUpdate(prevProps) {
    const { canUpload } = this.props;

    if (!prevProps.canUpload && canUpload) {
      this.initUpload();
    }
  }

  initUpload() {
    const {
      checkAndEnforceNoDuplicates,
      deploymentId,
      files,
      updateUploadItem
    } = this.props;
    const { getDataFileNamesState } = this.state;

    // if "checkAndEnforceNoDuplicates" flag is true, handle different 
    // states(loading/success/failed) of "getDataFilesByFileName" api 
    // call (before actual image upload). And update the files list to upload
    if (checkAndEnforceNoDuplicates && getDataFileNamesState === '') {
      this.setState({ getDataFileNamesState: LOADING });
      const client = getAuthApolloClient(GQL_DEFAULT);

      // list of fileNames of the original images that the user 
      // submitted for upload.
      const fileNames = files.map(file => {
        return file.instance.name;
      });

      // to avoid "payload too large" issue with "getDataFilesByFileName" 
      // api, fileNames are first divided into chunks and then a separate 
      // call is executed for each chunk
      const chunkedFileNames = chunk(fileNames, GET_FILE_NAMES_API_CHUNK_SIZE);

      const promises = chunkedFileNames.map(fNamesArr => client.query({
        query: getDataFileNamesList,
        variables: {
          deploymentId,
          fileNameList: fNamesArr
        },
      }));

      Promise.all(promises).then(res => {
        let errorMsg = '';
        const responseIsArray = Array.isArray(res);
        const anyError = responseIsArray && res.some(obj => {
          errorMsg = obj?.errors ? obj : '';
          return obj?.errors;
        });
        if (!responseIsArray || anyError) {
          // handle the error case in success response, as graphql 
          // api may also return errors in success callback.
          updateUploadItem({
            status: 'failed',
            files: []
          });

          this.setState({
            getDataFileNamesState: FAILED,
            getDataFileNamesErrMsg: 'Unable to getDataFileNamesList. '
              + getGraphQLErrorMessage(errorMsg)
          });
        } else {
          // handle success response. there me be a situation where all the 
          // images that the user submitted are already present in the deployment
          let fileNamesThatAlreadyExist = [];

          res.forEach(chunkedRes => {
            const namesExisting = get(
              chunkedRes,
              'data.getDataFilesByFileName.exists'
            );
            if (Array.isArray(namesExisting) && namesExisting.length) {
              fileNamesThatAlreadyExist = [
                ...fileNamesThatAlreadyExist,
                ...namesExisting
              ];
            }
          });

          const filesToUpload = [...files];
          fileNamesThatAlreadyExist.forEach(fileName => {
            // remove files that already exist in the deployment
            remove(filesToUpload, file => {
              return file.instance.name === fileName;
            });
          });

          if (filesToUpload.length) {
            updateUploadItem({
              files: filesToUpload
            });

            this.setState({ getDataFileNamesState: SUCCESS }, () => {
              this.startImageUpload();
            });
          } else {
            updateUploadItem({
              status: 'finished',
              files: filesToUpload
            });
            this.setState({ getDataFileNamesState: SUCCESS });
          }
        }
      }).catch(error => {
        updateUploadItem({
          status: 'failed',
          files: []
        });

        this.setState({
          getDataFileNamesState: FAILED,
          getDataFileNamesErrMsg: 'Unable to getDataFileNamesList. '
            + getGraphQLErrorMessage(error)
        });
      });
    } else {
      this.startImageUpload();
    }
  }

  startImageUpload() {
    const { checkAndEnforceNoDuplicates, projectType } = this.props;
    const { getDataFileNamesState } = this.state;

    if (checkAndEnforceNoDuplicates && getDataFileNamesState !== SUCCESS) {
      return;
    }

    // this is to safe guard against starting upload process again
    if (this.hasUploadStarted) {
      return;
    } else {
      this.hasUploadStarted = true;
    }

    const shouldUploadUsingSignedUrl = projectType === IMAGE_PROJECT
      && (process.env.BACKEND_API_URL === 'https://dev.api.wildlifeinsights.org'
        || process.env.BACKEND_API_URL === 'https://test.api.wildlifeinsights.org');
    if (shouldUploadUsingSignedUrl) {
      this.uploadUsingSignedUrl();
    } else {
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

      // on network disconnect - cancel any in-flight axios requests
      if (cancelRequestSource) {
        cancelRequestSource.cancel('cancelling pending upload requests.');
      }

      // update cancelToken for next axios requests
      cancelRequestSource = axios.CancelToken.source();
      cancelReqToken = cancelRequestSource.token;
    } else if (isOnline && status === 'paused') {
      this.checkAndStartQueue();
      updateUploadItem({ status: 'uploading' });
    }
  }

  onCancel() {
    const {
      files,
      projectId,
      deploymentId,
      updateUploadItem,
      filesUploaded,
      filesErrored,
      filesWithUnknownStatus
    } = this.props;

    const pendingUploads = this.queue.pending;
    const uploadStarted = pendingUploads > 0 || filesUploaded.length > 0
      || filesErrored.length > 0 || filesWithUnknownStatus.length > 0;

    this.queue.clear();

    if (uploadStarted) {
      if (pendingUploads > 0) {
        updateUploadItem({ status: 'canceling' });
      } else {
        const fileUrl = generateCancelFile(
          projectId,
          deploymentId,
          files.length,
          filesUploaded,
          filesErrored,
          filesWithUnknownStatus
        );
        this.setState({ cancelFileUrl: fileUrl });
        updateUploadItem({ status: 'canceled' });
      }
    } else {
      updateUploadItem({ status: 'canceled' });
    }
  }

  onClickIdentify = (organizationId, projectId) => {
    const { onRemove } = this.props;

    // Removing upload item when user clicks on identify button
    onRemove();

    Router.pushRoute('projects_show', {
      tab: 'identify',
      organizationId,
      projectId,
      'upload-complete': true,
    });
  }

  getAccessToken = () => {
    const { token } = this.props;
    return token;
  }

  checkAndStartQueue = () => {
    const isOnline = navigator.onLine;
    const { projectType } = this.props;
    const isSequenceProject = projectType === 'sequence';

    if (isOnline) {
      if (isSequenceProject) {
        if (!this.shouldWaitForSequenceApiResponse) {
          this.queue.start();
        }
      } else {
        this.queue.start();
      }
    }
  }

  upload() {
    const {
      files,
      projectId,
      deploymentId,
      updateUploadItem,
      projectType
    } = this.props;
    const client = getAuthApolloClient(GQL_DEFAULT);

    // We'll execute the uploads 6 at a time
    this.queue = new PQueue({ concurrency: CONCURRENT_CHUNK_SIZE, autoStart: false });

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
     * Dictionary of the names of the files to try to re-upload once
     * because they've failed the first time. Keys are fileName and 
     * value is number of retries executed
     */
    const filesToRetry = {};

    // for sequence project images only - to update sequenceIds, an extra api call for 
    // adjustDataFilesSequence is executed when CONCURRENT_CHUNK_SIZE images have 
    // been uploaded. and concurrentImgCounter is reset to 0 again.
    const isSequenceProject = projectType === 'sequence';
    let concurrentImgCounter = 0;

    const getPromise = async (file) => {
      return new Promise((resolve, reject) => {
        // The offline and online events are delayed on Chrome and Safari for about 1s
        // The timeout prevents many photos from trying to upload during the lapse of time between
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
      }).then(() => {
        if (isSequenceProject && concurrentImgCounter >= CONCURRENT_CHUNK_SIZE) {
          this.queue.pause();
          concurrentImgCounter = 0;
          this.shouldWaitForSequenceApiResponse = true;

          // api call to adjust dataFiles for sequence
          return adjustDataFilesSequence(
            sequenceUpdateQuery,
            { projectId, deploymentId }
          ).then(() => {
            this.shouldWaitForSequenceApiResponse = false;
            this.checkAndStartQueue();
            return Promise.resolve();
          }).catch(() => {
            this.shouldWaitForSequenceApiResponse = false;
            this.checkAndStartQueue();
            return Promise.resolve();
          });
        } else {
          return Promise.resolve();
        }
      }).then(() => {
        // Before uploading the file, first check if it has been tried previously.
        // If it is being uploaded for the first time, then go ahead with upload. 
        // Else first check if it already exists in the deployment. If it exists, then 
        // call the next "then" handler with customStatus to indicate to not upload it 
        // again. Otherwise retry the file upload again.
        if (!exists(filesToRetry[file.instance.name])) {
          return Promise.resolve();
        } else {
          return client.query({
            query: getDataFileForIdentifyQuery,
            variables: {
              filters: {
                'fileName': file.instance.name,
                'deploymentIds': [deploymentId]
              }
            },
          }).then((response) => {
            const fileName = get(
              response,
              'data.getDataFilesForIdentify.data[0].data[0].filename'
            );

            if (fileName === file.instance.name) {
              return Promise.resolve({ customStatus: 'exists' });
            } else {
              return Promise.resolve();
            }
          });
        }
        // @ts-ignore
      }).then((response) => {
        if (response && response?.customStatus === 'exists') {
          return Promise.resolve();
        } else {
          // check if current cancelReqToken is already cancelled (has 
          // 'reason' key). if yes, then with that token axios request 
          // will not work. so update cancelReqToken for next request
          if (cancelReqToken?.reason) {
            cancelRequestSource = axios.CancelToken.source();
            cancelReqToken = cancelRequestSource.token;
          }

          return uploadFile({
            authToken: this.getAccessToken(),
            deploymentId,
            file,
            projectId,
            cancelToken: cancelReqToken
          });
        }
      }).then(() => {
        concurrentImgCounter++;
        filesUploaded.push(file.instance.name);
        updateUploadItem({ filesUploaded });
      })
        .catch((error) => {
          if (!error) {
            // This case only happen if the upload was paused but the queue still triggered the next
            // wave of uploads
            // In that case, we just push back the files to the queue, with the same priority
            this.queue.add(() => getPromise(file), { priority: 0 });
          } else if (error && error?.response) {
            // The server rejected the file
            // If the upload for this file hasn't been retried once, we do it
            const fileRetriedCount = filesToRetry[file.instance.name] || 0;
            if (fileRetriedCount < RETRY_LIMIT) {
              filesToRetry[file.instance.name] = fileRetriedCount + 1;
              this.queue.add(() => getPromise(file), { priority: 0 });
            } else {
              filesErrored.push(file.instance.name);
              updateUploadItem({ filesErrored });
            }
          } else {
            // The most likely reason to end up here is that we lost the connection
            // The front-end has no way to know the status of the file without using unique IDs so
            // we'll tag the file as having an unknown status
            const fileRetriedCount = filesToRetry[file.instance.name] || 0;
            if (fileRetriedCount < RETRY_LIMIT) {
              filesToRetry[file.instance.name] = fileRetriedCount + 1;
              this.queue.add(() => getPromise(file), { priority: 0 });
            } else {
              filesWithUnknownStatus.push(file.instance.name);
              updateUploadItem({ filesWithUnknownStatus });
            }
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
      const { status } = this.props;

      if (status === 'canceling') {
        const fileUrl = generateCancelFile(
          projectId,
          deploymentId,
          files.length,
          filesUploaded,
          filesErrored,
          filesWithUnknownStatus
        );
        this.setState({ cancelFileUrl: fileUrl });

        updateUploadItem({ status: 'canceled' });
      } else if (!filesErrored.length && !filesWithUnknownStatus.length) {
        updateUploadItem({ status: 'finished' });
      } else {
        const fileUrl = generateErrorFile(
          projectId,
          deploymentId,
          files.length,
          filesUploaded,
          filesErrored,
          filesWithUnknownStatus
        );
        this.setState({ errorFileUrl: fileUrl });
        updateUploadItem({ status: 'failed' });
      }

      if (isSequenceProject && concurrentImgCounter > 0) {
        concurrentImgCounter = 0;
        // api call to adjust dataFiles for sequence
        adjustDataFilesSequence(sequenceUpdateQuery, { projectId, deploymentId });
      }
    });
  }

  uploadUsingSignedUrl() {
    const {
      files,
      projectId,
      deploymentId,
      updateUploadItem,
      projectType
    } = this.props;
    const client = getAuthApolloClient(GQL_DEFAULT);

    // We'll execute the uploads 6 at a time
    this.queue = new PQueue({ concurrency: CONCURRENT_CHUNK_SIZE, autoStart: false });

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
     * Dictionary of the names of the files to try to re-upload once
     * because they've failed the first time. Keys are fileName and 
     * value is number of retries executed
     */
    const filesToRetry = {};
    const filesUploadData = {};

    // for sequence project images only - to update sequenceIds, an extra api call for 
    // adjustDataFilesSequence is executed when CONCURRENT_CHUNK_SIZE images have 
    // been uploaded. and concurrentImgCounter is reset to 0 again.
    const isSequenceProject = projectType === 'sequence';
    let concurrentImgCounter = 0;

    const getPromise = async (file) => {
      return new Promise((resolve, reject) => {
        // The offline and online events are delayed on Chrome and Safari for about 1s
        // The timeout prevents many photos from trying to upload during the lapse of time between
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
      }).then(() => {
        if (isSequenceProject && concurrentImgCounter >= CONCURRENT_CHUNK_SIZE) {
          this.queue.pause();
          concurrentImgCounter = 0;
          this.shouldWaitForSequenceApiResponse = true;

          // api call to adjust dataFiles for sequence
          return adjustDataFilesSequence(
            sequenceUpdateQuery,
            { projectId, deploymentId }
          ).then(() => {
            this.shouldWaitForSequenceApiResponse = false;
            this.checkAndStartQueue();
            return Promise.resolve();
          }).catch(() => {
            this.shouldWaitForSequenceApiResponse = false;
            this.checkAndStartQueue();
            return Promise.resolve();
          });
        } else {
          return Promise.resolve();
        }
      }).then(() => {
        // Before uploading the file, first check if it has been tried previously.
        // If it is being uploaded for the first time, then go ahead with upload. 
        // Else first check if it already exists in the deployment. If it exists, then 
        // call the next "then" handler with customStatus to indicate to not upload it 
        // again. Otherwise retry the file upload again.
        if (!exists(filesToRetry[file.instance.name])) {
          return Promise.resolve();
        } else {
          const idToCheck = get(filesUploadData[file.instance.name], 'id');

          if (idToCheck) {
            return client.query({
              query: getDataFileUploadStatus,
              variables: {
                "projectId": +projectId,
                "deploymentId": +deploymentId,
                "id": idToCheck
              },
            }).then((response) => {
              const fileStatus = get(
                response,
                'data.checkUploadStatus'
              );

              if (fileStatus) {
                return Promise.resolve({ customStatus: 'exists' });
              } else {
                return Promise.resolve();
              }
            });
          } else {
            return Promise.resolve();
          }
        }
        // @ts-ignore
      }).then((response) => {
        if (response && response?.customStatus === 'exists') {
          return Promise.resolve();
        } else {
          // return uploadFile({ authToken: token, deploymentId, file, projectId })
          const uploadUrl = get(filesUploadData[file.instance.name], 'url');

          if (uploadUrl) {
            // check if current cancelReqToken is already cancelled (has 
            // 'reason' key). if yes, then with that token axios request 
            // will not work. so update cancelReqToken for next request
            if (cancelReqToken?.reason) {
              cancelRequestSource = axios.CancelToken.source();
              cancelReqToken = cancelRequestSource.token;
            }
            return uploadFileOnBucket({
              url: uploadUrl,
              file,
              cancelToken: cancelReqToken
            });
          } else {
            return client.query({
              query: getUploadUrlQuery,
              variables: {
                projectId: projectId,
                deploymentId: deploymentId,
                fileName: file.instance.name,
                contentType: file.type
              },
            }).then((response) => {
              const id = response?.data?.getUploadUrl?.id;
              const url = response?.data?.getUploadUrl?.mainUrl;

              filesUploadData[file.instance.name] = {
                id,
                url
              };

              // check if current cancelReqToken is already cancelled (has 
              // 'reason' key). if yes, then with that token axios request 
              // will not work. so update cancelReqToken for next request
              if (cancelReqToken?.reason) {
                cancelRequestSource = axios.CancelToken.source();
                cancelReqToken = cancelRequestSource.token;
              }

              return uploadFileOnBucket({
                url,
                file,
                cancelToken: cancelReqToken
              });
            });
          }
        }
      }).then(() => {
        concurrentImgCounter++;
        filesUploaded.push(file.instance.name);
        updateUploadItem({ filesUploaded });
      })
        .catch((error) => {
          if (!error) {
            // This case only happen if the upload was paused but the queue still triggered the next
            // wave of uploads
            // In that case, we just push back the files to the queue, with the same priority
            this.queue.add(() => getPromise(file), { priority: 0 });
          } else if (error && error?.response) {
            // The server rejected the file
            // If the upload for this file hasn't been retried once, we do it
            const fileRetriedCount = filesToRetry[file.instance.name] || 0;
            if (fileRetriedCount < RETRY_LIMIT) {
              filesToRetry[file.instance.name] = fileRetriedCount + 1;
              this.queue.add(() => getPromise(file), { priority: 0 });
            } else {
              filesErrored.push(file.instance.name);
              updateUploadItem({ filesErrored });
            }
          } else {
            // The most likely reason to end up here is that we lost the connection
            // The front-end has no way to know the status of the file without using unique IDs so
            // we'll tag the file as having an unknown status
            const fileRetriedCount = filesToRetry[file.instance.name] || 0;
            if (fileRetriedCount < RETRY_LIMIT) {
              filesToRetry[file.instance.name] = fileRetriedCount + 1;
              this.queue.add(() => getPromise(file), { priority: 0 });
            } else {
              filesWithUnknownStatus.push(file.instance.name);
              updateUploadItem({ filesWithUnknownStatus });
            }
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
      const { status } = this.props;

      if (status === 'canceling') {
        const fileUrl = generateCancelFile(
          projectId,
          deploymentId,
          files.length,
          filesUploaded,
          filesErrored,
          filesWithUnknownStatus
        );
        this.setState({ cancelFileUrl: fileUrl });

        updateUploadItem({ status: 'canceled' });
      } else if (!filesErrored.length && !filesWithUnknownStatus.length) {
        updateUploadItem({ status: 'finished' });
      } else {
        const fileUrl = generateErrorFile(
          projectId,
          deploymentId,
          files.length,
          filesUploaded,
          filesErrored,
          filesWithUnknownStatus
        );
        this.setState({ errorFileUrl: fileUrl });
        updateUploadItem({ status: 'failed' });
      }

      if (isSequenceProject && concurrentImgCounter > 0) {
        concurrentImgCounter = 0;
        // api call to adjust dataFiles for sequence
        adjustDataFilesSequence(sequenceUpdateQuery, { projectId, deploymentId });
      }

      let forLoggingData = {};
      Object.keys(filesUploadData).forEach(fileId => {
        if (filesToRetry[fileId]) {
          forLoggingData[fileId] = {
            retryCount: filesToRetry[fileId],
            id: filesUploadData[fileId].id
          }
        }
      });
      console.log('00 in UploadComponent forLoggingData ---------------- #################3');
      console.log(JSON.stringify(forLoggingData));
    });
  }

  renderGetDataFileNamesState = () => {
    // render various states (loading/success/failed) of "getDataFilesByFileName" 
    // api call (before actual image upload).
    const { files, originalPhotosCnt, onRemove } = this.props;
    const { getDataFileNamesState, getDataFileNamesErrMsg } = this.state;
    const isErrored = getDataFileNamesState === FAILED;

    let titleParams = {};
    let title = 'Upload in waiting ({originalPhotosCnt} photo(s))';
    titleParams = { originalPhotosCnt };
    let msg = 'Please wait...';

    if (isErrored) {
      title = 'Error while getting list of file names!';
      titleParams = {};
      msg = getDataFileNamesErrMsg;
    } else if (!files.length) {
      title = 'Upload complete!';
      titleParams = {};
      msg = 'Files you selected already exist in the deployment.';
    }

    return (
      <div className="c-upload-item">
        <div className="notification-title">
          <span className={isErrored ? "text-danger" : ""}>
            <T text={title} params={titleParams} />
          </span>
        </div>
        <div className="notification-message notification-action">
          <T text={msg} />
        </div>
        {
          getDataFileNamesState !== LOADING && (
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

  render() {
    const {
      errorFileUrl,
      cancelFileUrl,
      getDataFileNamesState
    } = this.state;
    const {
      files,
      checkAndEnforceNoDuplicates,
      filesUploaded,
      filesErrored,
      filesWithUnknownStatus,
      progress,
      status,
      organizationId,
      projectId,
      deployment,
      onRemove,
    } = this.props;

    const deploymentName = get(deployment, 'getDeployment.deploymentName') || 'Deployment';
    const projectShortName = get(deployment, 'getDeployment.project.shortName') || 'Project';

    if (checkAndEnforceNoDuplicates && (getDataFileNamesState !== SUCCESS
      || !files.length)) {
      return this.renderGetDataFileNamesState();
    }

    return (
      <div className="c-upload-item">
        <button
            type="button"
            className="notification-hide-button"
            aria-label={translateText('Close notification')}
            onClick={onRemove}
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
        <div className="notification-title">
          {status === 'created' && (
            <T text="Upload in waiting ({total} photo(s))" params={{ total: files.length }} />
          )}
          {status === 'uploading' && (
            <T
              text="Uploading: {uploaded} of {total} ({progress}%)"
              params={{
                uploaded: filesUploaded.length + filesErrored.length
                  + filesWithUnknownStatus.length,
                total: files.length,
                progress,
              }}
            />
          )}
          {status === 'paused' && (
            <T text="Upload paused!" />
          )}
          {status === 'finished' && <T text="Upload complete!" />}
          {status === 'canceling' && <T text="Canceling upload..." />}
          {status === 'canceled' && <T text="Upload canceled!" />}
          {status === 'failed' && (
            <span className="text-danger">
              <T text="Upload failed!" />
            </span>
          )}
        </div>
        <div className="notification-message notification-action">
          {status !== 'failed' && status !== 'canceling' && status !== 'canceled'
            && status !== 'paused' && (
              <T
                text="{projectShortName} - {deploymentName}"
                params={{
                  projectShortName,
                  deploymentName,
                }}
              />
            )}
          {status === 'paused' && (
            <T
              text="The internet connection has been lost. Please reconnect to resume the upload."
            />
          )}
          {status === 'canceling' && (
            <T text="Some photos are still being processed by the server." />
          )}
          {status === 'canceled' && (
            <span>
              {!filesUploaded.length && <T text="None of the photos were uploaded." />}
              {!!filesUploaded.length && !filesWithUnknownStatus.length && (
                <T
                  text="{uploaded} photo(s) were uploaded before you canceled."
                  params={{ uploaded: filesUploaded.length }}
                />
              )}
              {!!filesUploaded.length && !!filesWithUnknownStatus.length && (
                <T
                  text="Between {uploaded} and {total} photo(s) were uploaded before you canceled."
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
                text="{errored}/{total} photo(s) failed to upload or are in an unknown state. Please reupload."
                params={{
                  errored: filesErrored.length + filesWithUnknownStatus.length,
                  total: files.length
                }}
              />
              <br />
              <T text="Download the report." />
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
            onClick={() => this.onClickIdentify(organizationId, projectId)}
          >
            <T text="Identify" />
          </button>
        )}
        {status === 'canceled' && cancelFileUrl && (
          <a
            download="Upload report"
            href={cancelFileUrl}
            className="btn btn-secondary btn-sm notification-action-button"
          >
            <T text="Get report" />
          </a>
        )}
        {status === 'failed' && errorFileUrl && (
          <a
            download={translateText('Upload report')}
            href={errorFileUrl}
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
