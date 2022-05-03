import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { get, isEmpty } from 'lodash';

import { Link } from 'lib/routes';
import { exists, formatDate, getGraphQLErrorMessage, parseDate } from 'utils/functions';
import { Form, Checkbox } from 'components/form';
import { FORMAT } from 'components/form/datepicker';
import ImagesDropzone from 'components/images/dropzone';
import ProjectSelectField from 'components/upload/form/project-select-field';
import DeploymentSelectField from 'components/upload/form/deployment-select-field';
import DeploymentCreateField from 'components/upload/form/deployment-create-field';
import LocationSelectField from 'components/upload/form/location-select-field';
import LocationCreateField from 'components/upload/form/location-create-field';
import { createUploadHelper } from 'components/upload/helpers';
import T from 'components/transifex/translate';
import './style.scss';

class UploadModal extends PureComponent {
  static propTypes = {
    deployment: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
    files: PropTypes.arrayOf(PropTypes.object),
    isEditing: PropTypes.bool,
    isOpen: PropTypes.bool,
    project: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
    organizationId: PropTypes.string,
    projectId: PropTypes.string,
    canCreateDeploymentForProject: PropTypes.func.isRequired,
    canCreateLocationForProject: PropTypes.func.isRequired,
    closeModal: PropTypes.func,
    closeSelectFileDialog: PropTypes.func,
    createUploadItem: PropTypes.func.isRequired,
    createLocation: PropTypes.func.isRequired,
    createDeployment: PropTypes.func.isRequired,
    updateData: PropTypes.func,
    createDevice: PropTypes.func.isRequired,
    projectsPermissions: PropTypes.shape({}).isRequired,
  }

  static defaultProps = {
    deployment: null,
    files: [],
    isEditing: false,
    isOpen: false,
    project: null,
    organizationId: null,
    projectId: null,
    closeModal: () => null,
    closeSelectFileDialog: () => null,
    updateData: () => null,
  }

  state = {
    isCreatingDeployment: false,
    isCreatingLocation: false,
    locationCreationError: false,
    locationCreationErrorMsg: '',
    deploymentCreationError: false,
    deploymentCreationErrorMsg: '',
    selectedProject: null,
    disableUpload: false,
    projectType: 'image'
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      ReactModal.setAppElement('body');
    }
    this.componentRef = React.createRef();
  }

  componentDidUpdate() {
    const { isOpen } = this.props;
    if (isOpen) {
      document.body.classList.add('-modal-is-open');
    } else {
      document.body.classList.remove('-modal-is-open');
    }
  }

  /**
   * Event handler executed when the user changes the location
   * (either by selecting one or creating a new one)
   * @param {any} formState State of the form
   * @param {any} formApi API of the form
   * @param {string} value Name of the location
   */
  // eslint-disable-next-line class-methods-use-this
  onUpdateLocation({ touched, values }, { setValue }, value) {
    if (
      exists(values.deploymentStartDate)
      && (!touched.deploymentName
        || !exists(values.deploymentName)
        || !values.deploymentName.length)
    ) {
      const date = parseDate(values.deploymentStartDate, FORMAT);
      setValue('deploymentName', `${value} ${formatDate(date, 'MM/dd/yyyy')}`);
    }
  }

  /**
   * Event handler executed when the user changes the start date of the deployment
   * @param {any} formState State of the form
   * @param {any} formApi API of the form
   * @param {string} value Start date
   */
  // eslint-disable-next-line class-methods-use-this
  onUpdateDeploymentStartDate({ touched, values }, { setValue }, value) {
    if (
      exists(value) &&
      (exists(values.locationName) || exists(values.location?.label))
      && (!touched.deploymentName
        || !exists(values.deploymentName)
        || !values.deploymentName.length)
    ) {
      const date = parseDate(value, FORMAT);
      const location = values.locationName || values.location.label;
      setValue('deploymentName', `${location} ${formatDate(date, 'MM/dd/yyyy')}`);
    }
  }

  scrollTop = () => {
    this.componentRef.current.node.children[0].scrollTop = 0;
  };

  onSubmit = (values) => {
    const { files, createUploadItem } = this.props;

    this.setState({
      locationCreationError: false,
      locationCreationErrorMsg: '',
      deploymentCreationError: false,
      deploymentCreationErrorMsg: ''
    });

    this.createLocation(values)
      .then(locationId => this.createDeployment(values, locationId)
        .then((deploymentId) => {
          const newUpload = createUploadHelper({
            files,
            deploymentId,
            organizationId: +values.project.organizationId,
            projectId: +values.project.value,
            projectType: this.state.projectType,
            checkAndEnforceNoDuplicates: values.checkAndEnforceNoDuplicates,
            originalPhotosCnt: files.length
          });

          createUploadItem(newUpload);
          this.onClose();
        }).catch((err) => {
          this.setState({
            deploymentCreationError: true,
            deploymentCreationErrorMsg: getGraphQLErrorMessage(err)
          }, () => {
            this.scrollTop();
          });
        }))
      .catch((err) => {
        this.setState({
          locationCreationError: true,
          locationCreationErrorMsg: getGraphQLErrorMessage(err)
        }, () => {
          this.scrollTop();
        });
      });
  }

  onClose = () => {
    const { closeModal, closeSelectFileDialog } = this.props;

    this.setState({
      isCreatingDeployment: false,
      isCreatingLocation: false,
    });

    closeSelectFileDialog();
    closeModal();
  }

  updateImages = (images) => {
    const { updateData } = this.props;
    updateData({ files: images });
  }

  createDeviceForProject(formValues) {
    const { createDevice } = this.props;
    return new Promise((resolve, reject) => {
      if (!formValues.cameraName) {
        resolve(+formValues.deviceOption.value);
      } else {
        const dataDevice = { name: formValues.cameraName };
        createDevice({
          variables: { organizationId: +formValues.project.organizationId, projectId: +formValues.project.value, id: null, body: dataDevice },
        })
          .then((respDevice) => {
            if (respDevice.errors) {
              reject(respDevice);
            } else {
              resolve(+respDevice.data.createDevice.id);
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  /**
   * Create the location in the API, if the user asked to create a
   * new one. Noop otherwise.
   * @param {any} formValues Values of the form when submitted
   * @return {Promise<number>} ID of the location
   */
  createLocation(formValues) {
    const { createLocation } = this.props;
    const { isCreatingDeployment, isCreatingLocation } = this.state;

    return new Promise((resolve, reject) => {
      if (!isCreatingLocation) {
        if (!isCreatingDeployment) {
          resolve();
        } else {
          resolve(+formValues.location.value);
        }
      } else {
        createLocation({
          variables: {
            projectId: +formValues.project.value,
            body: {
              placename: formValues.locationName,
              latitudeStr: exists(formValues.locationLatitude) ? formValues.locationLatitude.toString() : null,
              longitudeStr: exists(formValues.locationLongitude)
                ? formValues.locationLongitude.toString()
                : null,
              geodeticDatum: 'WGS84',
              fieldNumber: '1',
              country: formValues.locationCountry.value,
            },
          },
        })
          .then(respLocation => {
            if (respLocation.errors) {
              reject(respLocation);
            } else {
              resolve(+respLocation.data.createLocation.id);
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  /**
   * Create the deployment in the API, if the user asked to create a
   * new one. Noop otherwise.
   * @param {any} formValues Values of the form when submitted
   * @param {number} locationId ID of the location
   * @return {Promise<number>} ID of the deployment
   */
  createDeployment(formValues, locationId) {
    const { createDeployment } = this.props;
    const { isCreatingDeployment } = this.state;

    return new Promise((resolve, reject) => {
      if (!isCreatingDeployment) {
        resolve(+formValues.deployment.value);
      } else {
        this.createDeviceForProject(formValues)
          .then((deviceId) => {
            createDeployment({
              variables: {
                projectId: +formValues.project.value,
                body: {
                  startDatetime: formValues.deploymentStartDate,
                  endDatetime: formValues.deploymentEndDate,
                  deploymentName: formValues.deploymentName,
                  deploymentIdentifier: formValues.deploymentName,
                  locationId,
                  remarks: formValues.remarks,
                  sensorOrientation: formValues.sensorOrientationOption.value,
                  sensorHeight: formValues.sensorHeightOption.value,
                  sensorFailureDetails: formValues.sensorFailureOption.value,
                  deviceId,
                  baitTypeName: formValues.baitTypeOption.value,
                  quietPeriod: parseInt(formValues.quietPeriod, 10),
                  metadata: {
                    feature_type: [formValues.featureTypeOptions[0].value],
                    feature_type_methodology: formValues.featureTypeMethodology,
                    bait_description: formValues.baitTypeDetails,
                    height_other: formValues.sensorHeightDetails,
                    orientation_other: formValues.sensorOrientationDetails,
                  },
                  subprojectId: +formValues.subProjectOption?.value,
                },
              },
            })
              .then(response => {
                if (response.errors) {
                  reject(response);
                } else {
                  resolve(+response.data.createDeployment.id);
                }
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  enableDisableUploadBtn = (values) => {
    const { projectsPermissions } = this.props;
    const { role } = projectsPermissions[values.value];
    this.setState({
      disableUpload: role === 'PROJECT_TAGGER' && !values.taggerUpload,
      projectType: values.projectType.toLowerCase()
    });
  }

  render() {
    const {
      isCreatingDeployment,
      isCreatingLocation,
      locationCreationError,
      locationCreationErrorMsg,
      deploymentCreationError,
      deploymentCreationErrorMsg,
      disableUpload,
    } = this.state;
    const {
      files,
      isEditing,
      isOpen,
      project,
      organizationId,
      projectId,
      deployment,
      canCreateDeploymentForProject,
      canCreateLocationForProject,
    } = this.props;
    const formValues = {
      project,
      deployment,
      // flag to avoid duplicate files by filename.
      checkAndEnforceNoDuplicates: true
    };

    if (!project && projectId) {
      formValues.project = { value: projectId, organizationId };
    }

    return (
      <ReactModal
        isOpen={isOpen}
        onRequestClose={this.onClose}
        shouldCloseOnOverlayClick={false}
        className="c-upload-image-modal"
        role="dialog"
        ref={this.componentRef}
      >
        <Form initialValues={formValues} onSubmit={this.onSubmit} noValidate>
          {({ formState, formApi }) => (
            <Fragment>
              <div className="content-panel">
                <div className="upload-panel">
                  <p>
                    <T text="{files} file(s) selected" params={{ files: files.length }} />
                  </p>
                  <ImagesDropzone
                    onChange={this.updateImages}
                    images={files}
                    max={16}
                    options={{ disabled: isEditing }}
                  />
                </div>
                <div className="form-panel">
                  {deploymentCreationError && (
                    <div className="alert alert-danger" role="alert">
                      {deploymentCreationErrorMsg}
                    </div>
                  )}
                  {locationCreationError && (
                    <div className="alert alert-danger" role="alert">
                      {locationCreationErrorMsg}
                    </div>
                  )}
                  <small className="text-muted">
                    Please note that under the <Link route="terms"><a target="_blank">Wildlife Insights Terms of Use</a></Link>,
                    once you submit content to the Wildlife Insights service, you may not delete it after 2 weeks.
                    See Terms of Use Section 9 for details and exceptions.
                  </small>
                  <ProjectSelectField
                    projectId={projectId}
                    organizationId={organizationId}
                    onChange={() => {
                      formApi.setValues({
                        ...formState.values,
                        deployment: null,
                        location: null,
                      });
                      if (!isEmpty(get(formState, 'values.project'))) {
                        this.enableDisableUploadBtn(formState.values.project);
                      }
                    }}
                  />
                  <div className="form-group form-check">
                    <label htmlFor="no-duplicate-images" className="m-0">
                      <Checkbox
                        field="checkAndEnforceNoDuplicates"
                        className="form-check-input mt-1"
                        id="no-duplicate-images"
                      />
                      Don't upload duplicate images
                    </label>
                  </div>
                  {!isCreatingDeployment && (
                    <div className="row">
                      <div className="col-8">
                        <DeploymentSelectField project={formState.values.project} />
                      </div>
                      <div className="col-4 d-flex align-row-items">
                        <div className="form-group">
                          <button
                            className="btn btn-secondary upload-inline-action-button"
                            type="button"
                            onClick={() => {
                              formApi.setValues({
                                ...formState.values,
                                deployment: null,
                              });
                              this.setState({ isCreatingDeployment: true });
                            }}
                            disabled={
                              !exists(formState.values.project?.value)
                              || !canCreateDeploymentForProject(+formState.values.project.value)
                            }
                          >
                            New deployment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {isCreatingDeployment && (
                    <Fragment>
                      {!isCreatingLocation && (
                        <div className="row">
                          <div className="col-8">
                            <LocationSelectField
                              project={formState.values.project}
                            />
                          </div>
                          <div className="col-4 d-flex align-row-items">
                            <div className="form-group">
                              <button
                                className="btn btn-secondary upload-inline-action-button"
                                type="button"
                                onClick={() => {
                                  formApi.setValues({
                                    ...formState.values,
                                    location: null,
                                  });
                                  this.setState({ isCreatingLocation: true });
                                }}
                                disabled={
                                  !exists(formState.values.project?.value)
                                  || !canCreateLocationForProject(+formState.values.project.value)
                                }
                              >
                                New location
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {isCreatingLocation && (
                        <Fragment>
                          <LocationCreateField
                            formState={formState}
                            formApi={formApi}
                            onChange={(field, value) => {
                              if (field === 'locationName') {
                                this.onUpdateLocation(formState, formApi, value);
                              }
                            }}
                          />
                        </Fragment>
                      )}
                      <DeploymentCreateField
                        formState={formState}
                        formApi={formApi}
                        organizationId={formState.values.project.organizationId}
                        projectId={formState.values.project.value}
                        onChange={(field, value) => {
                          if (field === 'deploymentStartDate') {
                            this.onUpdateDeploymentStartDate(formState, formApi, value);
                          }
                        }}
                      />
                    </Fragment>
                  )}
                </div>
              </div>
              <div className="actions-panel">
                <button type="button" className="btn btn-secondary btn-alt" onClick={this.onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-alt" disabled={disableUpload}>
                  Upload
                </button>
              </div>
            </Fragment>
          )}
        </Form>
      </ReactModal>
    );
  }
}

export default UploadModal;
