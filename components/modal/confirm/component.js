import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { translateText, getGraphQLErrorMessage } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import './style.scss';

const ConfirmModal = ({
  open,
  onClose,
  fnConfirm,
  contentLabel,
  mutationLoading,
  mutationError,
  confirmationText,
  mutationData,
  successMessage,
  headerLabel,
}) => {
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-confirm-modal"
      contentLabel={translateText(contentLabel)}
      ariaHideApp={false}
    >
      <div className="content-panel">
        <h2>{headerLabel}</h2>
        {mutationLoading && (
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        )}
        {!mutationData && !mutationLoading && (
          <Fragment>
            {mutationError && (
              <div className="alert alert-danger" role="alert">
                <T text={getGraphQLErrorMessage(mutationError)} />
              </div>
            )}
            <p>
              <T text={confirmationText} />
            </p>
            <div className="actions-panel">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={fnConfirm}
              >
                {translateText('Yes')}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
              >
                {translateText('No')}
              </button>
            </div>
          </Fragment>
        )}

        {mutationData && (
          <Fragment>
            <div className="alert alert-info" role="alert">
              <T text={successMessage} />
            </div>
            <div className="actions-panel">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
              >
                {translateText('Close')}
              </button>
            </div>
          </Fragment>
        )}
      </div>
    </ReactModal>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  fnConfirm: PropTypes.func,
  contentLabel: PropTypes.string,
  mutationLoading: PropTypes.bool,
  mutationError: PropTypes.oneOfType([PropTypes.object]),
  mutationData: PropTypes.oneOfType([PropTypes.object]),
  confirmationText: PropTypes.string,
  successMessage: PropTypes.string,
  headerLabel: PropTypes.string,
};

ConfirmModal.defaultProps = {
  onClose: () => { },
  contentLabel: 'Confirm Modal',
  fnConfirm: () => { },
  mutationLoading: false,
  mutationError: undefined,
  confirmationText: 'Are you sure?',
  mutationData: undefined,
  successMessage: '',
  headerLabel: 'Confirm',
};

export default ConfirmModal;
