import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { useMutation } from 'react-apollo-hooks';

import { Form, TextArea } from 'components/form';
import T from 'components/transifex/translate';
import {
  requiredValidation,
} from 'components/form/validations';
import { getGraphQLErrorMessage, translateText } from 'utils/functions';
import sensitiveSpeciesRequest from './sensitive-species-request.graphql';
import './style.scss';

const RequestLocationsModal = ({
  open,
  onClose,
  projectId
}) => {
  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(sensitiveSpeciesRequest);

  const onSubmit = (values) => {
    mutate({
      variables: {
        "sensitiveSpeciesAccessNotificationCreateRequest": {
          ...values,
          projectId
        }
      }
    });
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-req-locations-modal"
      contentLabel={translateText('Request sensitive location data')}
    >
      <div className="content-panel">
        <div className="header">
          <div className="d-flex justify-content-between mb-1">
            <p className="title m-0">Request sensitive location data</p>
            <button type="button" className="close-btn" onClick={onClose}>
              <img alt="" src="/static/ic_cancel_24px.png" />
            </button>
          </div>
          <p className="subtitle m-0">
            Send a message to the project owner to request
            exact locations of sensitive species.
          </p>
        </div>

        {mutationError && (
          <div className="mt-3 alert alert-danger" role="alert">
            {getGraphQLErrorMessage(mutationError)}
          </div>
        )}
        {mutationData && (
          <div className="mt-3 alert alert-info" role="alert">
            <T text="Message has been sent to the project owner(s)." />
          </div>
        )}

        <div className="request-form row">
          <div className="col col-md-12">
            <Form onSubmit={onSubmit} noValidate>
              <Fragment>
                <div className="form-group">
                  <label htmlFor="request-approval-message">
                    Message<span className="required-icon">*</span>
                  </label>
                  <TextArea
                    placeholder="Enter your request for sensitive location data. Please include the reason for your request and the expected end product."
                    field="requestApprovalMessage"
                    id="request-approval-message"
                    className="form-control"
                    rows="7"
                    required
                    maxLength="500"
                    validate={requiredValidation}
                  />
                </div>
                <div className="form-actions">
                  {mutationLoading ? (
                    <button type="submit" className="btn btn-primary" disabled>
                      Sending...
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      Send
                    </button>
                  )}
                </div>
              </Fragment>
            </Form>
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

RequestLocationsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired
};

export default RequestLocationsModal;
