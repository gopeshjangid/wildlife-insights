import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { translateText } from 'utils/functions';
import SignInForm from './sign-in-form';
import './style.scss';

const SignInModal = ({
  open,
  onClose,
}) => {
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-sign-in-modal"
      contentLabel={translateText('Sign in')}
    >
      <div className="content-panel">
        <div className="d-flex justify-content-between">
          <div className="signin-head">Sign in to download data</div>
          <button type="button" className="pointer" onClick={onClose}>
            <img
              className="close-image"
              alt=""
              src="/static/ic_close_14px.png"
            />
          </button>
        </div>
        <SignInForm />
      </div>
    </ReactModal>
  );
};

SignInModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SignInModal;
