// @ts-nocheck
import React, {
  Fragment,
  useState
} from 'react';
import PropTypes from 'prop-types';

import { exists, translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import Text from 'components/form/text';
import { numberValidation, requiredValidation, validateStartDate } from 'components/form/validations';
import { useQuery } from 'react-apollo-hooks';
import DatePicker from 'components/form/datepicker';
import { TextArea, Select, } from 'components/form';
import classnames from 'classnames';
import {
  SENSOR_FAILURE_DETAILS_OPTIONS, FEATURE_TYPE_OPTIONS, SENSOR_ORIENTATION_OPTIONS,
  SENSOR_HEIGHT_OPTIONS, BAIT_TYPE_OPTIONS
} from './constant';
import projectQuery from './getProject.graphql';
import Tooltip from 'components/tooltip';
import SubprojectSelectField from 'components/upload/form/deployment-create-field/subproject-select-field';
import DeviceSelectField from 'components/upload/form/deployment-create-field/device-select-field';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { get, isEmpty } from 'lodash';

const DeploymentField = ({
  formState,
  formApi,
  onChange,
  organizationId,
  projectId,
  isCreating,
  canCreateDeviceForProject,
}) => {
  const [isCreatingCamera, setCreatingCamera] = useState(false);

  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useQuery(projectQuery, {
    skip: !exists(organizationId),
    variables: {
      organizationId: +organizationId,
      id: projectId,
    },
  });

  const baitUse = get(projectData, 'getProject.metadata.project_bait_use', '');
  let baitType = '';
  if (baitUse === 'Yes') {
    baitType = get(projectData, 'getProject.metadata.project_bait_type', '');
    let baitTypeValue = get(formState, 'values.baitTypeOption', '');
    if (isEmpty(baitTypeValue)) {
      baitTypeValue = BAIT_TYPE_OPTIONS.find(d => d.label.includes(baitType));
      if (baitTypeValue) {
        formApi.setValues({
          ...formState.values,
          baitTypeOption: {
            label: baitTypeValue.label,
            value: baitTypeValue.value,
          },
        });
      }
    }
  } else {
    let baitTypeValue1 = get(formState, 'values.baitTypeOption', '');
    if (isEmpty(baitTypeValue1)) {
      baitTypeValue1 = BAIT_TYPE_OPTIONS.find(d => d.label.includes('None'));
      if (baitTypeValue1) {
        formApi.setValues({
          ...formState.values,
          baitTypeOption: {
            label: baitTypeValue1.label,
            value: baitTypeValue1.value,
          },
        });
      }
    }
  }

  const renderCamareFaliure = () => (
    <div>
      <div className="form-group">
        <label htmlFor="deployment-sensor-failure-details">
          <T text="Is your camera functioning or has it failed?" />{' '}
          <span className="required-icon">*</span>:
        </label>
        <Select
          type="text"
          field="sensorFailureOption"
          id="deployment-sensor-failure-details"
          placeholder={translateText('Select a status')}
          isClearable
          options={SENSOR_FAILURE_DETAILS_OPTIONS}
          required
          validate={requiredValidation}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="form-row">
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="upload-image-start-date">
              <T text="Start date" /><span className="required-icon">*</span>:
            </label>
            <DatePicker
              className="form-control"
              id="upload-image-start-date"
              field="deploymentStartDate"
              before={formState.values.deploymentEndDate}
              required
              validate={value => requiredValidation(value) || validateStartDate(value, formState.values.deploymentEndDate)}
              onValueChange={value => onChange('deploymentStartDate', value)}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="upload-image-end-date">
              <T text="End date" /><span className="required-icon">*</span>:
            </label>
            <DatePicker
              className="form-control"
              id="upload-image-end-date"
              field="deploymentEndDate"
              after={formState.values.deploymentStartDate}
              required
              validate={requiredValidation}
              onValueChange={value => onChange('deploymentEndDate', value)}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="upload-image-deployment-name">
              <T text="Camera Deployment name" /><span className="required-icon">*</span>:
            </label>
            <Text
              className="form-control"
              field="deploymentName"
              id="upload-image-deployment-name"
              placeholder={translateText('Type a name')}
              type="text"
              validate={requiredValidation}
              onValueChange={value => onChange('deploymentName', value)}
            />
          </div>
        </div>

        <div className="col-sm-12 col-md-6">
          <div className="form-group">
            <label htmlFor="deployment-feature-types">
              <T text="Feature types" />{' '}
              <span className="required-icon">*</span>:
            </label>
            <Select
              isMulti
              type="text"
              field="featureTypeOptions"
              id="deployment-feature-types"
              placeholder={translateText('Select feature types')}
              isClearable
              options={FEATURE_TYPE_OPTIONS}
              aria-describedby="deployment-feature-types-help"
              required
              validate={requiredValidation}
            />
            <small
              id="deployment-feature-types-help"
              className="form-text text-muted"
            >
              <T text="Types of feature that the camera deployment is associated with." />
            </small>
          </div>
        </div>
        <div className="col-sm-12 col-md-6">
          <div className="form-group">
            <label htmlFor="deployement-feature-type-methodology">
              <T text="Feature type methodology" />:
            </label>
            <Text
              type="text"
              field="featureTypeMethodology"
              id="deployement-feature-type-methodology"
              className="form-control"
              maxLength="255"
            />
          </div>
        </div>
      </div>

      {isCreating && canCreateDeviceForProject
        && (
          <Fragment>
            {!isCreatingCamera
              && (
                <div className="row">
                  <div className="col-md-8 col-sm-8">
                    <DeviceSelectField projectId={projectId} organizationId={organizationId} />
                  </div>
                  <div className="col-md-4 col-sm-4 d-flex align-row-items">
                    <div className="form-group">
                      <button
                        className="btn btn-secondary upload-inline-action-button"
                        type="button"
                        onClick={() => { setCreatingCamera(true); }}
                      >
                        New camera
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            {isCreatingCamera
              && (
                <div>
                  <div className="form-group">
                    <label htmlFor="camera-name">
                      <T text="Camera name" />{' '}
                      <span className="required-icon">*</span>:
                    </label>
                    <Text
                      type="text"
                      field="cameraName"
                      id="camera-name"
                      className="form-control"
                      required
                      maxLength="255"
                      validate={requiredValidation}
                    />
                  </div>
                </div>
              )
            }
            {renderCamareFaliure()}
          </Fragment>
        )
      }
      {(!isCreating || !canCreateDeviceForProject)
        && (
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <DeviceSelectField projectId={projectId} organizationId={organizationId} />
            </div>

            {renderCamareFaliure()}

          </div>
        )
      }

      <div className="form-row">
        <div
          className={classnames({
            'col-sm-12': true,
            'col-md-6':
              formState.values.sensorHeightOption?.value === 'Other',
          })}
        >
          <div className="form-group">
            <label htmlFor="deployment-sensor-height">
              <T text="Camera height" />{' '}
              <span className="required-icon">*</span>:
            </label>
            <Select
              type="text"
              field="sensorHeightOption"
              id="deployment-sensor-height"
              placeholder={translateText('Select an option')}
              isClearable
              options={SENSOR_HEIGHT_OPTIONS}
              required
              validate={requiredValidation}
              aria-describedby="deployment-sensor-height-help"
            />
            <small
              id="deployment-sensor-height-help"
              className="form-text text-muted"
            >
              <T text="What height was generally used to deploy the camera?" />
            </small>
          </div>
        </div>
        {formState.values.sensorHeightOption?.value === 'Other' && (
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="deployment-sensor-height-details">
                <T text="Camera height details" />:
              </label>
              <Text
                type="text"
                field="sensorHeightDetails"
                id="deployment-sensor-height-details"
                className="form-control"
                maxLength="255"
                aria-describedby="deployment-sensor-height-details-help"
              />
              <small
                id="deployment-sensor-height-details-help"
                className="form-text text-muted"
              >
                <T text="If other, please describe." />
              </small>
            </div>
          </div>
        )}

        <div
          className={classnames({
            'col-sm-12': true,
            'col-md-6':
              formState.values.sensorOrientationOption?.value
              === 'Other',
          })}
        >
          <div className="form-group">
            <label htmlFor="deployment-sensor-orientation">
              <T text="Camera angle" />{' '}
              <span className="required-icon">*</span>:
            </label>
            <Select
              type="text"
              field="sensorOrientationOption"
              id="deployment-sensor-orientation"
              placeholder={translateText('Select an orientation')}
              isClearable
              options={SENSOR_ORIENTATION_OPTIONS}
              required
              validate={requiredValidation}
              aria-describedby="deployment-sensor-orientation-help"
            />
            <small
              id="deployment-sensor-orientation-help"
              className="form-text text-muted"
            >
              <T text="What angle was generally used to deploy the camera?" />
            </small>
          </div>
        </div>
        {formState.values.sensorOrientationOption?.value
          === 'Other' && (
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="deployment-sensor-orientation-other">
                  <T text="Camera angle details" />:
                </label>
                <Text
                  type="text"
                  field="sensorOrientationDetails"
                  id="deployment-sensor-orientation-other"
                  className="form-control"
                  maxLength="255"
                  aria-describedby="deployment-sensor-orientation-other-help"
                />
                <small
                  id="deployment-sensor-orientation-other-help"
                  className="form-text text-muted"
                >
                  <T text="If other, please describe." />
                </small>
              </div>
            </div>
          )}

        <div
          className={classnames({
            'col-sm-12': true,
            'col-md-6':
              formState.values.baitTypeOption?.value === 'Other',
          })}
        >
          <div className="form-group">
            <label htmlFor="deployment-bait-type">
              <T text="Bait type" />{' '}
              <span className="required-icon">*</span>:
              {baitUse === 'No' && (
                <Tooltip trigger="mouseenter focus" placement="right" content={<span>If you’d like to select a bait type, please change the Project Bait Use entry in Project Details to Yes or Some.</span>}>
                  <button type="button" className="btn btn-link m-0 p-0">
                    <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                  </button>
                </Tooltip>
              )}
            </label>
            <Select
              type="text"
              field="baitTypeOption"
              id="deployment-bait-type"
              placeholder={translateText('Select a bait type')}
              isClearable
              options={BAIT_TYPE_OPTIONS}
              required
              validate={baitUse === 'Some' ? null : baitUse === 'No' ? null : requiredValidation}
              aria-describedby="deployment-bait-type-help"
              disabled={baitUse === 'Yes' ? false : baitUse === 'No' ? true : baitUse === 'Some' ? false : false}
            />
            <small
              id="deployment-bait-type-help"
              className="form-text text-muted"
            >
              <T text="Type of bait (if any) that was used with camera." />
            </small>
          </div>
        </div>
        {formState.values.baitTypeOption?.value === 'Other' && (
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="deployment-bait-type-details">
                <T text="Bait type details" />:
              </label>
              <Text
                type="text"
                field="baitTypeDetails"
                id="deployment-bait-type-details"
                className="form-control"
                maxLength="255"
                aria-describedby="deployment-bait-type-details-help"
              />
              <small
                id="deployment-bait-type-details-help"
                className="form-text text-muted"
              >
                <T text="If other, please describe." />
              </small>
            </div>
          </div>
        )}
        <div className="col-sm-12">
          <div className="form-group">
            <label htmlFor="deployment-quiet-period">
              <T text="Quiet period setting" /> <span className="required-icon">*</span>:
            </label>
            <Text
              type="number"
              id="deployment-quiet-period"
              className="form-control"
              field="quietPeriod"
              placeholder="0"
              required
              min={0}
              validate={value => requiredValidation(value) || numberValidation(0)(value)}
              aria-describedby="deployment-quite-period-help"
            />
            <small
              id="deployment-quite-period-help"
              className="form-text text-muted"
            >
              <T text="Time specified between shutter triggers when activity in the sensor will not trigger the shutter. Specified in seconds." />
            </small>
          </div>
        </div>

        <SubprojectSelectField projectId={projectId} />

        <div className="col-sm-12">
          <div className="form-group">
            <label htmlFor="deployment-remarks">
              <T text="Remarks" />:
            </label>
            <TextArea
              field="remarks"
              id="deployment-remarks"
              className="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

DeploymentField.propTypes = {
  formState: PropTypes.objectOf(PropTypes.any).isRequired,
  formApi: PropTypes.objectOf(PropTypes.any).isRequired,
  onChange: PropTypes.func,
};

DeploymentField.defaultProps = {
  onChange: () => undefined,
  isCreating: PropTypes.bool.isRequired,
  canCreateDeviceForProject: PropTypes.bool.isRequired,
};

export default DeploymentField;
