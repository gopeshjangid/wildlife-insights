import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Mutation } from 'react-apollo';
import classnames from 'classnames';

import { getGraphQLErrorMessage, translateText } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import { Form, Text, TextArea, DatePicker } from 'components/form';
import {
  requiredValidation,
  urlValidation,
  numberValidation,
} from 'components/form/validations';
import { getMutationData } from './helpers';

import createDeviceQuery from './create-device.graphql';
import updateDeviceQuery from './update-device.graphql';

import './style.scss';

class DeviceModal extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    organizationId: PropTypes.number.isRequired,
    id: PropTypes.number,
    data: PropTypes.shape({
      getDevice: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    isCreating: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onSaved: PropTypes.func,
    canEdit: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    id: null,
    data: { getDevice: null, loading: false, error: null },
    onClose: () => { },
    onSaved: () => { },
  };

  onSubmit(values, mutate) {
    const { organizationId, id, onSaved } = this.props;

    const body = getMutationData(values);
    mutate({
      variables: { organizationId, id, body }
    }).then(res => {
      if (!res.errors) {
        onSaved(res);
      }
    });
  }

  render() {
    const {
      open,
      data: { getDevice: device, loading, error },
      isCreating,
      onClose,
      canEdit,
    } = this.props;

    return (
      <ReactModal
        isOpen={open}
        onRequestClose={onClose}
        className="c-device-modal"
        contentLabel={translateText('Camera form')}
      >
        {loading && !device && (
          <div className="content-panel">
            <div className="text-center">
              <LoadingSpinner inline />
            </div>
          </div>
        )}
        {(!loading || device) && (
          <Mutation
            mutation={isCreating ? createDeviceQuery : updateDeviceQuery}
            refetchQueries={['getDevices']}
          >
            {(
              mutate,
              {
                loading: mutationLoading,
                error: mutationError,
                data: mutationData,
              }
            ) => {
              const errorMessage = getGraphQLErrorMessage(mutationError);

              return (
                <Form
                  onSubmit={values => this.onSubmit(values, mutate)}
                  initialValues={isCreating ? {} : device}
                  noValidate
                >
                  <div className="content-panel">
                    {mutationError && (
                      <div className="alert alert-danger" role="alert">
                        {isCreating && (
                          <T text="Unable to create the camera." />
                        )}
                        {!isCreating && (
                          <T text="Unable to update the camera." />
                        )}{' '}
                        {translateText(
                          errorMessage || 'Please try again in a few minutes.'
                        )}
                      </div>
                    )}
                    {!mutationError && mutationData && (
                      <div className="alert alert-info" role="alert">
                        {isCreating && (
                          <T text="The camera has been created." />
                        )}
                        {!isCreating && (
                          <T text="The camera has been updated." />
                        )}
                      </div>
                    )}
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        <T text="Unable to load the camera. Please try again in a few minutes." />
                      </div>
                    )}
                    <div className="form-row">
                      <div
                        className={classnames({
                          'col-sm-12': true,
                          'col-md-6': !isCreating,
                        })}
                      >
                        <div className="form-group">
                          <label htmlFor="device-name">
                            <T text="Camera name" />{' '}
                            <span className="required-icon">*</span>:
                          </label>
                          <Text
                            type="text"
                            field="name"
                            id="device-name"
                            className="form-control"
                            maxLength="255"
                            required
                            validate={requiredValidation}
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                      {!isCreating && (
                        <div className="col-sm-12 col-md-6">
                          <div className="form-group">
                            <label htmlFor="device-id">
                              <T text="ID" />:
                            </label>
                            <Text
                              type="text"
                              field="id"
                              id="device-id"
                              className="form-control"
                              disabled
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="device-make">
                            <T text="Make" />:
                          </label>
                          <Text
                            type="text"
                            field="make"
                            id="device-make"
                            className="form-control"
                            maxLength="255"
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="device-model">
                            <T text="Model" />:
                          </label>
                          <Text
                            type="text"
                            field="model"
                            id="device-model"
                            className="form-control"
                            maxLength="255"
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="device-serial-number">
                            <T text="Serial number" />:
                          </label>
                          <Text
                            type="text"
                            field="serialNumber"
                            id="device-serial-number"
                            className="form-control"
                            maxLength="255"
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="device-date">
                            <T text="Purchase date" />:
                          </label>
                          <DatePicker
                            field="purchaseDate"
                            id="device-date"
                            className="form-control"
                            before={new Date()}
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="device-price">
                            <T text="Purchase price" />:
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">$</span>
                            </div>
                            <Text
                              type="number"
                              min={0}
                              step={0.01}
                              field="purchasePrice"
                              id="device-price"
                              className="form-control"
                              aria-describedby="device-price-help"
                              validate={numberValidation(0)}
                              disabled={!isCreating && !canEdit}
                            />
                          </div>
                          <small
                            id="device-price-help"
                            className="form-text text-muted"
                          >
                            <T text="Equivalent in US dollars." />
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12">
                        <div className="form-group">
                          <label htmlFor="device-url">
                            <T text="Product URL" />:
                          </label>
                          <Text
                            type="url"
                            field="productUrl"
                            id="device-url"
                            className="form-control"
                            maxLength="255"
                            validate={urlValidation}
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12">
                        <div className="form-group">
                          <label htmlFor="device-remarks">
                            <T text="Remarks" />:
                          </label>
                          <TextArea
                            field="remarks"
                            id="device-remarks"
                            className="form-control"
                            maxLength="255"
                            disabled={!isCreating && !canEdit}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="actions-panel">
                    <button
                      type="button"
                      className="btn btn-secondary btn-alt"
                      onClick={onClose}
                    >
                      {translateText(canEdit ? 'Cancel' : 'Close')}
                    </button>
                    {canEdit && (
                      <button
                        type="submit"
                        className="btn btn-primary btn-alt"
                        disabled={mutationLoading}
                      >
                        {
                          mutationLoading ? translateText(isCreating ? 'Creating...' : 'Updating...')
                            : translateText(isCreating ? 'Create' : 'Save changes')
                        }
                      </button>
                    )}
                  </div>
                </Form>
              );
            }}
          </Mutation>
        )}
      </ReactModal>
    );
  }
}

export default DeviceModal;
