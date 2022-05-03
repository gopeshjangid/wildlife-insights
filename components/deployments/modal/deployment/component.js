import React, {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { useQuery, useMutation } from 'react-apollo-hooks';
import classnames from 'classnames';
import { omit, get } from 'lodash';
import { exists, getGraphQLErrorMessage, translateText } from 'utils/functions';
import { Form, Text, TextArea, Select, DatePicker } from 'components/form';
import T from 'components/transifex/translate';
import { numberValidation, requiredValidation, validateStartDate } from 'components/form/validations';
import LoadingSpinner from 'components/loading-spinner';
import {
  SENSOR_FAILURE_DETAILS_OPTIONS, FEATURE_TYPE_OPTIONS, SENSOR_ORIENTATION_OPTIONS,
  SENSOR_HEIGHT_OPTIONS, BAIT_TYPE_OPTIONS
} from 'components/upload/form/deployment-create-field/constant.js';
import Tooltip from 'components/tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import projectQuery from 'components/projects/form/query.graphql';
import createDeploymentQuery from 'components/upload/createDeployment.graphql';
import LocationCreateField from './form/location-create-field';
import { getFormInitialValues, serializeBody } from './helpers';

import deploymentQuery from './deployment.graphql';
import locationsQuery from './locations.graphql';
import devicesQuery from './devices.graphql';
import subProjectsQuery from './subprojects.graphql';
import updateDeploymentQuery from './update-deployment.graphql';
import './style.scss';

const DeploymentModal = ({
  id,
  projectId,
  organizationId,
  open,
  onClose,
  canEdit,
  canAttachDevice,
  onSaved,
  isCreating,
  canCreateDeviceForProject,
  createDevice,
  canCreateLocationForProject,
  createLocation,
}) => {
  const [deployment, setDeployment] = useState(null);
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [isCreatingCamera, setCreatingCamera] = useState(false);
  const [isCreatingLocation, setCreatingLocation] = useState(false);
  const [deviceState, setDeviceState] = useState({
    deviceCreationError: false,
    isCreatingDevice: false,
    deviceCreationErrorMessage: '',
  });
  const [locationState, setLocationState] = useState({
    locationCreationError: false,
    isCreatingPlace: false,
    locationCreationErrorMessage: '',
  });

  const resetDeviceState = () => {
    setDeviceState({
      deviceCreationError: false,
      isCreatingDevice: false,
      deviceCreationErrorMessage: '',
    });
  };

  const resetLocationState = () => {
    setLocationState({
      locationCreationError: false,
      isCreatingPlace: false,
      locationCreationErrorMessage: '',
    });
  };

  const { data, error } = useQuery(deploymentQuery, {
    variables: {
      id,
      projectId,
    },
    skip: !exists(id) || isCreating,
    fetchPolicy: 'network-only'
  });

  const {
    data: locationsData,
    loading: locationsLoading,
    error: locationsError,
  } = useQuery(locationsQuery, {
    skip: !exists(projectId),
    variables: {
      projectId,
    },
  });

  const {
    data: devicesData,
    loading: devicesLoading,
    error: devicesError,
  } = useQuery(devicesQuery, {
    skip: !exists(organizationId),
    variables: {
      organizationId,
      projectId,
    },
  });

  const {
    data: subProjectsData,
    loading: subProjectsLoading,
    error: subProjectsError,
  } = useQuery(subProjectsQuery, {
    skip: !exists(projectId),
    variables: {
      projectId,
    },
  });

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

  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(!isCreating ? updateDeploymentQuery : createDeploymentQuery, {
    refetchQueries: () => ['getDeployments', 'getDeployment', 'getLocations', 'getLocation', 'getSubProjects'],
  });

  const errorMessage = useMemo(
    () => {
      let err = '';
      if (mutationError) {
        err = mutationError?.graphQLErrors?.[0]?.message;
        if (err === undefined) {
          if (mutationError.message) {
            err = mutationError.message;
          }
        }
      }
      return err;
    },
    [mutationError]
  );

  const createDeviceForProject = values => new Promise((resolve, reject) => {
    if (values.cameraName) {
      const { cameraName } = values;
      const dataDevice = { name: cameraName };
      setDeviceState({ ...deviceState, isCreatingDevice: true });
      createDevice({
        variables: { organizationId, id: null, body: dataDevice },
      })
        .then((respDevice) => {
          setDeviceState({ ...deviceState, isCreatingDevice: false });
          if (respDevice.errors) {
            reject(respDevice);
          } else {
            resolve(+respDevice.data.createDevice.id);
          }
        })
        .catch((err) => {
          setDeviceState({ ...deviceState, isCreatingDevice: false });
          reject(err);
        });
    } else {
      resolve(+values.deviceOption.value);
    }
  });

  const createLocationForProject = values => new Promise((resolve, reject) => {
    if (values.locationName) {
      const locData = {
        placename: values.locationName,
        latitudeStr: exists(values.locationLatitude) ? values.locationLatitude : null,
        longitudeStr: exists(values.locationLongitude)
          ? values.locationLongitude
          : null,
        geodeticDatum: 'WGS84',
        fieldNumber: '1',
        country: values.locationCountry.value,
      };
      setLocationState({ ...locationState, isCreatingPlace: true });
      createLocation({
        variables: { projectId, body: locData },
      })
        .then((respLocation) => {
          setLocationState({ ...locationState, isCreatingPlace: false });
          if (respLocation.errors) {
            reject(respLocation);
          } else {
            resolve(+respLocation.data.createLocation.id);
          }
        })
        .catch((err) => {
          setLocationState({ ...locationState, isCreatingPlace: false });
          reject(err);
        });
    } else {
      resolve(+values.locationOption.value);
    }
  });

  const saveDeployment = (values) => {
    mutate({ variables: { projectId: values.projectId, id: values.id, body: values.body } })
      .then(res => {
        if (!res.errors) {
          setCreatingCamera(false);
          resetDeviceState();
          resetLocationState();
          onSaved(res);
        }
      });
  };

  const handleDeviceErr = (deviceErr) => {
    setDeviceState({
      ...deviceState,
      deviceCreationErrorMessage: getGraphQLErrorMessage(deviceErr),
      deviceCreationError: true
    });
  };

  const handleLocationErr = (locationErr) => {
    setLocationState({
      ...locationState,
      locationCreationErrorMessage: getGraphQLErrorMessage(locationErr),
      locationCreationError: true,
      isCreatingPlace: false
    });
  };

  const onSubmit = useCallback(
    (values) => {
      const omitValues = ['cameraName', 'locationName', 'locationLatitude', 'locationLongitude', 'locationCountry', 'subproject'];
      const newValues = serializeBody(omit(values, omitValues));
      if (newValues.quietPeriod === null) {
        newValues.quietPeriod = 0;
      }
      if (isCreating) {
        newValues.deploymentIdentifier = values.deploymentName;
      }
      createDeviceForProject(values)
        .then((deviceId) => {
          newValues.deviceId = deviceId;
          createLocationForProject(values)
            .then((locationId) => {
              newValues.locationId = locationId;
              saveDeployment({ projectId, id, body: newValues });
            })
            .catch((locationErr) => {
              handleLocationErr(locationErr);
            });
        })
        .catch((deviceErr) => {
          handleDeviceErr(deviceErr);
        });
    },
    [isCreating, organizationId, projectId, id]
  );

  useEffect(() => {
    if (!error && data?.getDeployment) {
      setDeployment(data.getDeployment);
    }
  }, [error, data, setDeployment]);

  useEffect(() => {
    if (!locationsError && locationsData?.getLocations) {
      setLocations(locationsData.getLocations.data);
    }
  }, [locationsError, locationsData, setLocations]);

  useEffect(() => {
    if (!devicesError && devicesData?.getDevices) {
      setDevices(devicesData.getDevices.data);
    }
  }, [devicesError, devicesData, setDevices]);

  useEffect(() => {
    if (!subProjectsError && subProjectsData?.getSubProjectsByProject) {
      setSubProjects(subProjectsData.getSubProjectsByProject.data);
    }
  }, [subProjectsError, subProjectsData, setSubProjects]);

  useEffect(() => {
    if (!open && deployment) {
      setDeployment(null);
    }
  }, [open, deployment, setDeployment]);

  const closeModal = () => {
    setCreatingCamera(false);
    setCreatingLocation(false);
    resetDeviceState();
    resetLocationState();
    onClose();
  };

  const renderCamareFaliure = () => (
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
        disabled={!isCreating && !canEdit}
        required
        validate={requiredValidation}
      />
    </div>
  );

  const renderDevice = () => (
    <div className="form-group">
      <label htmlFor="deployment-device">
        <T text="Camera" />{' '}
        <span className="required-icon">*</span>:
      </label>
      <Select
        type="text"
        field="deviceOption"
        id="deployment-device"
        placeholder={translateText('Select a camera')}
        isClearable
        options={
          deployment && (devicesLoading || devicesError)
            ? [
              ...(deployment.device
                ? [
                  {
                    label: deployment.device.name,
                    value: deployment.device.id,
                  },
                ]
                : []),
            ]
            : devices.map(l => ({
              label: l.name,
              value: l.id,
            }))
        }
        aria-describedby="deployment-device-help"
        disabled={(!isCreating && !canEdit) || !canAttachDevice}
        required
        validate={requiredValidation}
      />
      {devicesLoading && (
        <small
          id="deployment-device-help"
          className="form-text text-muted"
        >
          <LoadingSpinner transparent inline mini />{' '}
          <T text="The list of cameras is loading." />
        </small>
      )}
    </div>
  );

  const renderLocationSelectField = () => {
    return (
      <div className="form-group">
        <label htmlFor="deployment-location">
          <T text="Location" />{' '}
          <span className="required-icon">*</span>:
        </label>
        <Select
          type="text"
          field="locationOption"
          id="deployment-location"
          placeholder={translateText('Select a location')}
          isClearable
          options={
            deployment && (locationsLoading || locationsError)
              ? [
                {
                  label: deployment.location.placename,
                  value: deployment.location.id,
                },
              ]
              : locations.map(l => ({
                label: l.placename,
                value: l.id,
              }))
          }
          aria-describedby="deployment-location-help"
          disabled={!isCreating && !canEdit}
          required
          validate={requiredValidation}
        />
        {locationsLoading && (
          <small
            id="deployment-location-help"
            className="form-text text-muted"
          >
            <LoadingSpinner transparent inline mini />{' '}
            <T text="The list of locations is loading." />
          </small>
        )}
      </div>
    );
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={closeModal}
      className="c-deployment-modal"
      contentLabel={translateText('Camera deployment form')}
    >
      {!deployment && !isCreating && (
        <div className="content-panel">
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        </div>
      )}
      {(deployment || isCreating) && (
        <Form
          onSubmit={onSubmit}
          initialValues={getFormInitialValues(deployment, projectData)}
          noValidate
        >
          {({ formState, formApi }) => (
            <Fragment>
              <div className="content-panel">
                {mutationError && (
                  <div className="alert alert-danger" role="alert">
                    {isCreating && (
                      <T text="Unable to create the camera deployment." />
                    )}
                    {!isCreating && (
                      <T text="Unable to update the camera deployment." />
                    )}{' '}
                    {translateText(
                      errorMessage || 'Please try again in a few minutes.'
                    )}
                  </div>
                )}
                {deviceState.deviceCreationError && (
                  <div className="alert alert-danger" role="alert">
                    <T text="Unable to create new camera for deployment." />{' '}
                    {translateText(
                      deviceState.deviceCreationErrorMessage || 'Please try again in a few minutes.'
                    )}
                  </div>
                )}
                {locationState.locationCreationError && (
                  <div className="alert alert-danger" role="alert">
                    <T text="Unable to create new location for deployment." />{' '}
                    {translateText(
                      locationState.locationCreationErrorMessage || 'Please try again in a few minutes.'
                    )}
                  </div>
                )}
                {mutationData?.updateDeployment && !isCreating && (
                  <div className="alert alert-info" role="alert">
                    <T text="The camera deployment has been updated." />
                  </div>
                )}
                {locationsError && (
                  <div className="alert alert-danger" role="alert">
                    <T text="Unable to load the list of locations. Please try again in a few minutes." />
                  </div>
                )}
                {devicesError && (
                  <div className="alert alert-danger" role="alert">
                    <T text="Unable to load the list of cameras. Please try again in a few minutes." />
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <T text="Unable to load the camera deployment. Please try again in a few minutes." />
                  </div>
                )}
                <div className="form-row">
                  <div className={classnames('col-sm-12', { 'col-md-6': deployment })}>
                    <div className="form-group">
                      <label htmlFor="deployment-name">
                        <T text="Camera deployment name" />{' '}
                        <span className="required-icon">*</span>:
                      </label>
                      <Text
                        type="text"
                        field="deploymentName"
                        id="deployment-name"
                        className="form-control"
                        required
                        maxLength="255"
                        validate={requiredValidation}
                        disabled={!isCreating && !canEdit}
                      />
                    </div>
                  </div>
                  {deployment
                    && (
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="deployment-id">
                            <T text="ID" />:
                          </label>
                          <Text
                            type="text"
                            field="id"
                            id="deployment-id"
                            className="form-control"
                            disabled
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="deployment-start-date">
                        <T text="Start date" />{' '}
                        <span className="required-icon">*</span>:
                      </label>
                      <DatePicker
                        field="startDatetime"
                        id="deployment-start-date"
                        className="form-control"
                        before={formState.values.endDatetime}
                        disabled={!isCreating && !canEdit}
                        required
                        validate={value => requiredValidation(value) || validateStartDate(value, formState.values.endDatetime)}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="deployment-end-date">
                        <T text="End date" />{' '}
                        <span className="required-icon">*</span>:
                      </label>
                      <DatePicker
                        field="endDatetime"
                        id="deployment-end-date"
                        className="form-control"
                        after={formState.values.startDatetime}
                        disabled={!isCreating && !canEdit}
                        required
                        validate={requiredValidation}
                      />
                    </div>
                  </div>
                </div>
                {(isCreating && canCreateLocationForProject)
                  && (
                    <Fragment>
                      {!isCreatingLocation
                        && (
                          <div className="form-row">
                            <div className="col-sm-12 col-md-8">
                              {renderLocationSelectField()}
                            </div>
                            <div className="col-sm-12 col-md-4 d-flex align-row-items">
                              <div className="form-group">
                                <button
                                  className="btn btn-secondary upload-inline-action-button"
                                  type="button"
                                  onClick={() => { setCreatingLocation(true); }}
                                >
                                  New location
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      {isCreatingLocation
                        && (
                          <LocationCreateField
                            formState={formState}
                            formApi={formApi}
                          />
                        )
                      }
                    </Fragment>
                  )
                }
                {(!isCreating || !canCreateLocationForProject)
                  && (
                    <div className="form-row">
                      <div className="col-sm-12">
                        {renderLocationSelectField()}
                      </div>
                    </div>
                  )
                }
                <div className="form-row">
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
                        disabled={!isCreating && !canEdit}
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
                        disabled={!isCreating && !canEdit}
                      />
                    </div>
                  </div>
                </div>

                {isCreating && canCreateDeviceForProject
                  && (
                    <Fragment>
                      {!isCreatingCamera
                        && (
                          <div className="form-row">
                            <div className="col-sm-12 col-md-8">
                              {renderDevice()}
                            </div>
                            <div className="col-sm-12 col-md-4 d-flex align-row-items">
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
                      <div className="form-row">
                        {isCreatingCamera
                          && (
                            <div className="col-sm-12">
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
                      </div>
                      <div className="form-row">
                        <div className="col-sm-12">
                          {renderCamareFaliure()}
                        </div>
                      </div>
                    </Fragment>
                  )
                }
                {(!isCreating || !canCreateDeviceForProject)
                  && (
                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        {renderDevice()}
                      </div>
                      <div className="col-sm-12 col-md-6">
                        {renderCamareFaliure()}
                      </div>
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
                        disabled={!isCreating && !canEdit}
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
                          disabled={!isCreating && !canEdit}
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
                </div>
                <div className="form-row">
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
                        disabled={!isCreating && !canEdit}
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
                            disabled={!isCreating && !canEdit}
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
                </div>
                <div className="form-row">
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
                        disabled={!isCreating && !canEdit && baitUse === 'Yes' ? false : baitUse === 'No' ? true : baitUse === 'Some' ? false : false}
                        required
                        validate={baitUse === 'Some' ? null : baitUse === 'No' ? null : requiredValidation}
                        aria-describedby="deployment-bait-type-help"
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
                          disabled={!isCreating && !canEdit}
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
                </div>
                <div className="form-group">
                  <label htmlFor="deployment-subproject">
                    <T text="Subproject" />{' '}
                  </label>
                  <Select
                    type="text"
                    field="subProjectOption"
                    id="deployment-subproject"
                    placeholder={translateText('Select a subproject')}
                    isClearable
                    options={
                      deployment && (subProjectsLoading || subProjectsError)
                        ? [
                          ...(deployment.subproject
                            ? [
                              {
                                label: deployment.subproject.name,
                                value: deployment.subproject.id,
                              },
                            ]
                            : []),
                        ]
                        : subProjects.map(l => ({
                          label: l.name,
                          value: l.id,
                        }))
                    }
                    aria-describedby="deployment-subproject-help"
                    disabled={(!isCreating && !canEdit)}
                    required
                  />
                  {subProjectsLoading && (
                    <small
                      id="deployment-subproject-help"
                      className="form-text text-muted"
                    >
                      <LoadingSpinner transparent inline mini />{' '}
                      <T text="The list of subprojects is loading." />
                    </small>
                  )}
                </div>
                <div className="form-row">
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
                        disabled={!isCreating && !canEdit}
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
                </div>
                <div className="form-row">
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label htmlFor="deployment-remarks">
                        <T text="Remarks" />:
                      </label>
                      <TextArea
                        field="remarks"
                        id="deployment-remarks"
                        className="form-control"
                        disabled={!isCreating && !canEdit}
                      />
                    </div>
                  </div>
                </div>
                <p>
                  Quickly create multiple new deployments in your project by uploading a CSV file with the required information for each deployment.
                  Please note that once a deployment is created you may not delete it after 2 weeks.
                </p>
              </div>
              <div className="actions-panel">
                <button
                  type="button"
                  className="btn btn-secondary btn-alt"
                  onClick={closeModal}
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
                      (mutationLoading || deviceState.isCreatingDevice
                        || locationState.isCreatingPlace)
                        ? translateText(deployment ? 'Updating...' : 'Creating...')
                        : translateText(deployment ? 'Save changes' : 'Create')
                    }
                  </button>
                )}
              </div>
            </Fragment>
          )}
        </Form>
      )}
    </ReactModal>
  );
};

DeploymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  id: PropTypes.number,
  projectId: PropTypes.number.isRequired,
  organizationId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  canEdit: PropTypes.bool.isRequired,
  canAttachDevice: PropTypes.bool.isRequired,
  onSaved: PropTypes.func,
  isCreating: PropTypes.bool.isRequired,
  canCreateDeviceForProject: PropTypes.bool.isRequired,
  canCreateLocationForProject: PropTypes.bool.isRequired,
  createDevice: PropTypes.func.isRequired,
  createLocation: PropTypes.func.isRequired,
};

DeploymentModal.defaultProps = {
  id: null,
  onClose: () => { },
  onSaved: () => { },
};

export default DeploymentModal;
