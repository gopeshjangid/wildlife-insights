import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import classnames from 'classnames';

import { exists, translateText, getGraphQLErrorMessage } from 'utils/functions';
import { smoothScroll, HEADER_HEIGHT } from 'utils/scroll';
import { Router, Link } from 'lib/routes';

import { MAX_EMBARGO } from 'utils/app-constants';
import { getCountriesOptions } from 'utils/country-codes';
import { Form, Text, TextArea, Select, LookupSelect, DatePicker, Checkbox } from 'components/form';
import LoadingSpinner from 'components/loading-spinner';
import {
  requiredValidation,
  urlValidation,
  numberValidation,
  emailValidation,
} from 'components/form/validations';
import T from 'components/transifex/translate';
import ProjectLicenseModal from './license-modal';
import ProjectEmbargoModal from './embargo-modal';
import ProjectTypeModal from './project-type-modal';
import {
  isValidEmbargo,
  serializeBody,
  getFormInitialValues,
  getTaxonomiesSearchResults,
  getTaxonomyOptionsFromUUIDs
} from './helpers';
import initiativesQuery from './initiatives.graphql';
import organizationsQuery from './organizations.graphql';
import createProject from './create.graphql';
import updateProject from './update.graphql';
import './style.scss';

const PROJECT_TYPES = [
  { label: 'Image', value: 'Image' },
  { label: 'Sequence', value: 'Sequence' }
]

const PROJECT_DATAFILES_LICENSES = [
  { label: 'CC0', value: 'CC0' },
  { label: 'CC BY 4.0', value: 'CC-BY' },
  { label: 'CC BY-NC', value: 'CC-BY-NC' },
];

const PROJECT_METADATA_LICENSES = PROJECT_DATAFILES_LICENSES.filter(
  ({ value }) => value !== 'CC-BY-NC'
);

const PROJECT_METADATA_SPECIES = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Multiple', value: 'Multiple' },
];

const PROJECT_METADATA_SENSOR_LAYOUT = [
  { label: 'Systematic', value: 'Systematic' },
  { label: 'Randomized', value: 'Randomized' },
  { label: 'Convenience', value: 'Convenience' },
  { label: 'Targeted', value: 'Targeted' },
];

const PROJECT_METADATA_BAIT_USE = [
  { label: 'Yes', value: 'Yes' },
  { label: 'Some', value: 'Some' },
  { label: 'No', value: 'No' },
];

const PROJECT_METADATA_BAIT_TYPE = [
  { label: 'Scent', value: 'Scent' },
  { label: 'Meat', value: 'Meat' },
  { label: 'Visual', value: 'Visual' },
  { label: 'Acoustic', value: 'Acoustic' },
  { label: 'Other', value: 'Other' },
];

const PROJECT_METADATA_STRATIFICATION = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const PROJECT_METADATA_SENSOR_METHOD = [
  { label: 'Sensor detection', value: 'Sensor detection' },
  { label: 'Time lapse', value: 'Time lapse' },
  { label: 'Both', value: 'Both' },
];

const PROJECT_METADATA_INDIVIDUAL_ANIMALS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const PROJECT_METADATA_BLANK_IMAGES = [
  { label: 'Yes', value: 'Yes' },
  { label: 'Some', value: 'Some' },
  { label: 'No', value: 'No' },
];

const PROJECT_METADATA_SENSOR_CLUSTER = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

class ProjectForm extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      getProject: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    isCreating: PropTypes.bool.isRequired,
    canUpdate: PropTypes.bool.isRequired,
    canUpdateInitiative: PropTypes.func.isRequired,
    getInitiativesOptions: PropTypes.func.isRequired,
    getOrganizationsOptions: PropTypes.func.isRequired,
    useCommonNames: PropTypes.bool.isRequired,
    reloadUserPermissions: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: { getOrganizations: {}, getProject: {}, loading: false, error: null },
  }

  el = React.createRef()

  state = {
    licenseModalOpen: false,
    embargoModalOpen: false,
    projectTypeModalOpen: false,
  }

  constructor(props) {
    super(props);

    this.onClickOpenEmbargoModal = this.onClickOpenEmbargoModal.bind(this);
    this.onCloseEmbargoModal = this.onCloseEmbargoModal.bind(this);
  }

  /**
   * Event handler executed when the user clicks the button to open the license modal
   */
  onClickOpenLicenseModal() {
    this.setState({ licenseModalOpen: true });
  }

  /**
   * Event handler executed when the license modal requests to be closed
   */
  onCloseLicenseModal() {
    this.setState({ licenseModalOpen: false });
  }

  onClickOpenProjectTypeModal() {
    this.setState({ projectTypeModalOpen: true });
  }

  onCloseProjectTypeModal() {
    this.setState({ projectTypeModalOpen: false });
  }

  onClickOpenEmbargoModal() {
    this.setState({ embargoModalOpen: true });
  }

  onCloseEmbargoModal() {
    this.setState({ embargoModalOpen: false });
  }

  onSubmit(values, mutate) {
    const {
      data: { variables },
      isCreating,
      reloadUserPermissions,
    } = this.props;
    mutate({
      variables: {
        organizationId: +values.organizationId.value,
        ...(isCreating ? {} : { projectId: variables.id }),
        body: serializeBody(values),
      },
    })
      .then(({ data }) => {
        const project = isCreating ? data.createProject : data.updateProject;
        let prevOrgId = parseInt(values.organizationId.value, 10);
        if (!isCreating) {
          prevOrgId = this.props.data.variables.organizationId;
        }
        if (isCreating) {

          // We fetch the user permissions again because they will include the new entity, and then
          // we redirect them
          if (project?.id) {
            reloadUserPermissions().finally(() => {
              Router.pushRoute(
                exists(project.initiative) ? 'projects_initiative_show' : 'projects_show',
                {
                  organizationId: project.organization.id,
                  initiativeId: exists(project.initiative) ? +project.initiative.id : null,
                  projectId: project.id,
                }
              );
            });
          }
        } else if (
          project?.id &&
          exists(values.initiative)
          && values.initiativeId !== data?.updateProject?.initiativeId
        ) {
          // If the user changes the initiative the project belongs to
          // we also update the URL
          Router.replaceRoute('projects_initiative_show', {
            organizationId: project.organizationId,
            initiativeId: project.initiativeId,
            projectId: +project.id,
            tab: 'details',
          });
        } else if (project?.id && prevOrgId !== data?.updateProject?.organizationId) {
          // If the user changes the initiative the project belongs to
          // we also update the URL
          const routeParams = {
            organizationId: project.organizationId,
            projectId: +project.id,
            tab: 'details',
          };
          if (Router.query.initiativeId) {
            routeParams.initiativeId = project.initiativeId;
          }
          if (Router.query.initiativeId) {
            Router.replaceRoute('projects_initiative_show', routeParams);
          } else {
            Router.replaceRoute('projects_show', routeParams);
          }
        }
      })
      .finally(() => {
        const bounds = this.el.current.getBoundingClientRect();
        const scroll = bounds.top + window.scrollY - HEADER_HEIGHT;
        smoothScroll(500, window.scrollY, scroll);
      });
  }

  getRefetchQueries = () => {
    const { projectId, organizationId } = this.props;
    return [
      'getProjects',
      ...(projectId && organizationId ? ['getProject'] : [])
    ];
  }

  render() {
    const {
      data: { loading, error, getProject: project },
      isCreating,
      canUpdate,
      canUpdateInitiative,
      getInitiativesOptions,
      getOrganizationsOptions,
      useCommonNames,
    } = this.props;

    const { licenseModalOpen, embargoModalOpen, projectTypeModalOpen } = this.state;

    const mutationFn = isCreating ? createProject : updateProject;

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          Unable to load the project. Please try again in a few minutes.
        </div>
      );
    }

    if (loading && (!isCreating && !project)) {
      return (
        <div className="text-center">
          <LoadingSpinner inline />
        </div>
      );
    }

    return (
      <Mutation mutation={mutationFn} refetchQueries={this.getRefetchQueries()}>
        {(mutate, { loading: mutationLoading, error: mutationError, data: mutationData }) => {
          const nameTakenError = mutationError
            ? mutationError?.graphQLErrors?.[0].message.includes('is not unique')
            : false;

          return (
            <div ref={this.el} className="c-project-form">
              <Form
                onSubmit={values => this.onSubmit(values, mutate)}
                initialValues={getFormInitialValues(project)}
                noValidate
              >
                {({ formState, formApi }) => (
                  <Fragment>
                    {mutationError && !nameTakenError && (
                      <div className="alert alert-danger" role="alert">
                        {getGraphQLErrorMessage(mutationError)}
                      </div>
                    )}
                    {mutationError && nameTakenError && (
                      <div className="alert alert-danger" role="alert">
                        A project with this name already exists. Please choose another one.
                      </div>
                    )}
                    {!mutationError && mutationData && (
                      <div className="alert alert-info" role="alert">
                        {isCreating
                          ? 'The project has been created.'
                          : 'The project has been updated.'}
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
                          <label htmlFor="organization-name">
                            <T text="Organization" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Query query={organizationsQuery}>
                            {({ loading: organizationsLoading, error: organizationsError, data }) => {
                              const { getOrganizations } = data || { getOrganizations: { data: [] } };
                              const options = !organizationsLoading && !organizationsError
                                ? getOrganizationsOptions(getOrganizations?.data || [])
                                : [];

                              return (
                                <Fragment>
                                  <Select
                                    type="text"
                                    field="organizationId"
                                    id="organization-name"
                                    placeholder="Select an organization"
                                    options={options}
                                    // We reset the initiative each time we update the
                                    // organization to not enter an incorrect state
                                    onChange={() => formApi.setValue('initiative', null)}
                                    required
                                    validate={requiredValidation}
                                    disabled={!isCreating && !canUpdate}
                                  />
                                </Fragment>
                              );
                            }}
                          </Query>
                        </div>
                      </div>
                      {!isCreating && (
                        <div className="col-sm-12 col-md-6">
                          <div className="form-group">
                            <label htmlFor="project-id">
                              ID:
                            </label>
                            <Text
                              type="text"
                              field="id"
                              id="project-id"
                              className="form-control"
                              disabled
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12">
                        <div className="form-group">
                          <label htmlFor="initiative-name">
                            <T text="Initiative" />
                            <span>:</span>
                          </label>
                          <Query query={initiativesQuery}>
                            {({ loading: initiativesLoading, error: initiativesError, data }) => {
                              const { getInitiatives } = data || { getInitiatives: { data: [] } };
                              const options = !initiativesLoading && !initiativesError
                                ? getInitiativesOptions(getInitiatives.data)
                                : [];

                              return (
                                <Fragment>
                                  <Select
                                    isMulti
                                    type="text"
                                    field="initiatives"
                                    id="initiative-name"
                                    placeholder="Select an initiative"
                                    options={options}
                                    isLoading={initiativesLoading}
                                    isClearable
                                    aria-describedby="initiative-name-help"
                                    disabled={!isCreating && (
                                      !canUpdate || !canUpdateInitiative(project)
                                    )}
                                  />
                                  <small id="initiative-name-help" className="form-text text-muted">
                                    Leave empty if the field is not applicable.
                                  </small>
                                  {!isCreating && !canUpdateInitiative(project) && (
                                    <small
                                      id="initiative-name-warning"
                                      className="form-tex text-muted"
                                    >
                                      <span className="font-weight-bold">
                                        You cannot detach the project from the current initiative.
                                      </span>{' '}
                                      Please contact the initiative owner so they can perform the
                                      operation for you or ask them to get you an editor role on the
                                      initiative so you can do it yourself.
                                    </small>
                                  )}
                                </Fragment>
                              );
                            }}
                          </Query>
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-name">
                            <T text="Project name" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Text
                            type="text"
                            field="name"
                            id="project-name"
                            className="form-control"
                            maxLength="400"
                            required
                            validate={requiredValidation}
                            disabled={!isCreating && !canUpdate}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-url">
                            <T text="Website" />
                            <span>:</span>
                          </label>
                          <Text
                            type="text"
                            field="projectUrl"
                            id="project-url"
                            className="form-control"
                            maxLength="255"
                            validate={urlValidation}
                            aria-describedby="project-url-help"
                            disabled={!isCreating && !canUpdate}
                          />
                          <small id="project-url-help" className="form-text text-muted">
                            If the project has a dedicated website, please list it here. E.g.,
                            https://wildlifeinsights.org
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-shortname">
                            <T text="Short name" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Text
                            type="text"
                            field="shortName"
                            id="project-shortname"
                            className="form-control"
                            maxLength="43"
                            aria-describedby="project-shortname-help"
                            validate={requiredValidation}
                            disabled={!isCreating && !canUpdate}
                          />
                          <small id="project-shortname-help" className="form-text text-muted">
                            A short name that uniquely identifies the project. This name will be
                            used as a display on the Explore page and within your own account.
                          </small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <ProjectTypeModal
                          open={projectTypeModalOpen}
                          onClose={() => this.onCloseProjectTypeModal()}
                        />
                        <div className="form-group">
                          <label htmlFor="project-type">
                            <T text="Project type" />
                            <span>:</span>
                            <span className="required-icon">*</span>
                          </label>
                          <Select
                            type="text"
                            field="projectType"
                            id="project-type"
                            placeholder="Select a project type"
                            options={PROJECT_TYPES}
                            isClearable
                            aria-describedby="project-type-help"
                            disabled={!isCreating}
                            validate={requiredValidation}
                          />
                          <small id="project-type-help" className="form-text text-muted">
                            <T text="Read more about types of projects" />{' '}
                            <button
                              type="button"
                              className="btn btn-link p-0 m-0 d-inline align-baseline"
                              onClick={() => this.onClickOpenProjectTypeModal()}
                            >
                              <span className="small">
                                <T text="here" />
                              </span>
                            </button>
                            .
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-metadata-admin">
                            <T text="Project Admin" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Text
                            type="text"
                            field="metadata.project_admin"
                            id="project-metadata-admin"
                            className="form-control"
                            maxLength="255"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-metadata-admin-email">
                            <T text="Project Admin Email" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Text
                            type="email"
                            field="metadata.project_admin_email"
                            id="project-metadata-admin-email"
                            className="form-control"
                            maxLength="255"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={value => requiredValidation(value) || emailValidation(value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="project-metadata-country-code">
                            <T text="Country" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="metadata.country_code"
                            id="project-metadata-country-code"
                            placeholder={translateText('Select a country')}
                            options={getCountriesOptions()}
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-start-date">
                            <T text="Start date" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <DatePicker
                            field="startDate"
                            id="project-start-date"
                            className="form-control"
                            required
                            validate={requiredValidation}
                            before={formState.values.endDate}
                            disabled={!isCreating && !canUpdate}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-end-date">
                            <T text="End date" />
                            <span>:</span>
                          </label>
                          <DatePicker
                            field="endDate"
                            id="project-end-date"
                            className="form-control"
                            after={formState.values.startDate}
                            disabled={!isCreating && !canUpdate}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <ProjectLicenseModal
                        open={licenseModalOpen}
                        onClose={() => this.onCloseLicenseModal()}
                      />
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-metadata-license">
                            <T text="Metadata license" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="metadataLicense"
                            id="project-metadata-license"
                            placeholder={translateText('Select a license')}
                            options={PROJECT_METADATA_LICENSES}
                            isClearable
                            aria-describedby="project-metadata-license-help"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                          <small
                            id="project-metadata-license-help"
                            className="form-text text-muted"
                          >
                            <T text="Please note that, irrespective of your license designation, the Wildlife Insights" />{' '}
                            <Link route="terms">
                              <a target="_blank">
                                <T text="Terms of Use" />
                              </a>
                            </Link>{' '}
                            <T text="grants certain additional data use rights to Wildlife Insights. See Terms of Use Section 6(B) for details." />
                            <br />
                            <T text="Read more about Creative Commons Licenses" />{' '}
                            <button
                              type="button"
                              className="btn btn-link p-0 m-0 d-inline align-baseline"
                              onClick={() => this.onClickOpenLicenseModal()}
                            >
                              <span className="small">
                                <T text="here" />
                              </span>
                            </button>
                            .
                          </small>
                        </div>
                      </div>
                      <div className="col-sm-12 col-md-6">
                        <div className="form-group">
                          <label htmlFor="project-image-license">
                            <T text="Photos license" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="dataFilesLicense"
                            id="project-image-license"
                            placeholder={translateText('Select a license')}
                            options={PROJECT_DATAFILES_LICENSES}
                            isClearable
                            aria-describedby="project-image-license-help"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                          <small
                            id="project-image-license-help"
                            className="form-text text-muted"
                          >
                            <T text="Please note that, irrespective of your license designation, the Wildlife Insights" />{' '}
                            <Link route="terms">
                              <a target="_blank">
                                <T text="Terms of Use" />
                              </a>
                            </Link>{' '}
                            <T text="grants certain additional data use rights to Wildlife Insights. See Terms of Use Section 6(B) for details." />
                            <br />
                            <T text="Read more about Creative Commons Licenses" />{' '}
                            <button
                              type="button"
                              className="btn btn-link p-0 m-0 d-inline align-baseline"
                              onClick={() => this.onClickOpenLicenseModal()}
                            >
                              <span className="small">
                                <T text="here" />
                              </span>
                            </button>
                            .
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-objectives">
                        <T text="Objectives" />{' '}
                        <span className="required-icon">*</span>
                        <span>:</span>
                      </label>
                      <TextArea
                        field="objectives"
                        id="project-objectives"
                        className="form-control"
                        maxLength="255"
                        aria-describedby="project-objectives-help"
                        disabled={!isCreating && !canUpdate}
                        required
                        validate={requiredValidation}
                      />
                      <small id="project-objectives-help" className="form-text text-muted">
                        Description of goals and objectives.
                      </small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-credit-line">
                        <T text="Credit line" />
                        <span>:</span>
                      </label>
                      <TextArea
                        field="projectCreditLine"
                        id="project-credit-line"
                        className="form-control"
                        aria-describedby="project-credit-line-help"
                        disabled={!isCreating && !canUpdate}
                      />
                      <small id="project-credit-line-help" className="form-text text-muted">
                        If you would like to specify the individuals who are credited in the
                        citation generated by Wildlife Insights, enter their names here.
                        Please enter their names in the following format: Last name,
                        First and Middle name initials. If this field is blank, Wildlife
                        Insights will generate a citation crediting the owners of this project.
                      </small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-aknowledgements">
                        <T text="Acknowledgements" />
                        <span>:</span>
                      </label>
                      <TextArea
                        field="acknowledgements"
                        id="project-aknowledgements"
                        className="form-control"
                        maxLength="255"
                        aria-describedby="project-aknowledgements-help"
                        disabled={!isCreating && !canUpdate}
                      />
                      <small id="project-aknowledgements-help" className="form-text text-muted">
                        If you would like to acknowledge contributors to the project, please
                        enter their information here. This information will be made publicly
                        available.
                      </small>
                    </div>
                    <div className="form-group">
                      <ProjectEmbargoModal
                        open={embargoModalOpen}
                        onClose={this.onCloseEmbargoModal}
                      />
                      <label htmlFor="project-embargo">
                        <T text="Embargo" />
                        <span>:</span>
                      </label>
                      <div className="input-group">
                        <div className="input-container">
                          <Text
                            type="number"
                            field="embargo"
                            id="project-embargo"
                            className="form-control"
                            aria-describedby="project-embargo-addon project-embargo-help"
                            min={0}
                            max={MAX_EMBARGO}
                            validate={numberValidation(0, MAX_EMBARGO)}
                            disabled={!isCreating && !canUpdate}
                          />
                        </div>
                        <div className="input-group-append">
                          <span className="input-group-text" id="project-embargo-addon">
                            months
                          </span>
                        </div>
                      </div>
                      <small id="project-embargo-help" className="form-text text-muted">
                        <T text={`You may choose to embargo data for all camera deployments in a project for up to ${MAX_EMBARGO} months from the date of entry into WI. Please specify the number of months or leave empty if you would like to make your data and images public immediately. Embargoes are applied to deployments separately and the embargo start date is the date the first image was uploaded to Wildlife Insights.`} />
                        {project.embargo > 0 && new Date() < new Date(project.embargoDate) &&
                          (
                            <div>
                              <br />
                              <b>Your data will begin releasing from the embargo on {project.embargoDate}</b>
                            </div>
                          )
                        }
                      </small>
                    </div>
                    {isValidEmbargo(formState.values.embargo) && (
                      <div className="form-group form-check mt-4">
                        <label htmlFor="project-embargo-confirmation">
                          <Checkbox
                            field="embargoConfirmation"
                            id="project-embargo-confirmation"
                            className="form-check-input"
                            aria-describedby="project-embargo-confirmation-help"
                            disabled={!isCreating && !canUpdate}
                          />
                          <span className="form-check-label">
                            By clicking this box, I authorize Wildlife Insights and Wildlife
                            Insights core members to use my embargoed data to produce derived
                            products for peer-reviewed publications.
                          </span>
                        </label>
                        <small
                          id="project-embargo-confirmation-help"
                          className="form-text text-muted"
                        >
                          <T text="Wildlife Insights and Wildlife Insights core members may use your embargoed data to create derived products, as stated in the" />{' '}
                          <Link route="terms">
                            <a target="_blank" rel="noopener noreferrer">
                              <T text="Terms of Use" />
                            </a>
                          </Link>
                          .{' '}
                          <T text="These derived products may be used in the WI website, in presentations or reports and will always provide appropriate attribution. Derived products will never present project-level results without permission of the data owner and will never be published in peer review publications unless your consent is provided below. You can find additional background and examples of derived products" />{' '}
                          <button
                            type="button"
                            className="btn btn-link p-0 m-0 d-inline align-baseline"
                            onClick={this.onClickOpenEmbargoModal}
                          >
                            <span className="small">
                              <T text="here" />
                            </span>
                          </button>
                          .
                        </small>
                      </div>
                    )}
                    <div className="form-row">
                      <div
                        className={classnames({
                          'col-sm-12': true,
                          'col-md-6':
                            formState.values?.metadata?.project_species?.value === 'Individual',
                        })}
                      >
                        <div className="form-group">
                          <label htmlFor="project-metadata-species">
                            <T text="Project species" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="metadata.project_species"
                            id="project-metadata-species"
                            placeholder={translateText('Select a value')}
                            options={PROJECT_METADATA_SPECIES}
                            aria-describedby="project-metadata-species-help"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                          <small
                            id="project-metadata-species-help"
                            className="form-text text-muted"
                          >
                            <T text="Is your study objective to monitor or focus on single or multiple species?" />
                          </small>
                        </div>
                      </div>
                      {formState.values?.metadata?.project_species?.value === 'Individual' && (
                        <div className="col-sm-12 col-md-6">
                          <div className="form-group">
                            <label htmlFor="project-metadata-species-individual">
                              <T text="Project Species Individual" />
                              <span>:</span>
                            </label>
                            <LookupSelect
                              isMulti
                              type="text"
                              field="metadata.project_species_individual"
                              id="project-metadata-species-individual"
                              placeholder={translateText('Search and select values')}
                              fetchInitialOptions={UUIDS => getTaxonomyOptionsFromUUIDs(UUIDS, useCommonNames)
                              }
                              fetchResults={search => getTaxonomiesSearchResults(search, useCommonNames)
                              }
                              aria-describedby="project-metadata-species-individual-help"
                              disabled={!isCreating && !canUpdate}
                            />
                            <small
                              id="project-metadata-species-individual-help"
                              className="form-text text-muted"
                            >
                              <T text="If individual, which species?" />
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-metadata-individual-animal">
                        <T text="Project Individual Animals" />
                        <span>:</span>
                      </label>
                      <Select
                        type="text"
                        field="metadata.project_individual_animals"
                        id="project-metadata-individual-animal"
                        placeholder={translateText('Select a value')}
                        options={PROJECT_METADATA_INDIVIDUAL_ANIMALS}
                        aria-describedby="project-metadata-individual-animal-help"
                        disabled={!isCreating && !canUpdate}
                        isClearable
                      />
                      <small
                        id="project-metadata-individual-animal-help"
                        className="form-text text-muted"
                      >
                        <T text="Will marked individuals (or identified individuals) be a part of this project?" />
                      </small>
                    </div>
                    <div className="form-row">
                      <div
                        className={classnames({
                          'col-sm-12': true,
                          'col-md-6':
                            formState.values?.metadata?.project_sensor_layout?.value === 'Targeted',
                        })}
                      >
                        <div className="form-group">
                          <label htmlFor="project-metadata-sensor-layout">
                            <T text="Project Sensor Layout" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="metadata.project_sensor_layout"
                            id="project-metadata-sensor-layout"
                            placeholder={translateText('Select a value')}
                            options={PROJECT_METADATA_SENSOR_LAYOUT}
                            aria-describedby="project-metadata-sensor-layout-help"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                          <small
                            id="project-metadata-sensor-layout-help"
                            className="form-text text-muted"
                          >
                            <T text="What is the sensor layout or sampling design within the study area?" />
                          </small>
                        </div>
                      </div>
                      {formState.values?.metadata?.project_sensor_layout?.value === 'Targeted' && (
                        <div className="col-sm-12 col-md-6">
                          <div className="form-group">
                            <label htmlFor="project-metadata-sensor-layout-targeted-type">
                              <T text="Project Sensor Layout Targeted Type" />
                              <span>:</span>
                            </label>
                            <Text
                              type="text"
                              field="metadata.project_sensor_layout_targeted_type"
                              id="project-metadata-sensor-layout-targeted-type"
                              className="form-control"
                              disabled={!isCreating && !canUpdate}
                            />
                            <small
                              id="project-metadata-sensor-layout-targeted-type-help"
                              className="form-text text-muted"
                            >
                              <T text="If targeted, what wildlife sign or orther feature was used?" />
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-metadata-sensor-cluster">
                        <T text="Project Sensor Cluster" />{' '}
                        <span className="required-icon">*</span>
                        <span>:</span>
                      </label>
                      <Select
                        type="text"
                        field="metadata.project_sensor_cluster"
                        id="project-metadata-sensor-cluster"
                        placeholder={translateText('Select a value')}
                        options={PROJECT_METADATA_SENSOR_CLUSTER}
                        aria-describedby="project-metadata-sensor-cluster-help"
                        disabled={!isCreating && !canUpdate}
                        required
                        validate={requiredValidation}
                      />
                      <small
                        id="project-metadata-sensor-cluster-help"
                        className="form-text text-muted"
                      >
                        <T text="Were your sensors setup in pairs or clusters (groups of sensors)?" />
                      </small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-metadata-sensor-method">
                        <T text="Project Sensor Method" />{' '}
                        <span className="required-icon">*</span>
                        <span>:</span>
                      </label>
                      <Select
                        type="text"
                        field="metadata.project_sensor_method"
                        id="project-metadata-sensor-method"
                        placeholder={translateText('Select a value')}
                        options={PROJECT_METADATA_SENSOR_METHOD}
                        aria-describedby="project-metadata-sensor-method-help"
                        disabled={!isCreating && !canUpdate}
                        required
                        validate={requiredValidation}
                      />
                      <small
                        id="project-metadata-sensor-method-help"
                        className="form-text text-muted"
                      >
                        <T text="Is your sampling based on motion sensor detection only or also time lapse?" />
                      </small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="project-metadata-blank-images">
                        <T text="Project Blank Images Removed" />{' '}
                        <span className="required-icon">*</span>
                        <span>:</span>
                      </label>
                      <Select
                        type="text"
                        field="metadata.project_blank_images"
                        id="project-metadata-blank-images"
                        placeholder={translateText('Select a value')}
                        options={PROJECT_METADATA_BLANK_IMAGES}
                        aria-describedby="project-metadata-blank-images-help"
                        disabled={!isCreating && !canUpdate}
                        required
                        validate={requiredValidation}
                      />
                      <small
                        id="project-metadata-blank-images-help"
                        className="form-text text-muted"
                      >
                        <T text="Were blank images removed from this dataset?" />
                      </small>
                    </div>
                    <div className="form-row">
                      <div
                        className={classnames({
                          'col-sm-12': true,
                          'col-md-6': formState.values?.metadata?.project_bait_use?.value === 'Yes',
                        })}
                      >
                        <div className="form-group">
                          <label htmlFor="project-metadata-bait-use">
                            <T text="Project Bait Use" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="metadata.project_bait_use"
                            id="project-metadata-bait-use"
                            placeholder={translateText('Select a value')}
                            options={PROJECT_METADATA_BAIT_USE}
                            aria-describedby="project-metadata-bait-use-help"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                          <small
                            id="project-metadata-bait-use-help"
                            className="form-text text-muted"
                          >
                            <T text="Were sensors baited at all or some of my camera deployment locations?" />
                          </small>
                        </div>
                      </div>
                      {formState.values?.metadata?.project_bait_use?.value === 'Yes' && (
                        <div className="col-sm-12 col-md-6">
                          <div className="form-group">
                            <label htmlFor="project-metadata-bait-type">
                              <T text="Project Bait Type" />
                              <span className="required-icon">*</span>
                              <span>:</span>
                            </label>
                            <Select
                              type="text"
                              field="metadata.project_bait_type"
                              id="project-metadata-bait-type"
                              placeholder={translateText('Select a value')}
                              options={PROJECT_METADATA_BAIT_TYPE}
                              aria-describedby="project-metadata-bait-type-help"
                              disabled={!isCreating && !canUpdate}
                              required
                              validate={requiredValidation}
                              isClearable
                            />
                            <small
                              id="project-metadata-bait-type-help"
                              className="form-text text-muted"
                            >
                              <T text="If yes, what bait?" />
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
                            formState.values?.metadata?.project_stratification?.value === 'Yes',
                        })}
                      >
                        <div className="form-group">
                          <label htmlFor="project-metadata-stratification">
                            <T text="Project Stratification" />{' '}
                            <span className="required-icon">*</span>
                            <span>:</span>
                          </label>
                          <Select
                            type="text"
                            field="metadata.project_stratification"
                            id="project-metadata-stratification"
                            placeholder={translateText('Select a value')}
                            options={PROJECT_METADATA_STRATIFICATION}
                            aria-describedby="project-metadata-stratification-help"
                            disabled={!isCreating && !canUpdate}
                            required
                            validate={requiredValidation}
                          />
                          <small
                            id="project-metadata-stratification-help"
                            className="form-text text-muted"
                          >
                            <T text="Are your sensors distributed along different habitat types, legal zones (e.g. protected area vs. not protected) or other biophysical features (e.g. elevation, rainfall, etc.)?" />
                          </small>
                        </div>
                      </div>
                      {formState.values?.metadata?.project_stratification?.value === 'Yes' && (
                        <div className="col-sm-12 col-md-6">
                          <div className="form-group">
                            <label htmlFor="project-metadata-stratification-type">
                              <T text="Project Stratification Type" />
                              <span>:</span>
                            </label>
                            <Text
                              type="text"
                              field="metadata.project_stratification_type"
                              id="project-metadata-stratification-type"
                              className="form-control"
                              disabled={!isCreating && !canUpdate}
                              aria-describedby="project-metadata-stratification-type-help"
                            />
                            <small
                              id="project-metadata-stratification-type-help"
                              className="form-text text-muted"
                            >
                              <T text="If yes, list the strata" />
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <fieldset>
                        <legend>Settings</legend>
                        <div className="form-row mt-4">
                          <div className="col-sm-12">
                            <div className="form-group form-check">
                              <label htmlFor="project-human-identification">
                                <Checkbox
                                  field="deleteDataFilesWithIdentifiedHumans"
                                  id="project-human-identification"
                                  className="form-check-input"
                                  aria-describedby="project-human-identification-help"
                                  disabled={!isCreating && !canUpdate}
                                />
                                <span className="form-check-label">
                                  Automatically delete the photos identified with humans
                                </span>
                              </label>
                              <small
                                id="project-human-identification-help"
                                className="form-text text-muted mt-0"
                              >
                                Previously identified photos {"won't"} be affected. If you wish them to be
                                deleted, identify them again.
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="col-sm-12">
                            <div className="form-group form-check">
                              <label htmlFor="project-count-optional">
                                <Checkbox
                                  field="disableCount"
                                  id="project-count-optional"
                                  className="form-check-input"
                                  aria-describedby="project-count-optional-help"
                                  disabled={!isCreating && !canUpdate}
                                />
                                <span className="form-check-label">
                                  Count is optional
                                </span>
                              </label>
                              <small
                                id="project-count-optional"
                                className="form-text text-muted mt-0"
                              >
                                If selected, the Count will not be displayed in model results and will not be required.
                              </small>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                    {(isCreating || canUpdate) && (
                      <div className="form-actions">
                        {mutationLoading ? (
                          <button type="submit" className="btn btn-primary" disabled>
                            {isCreating ? 'Creating...' : 'Updating...'}
                          </button>
                        ) : (
                          <button type="submit" className="btn btn-primary">
                            {isCreating ? 'Create' : 'Save changes'}
                          </button>
                        )}
                      </div>
                    )}
                  </Fragment>
                )}
              </Form>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default ProjectForm;
