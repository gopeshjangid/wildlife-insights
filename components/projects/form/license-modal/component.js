import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import './style.scss';

const ProjectLicenseModal = ({ open, onClose }) => (
  <ReactModal
    isOpen={open}
    onRequestClose={onClose}
    className="c-project-license-modal"
    contentLabel="Project license modal"
  >
    <div className="content-panel">
      <p>
        <strong>Creative Commons Zero (CC0)</strong> permits a user to share, adapt and modify the
        work, even for commercial purposes, without asking permission.
        <ul>
          <li>
            Summary:{' '}
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/publicdomain/zero/1.0/
            </a>
          </li>
          <li>
            Full legal text:{' '}
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/legalcode"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/publicdomain/zero/1.0/legalcode
            </a>
          </li>
        </ul>
      </p>
      <p>
        <strong>Creative Commons Attribution 4.0 (CC BY 4.0)</strong>, which permits a data user to
        share and adapt material with appropriate attribution, including for commercial purposes.
        <ul>
          <li>
            Summary:{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/licenses/by/4.0/
            </a>
          </li>
          <li>
            Full legal text:{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/legalcode"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/licenses/by/4.0/legalcode
            </a>
          </li>
        </ul>
      </p>
      <p>
        <strong>Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)</strong>, which
        permits a data user to share and adapt material with appropriate attribution, only for
        noncommercial purposes.
        <ul>
          <li>
            Summary:{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/licenses/by-nc/4.0/
            </a>
          </li>
          <li>
            Full legal text:{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/legalcode"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/licenses/by-nc/4.0/legalcode
            </a>
          </li>
        </ul>
      </p>
    </div>
    <div className="actions-panel">
      <button type="button" className="btn btn-secondary btn-alt" onClick={onClose}>
        Close
      </button>
    </div>
  </ReactModal>
);

ProjectLicenseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProjectLicenseModal;
