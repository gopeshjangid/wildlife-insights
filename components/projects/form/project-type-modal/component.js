import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import './style.scss';

const ProjectTypeModal = ({ open, onClose }) => (
  <ReactModal
    isOpen={open}
    onRequestClose={onClose}
    className="c-project-type-modal"
    contentLabel="Project type modal"
  >
    <div className="content-panel">
      <h3>Project type</h3>
      <div className="mt-15">
        Data about the animals detected by the camera traps can be recorded in one of two ways.
        Once a project type is selected, it cannot be changed.
      </div>
      <div className="mt-15">
        <strong>Image project:</strong> Selecting an Image project means that each record will contain data
          about an individual image, including species identifications, number of animals and
          date/time. The AI model will return the highest confidence result for each image.
      </div>
      <div className="mt-15">
        <strong>Sequence project:</strong> Selecting a Sequence project means that a record will be created for
        each sequence (instead of for each image) and will contain data about the species
        identifications, group size, sequence start time and sequence end time.
        Any identifications applied to a sequence will apply to the group of images.
        Wildlife Insights will automatically group images into sequences if they are
        {'<'}60 seconds apart.
      </div>
      <div className="mt-15">
        The AI model will return the most common result for the sequence.
        Images from sequence projects cannot currently be used to retrain the AI model.
      </div>
    </div>
    <div className="actions-panel">
      <button type="button" className="btn btn-secondary btn-alt" onClick={onClose}>
        Close
      </button>
    </div>
  </ReactModal>
);

ProjectTypeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProjectTypeModal;
