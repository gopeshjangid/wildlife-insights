import React, {
  Fragment,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { forEach } from 'lodash';
import Dropzone from 'react-dropzone';
import ReactModal from 'react-modal';
import { translateText } from 'utils/functions';
import { createUploadHelper } from 'components/deployments/list/helpers';
import './style.scss';

const DeploymentUploadModal = ({
  projectId,
  organizationId,
  initiativeId,
  open,
  onClose,
  onUpload,
  displayError,
}) => {
  const [fileValue, setFileValue] = useState([]);
  const onSubmit = () => {
    forEach(fileValue, (row, index) => {
      fileValue[index].instance = row;
    });
    const newUpload = createUploadHelper({
      files: fileValue,
      organizationId,
      projectId,
      initiativeId,
    });
    onUpload(newUpload);
    setFileValue([]);
    onClose();
  };

  const closeModal = () => {
    onClose();
  };

  const onDropRejected = () => {
    displayError({
      title: translateText('Unable to process the file'),
      message: translateText('Selecte files are not supported or bigger than 10MB.'),
    });
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={closeModal}
      className="c-deployment-modal"
      contentLabel={translateText('Camera deployment form')}
    >
      <Fragment>
        <div className="content-panel">
          <h2>Bulk upload deployments to your project</h2>
          <div>
            Quickly create multiple new deployments in your project by uploading a CSV <br />
            file with the required information for each deployment.
            <div className="mt-1">Please note that once a deployment is created you may not delete it after 2 weeks.</div>
            <br />
            <div><b>Not sure where to begin?</b></div>
            <ul>
              <li>Download an empty <a rel="noopener noreferrer" target="_blank" href="https://drive.google.com/file/d/1NN4mfwJ92j-yFnJG0GY0DzCIFa2mX6kS/view" className="link">deployments CSV template</a></li>
              <li>
                Visit the Wildlife Insights <a rel="noopener noreferrer" target="_blank" href="https://docs.google.com/spreadsheets/d/1iEcHs0Y49W5hx7aoMSFge_1-Q_VfMdl8d56x27heuNY/edit#gid=0" className="link">bulk upload data dictionary</a> to learn more
                about required fields, accepted values, default values and formatting
                guidance.
              </li>
            </ul>
          </div>
          <div className="d-flex">
            <Dropzone
              accept={['.csv, text/csv, application/csv, text/x-csv, application/x-csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].join(',')}
              onDrop={(value) => {
                setFileValue(value)
              }}
              onDropRejected={onDropRejected}
              className="dropzone-panel"
              multiple={false}
            >
              Attach CSV
            </Dropzone>
            {fileValue
              && (
                <div className="filename">
                    {fileValue[0]?.name}
                </div>
              )
            }
          </div>
        </div>
        <div className="actions-panel">
          <button
            type="button"
            className="btn btn-secondary btn-alt"
            onClick={closeModal}
          >
            {translateText('Cancel')}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="btn btn-primary btn-alt"
            disabled={fileValue.length === 0}
          >
            {translateText('Upload')}
          </button>
        </div>
      </Fragment>
    </ReactModal>
  );
};

DeploymentUploadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  projectId: PropTypes.number.isRequired,
  organizationId: PropTypes.number.isRequired,
  initiativeId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onUpload: PropTypes.func,
  displayError: PropTypes.func.isRequired,
};

DeploymentUploadModal.defaultProps = {
  onClose: () => {},
  onUpload: () => {},
};

export default DeploymentUploadModal;
