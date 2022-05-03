import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { useMutation } from 'react-apollo-hooks';

import { Form, Text, TextArea } from 'components/form';
import T from 'components/transifex/translate';
import {
  requiredValidation,
} from 'components/form/validations';
import { getGraphQLErrorMessage, translateText } from 'utils/functions';
import dataProviderRequest from './data-provider-request.graphql';
import './style.scss';

const ContactModal = ({
  open,
  onClose,
  projectId
}) => {
  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(dataProviderRequest);

  const onSubmit = (values) => {
    mutate({
      variables: {
        "dataProviderNotificationsCreateRequest": {
          ...values,
          projectId
        }
      }
    })
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-contact-modal"
      contentLabel={translateText('Contact data provider')}
    >
      <div className="content-panel">
        <div className="header">
          <div className="d-flex justify-content-between mb-1">
            <p className="title m-0">Contact data provider</p>
            <button type="button" className="close-btn" onClick={onClose}>
              <img alt="" src="/static/ic_cancel_24px.png" />
            </button>
          </div>
          <p className="subtitle m-0">Send a message to the project owner(s).</p>
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

        <div className="contact-form row">
          <div className="col col-md-12">
            <Form onSubmit={onSubmit} noValidate>
              {() => (
                <Fragment>
                  <div className="form-group">
                    <label htmlFor="email-subject">
                      Email subject<span className="required-icon">*</span>
                    </label>
                    <Text
                      type="text"
                      placeholder="Email subject line"
                      field="emailSubject"
                      id="email-subject"
                      className="form-control"
                      required
                      maxLength="100"
                      validate={requiredValidation}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email-message">
                      Message<span className="required-icon">*</span>
                    </label>
                    <TextArea
                      placeholder="Enter your message"
                      field="emailMessage"
                      id="email-message"
                      className="form-control"
                      rows="7"
                      required
                      maxLength="1000"
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
              )}
            </Form>
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

ContactModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired
};

export default ContactModal;
