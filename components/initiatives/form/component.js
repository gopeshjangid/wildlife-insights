import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Mutation } from 'react-apollo';
import omit from 'lodash/omit';
import differenceWith from 'lodash/differenceWith';

import { smoothScroll, HEADER_HEIGHT } from 'utils/scroll';
import { exists, isValidYouTubeURL, slugify, translateText } from 'utils/functions';
import { Router, Link } from 'lib/routes';
import { Form, Text, TextArea, Select, Wysiwyg, Checkbox, Upload } from 'components/form';
import { requiredValidation, emailValidation, urlValidation } from 'components/form/validations';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import createInitiative from './create.graphql';
import updateInitiative from './update.graphql';
import {
  uploadLogo,
  deleteLogo,
  uploadCoverImage,
  uploadPhotos,
  uploadLogos,
  deleteCoverImage,
  shouldUploadImage,
  shouldDeleteImage,
} from './helpers';

class InitiativeForm extends PureComponent {
  static propTypes = {
    token: PropTypes.string.isRequired,
    data: PropTypes.shape({
      getOrganizations: PropTypes.object,
      getInitiative: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    // eslint-disable-line react/no-unused-prop-types
    isCreating: PropTypes.bool.isRequired,
    deletePhotos: PropTypes.func.isRequired,
    deleteLogos: PropTypes.func.isRequired,
    updateLogo: PropTypes.func.isRequired,
    deleteInitiative: PropTypes.func.isRequired,
    displayError: PropTypes.func.isRequired,
    displaySuccess: PropTypes.func.isRequired,
    canUpdate: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired,
    getOrganizationsOptions: PropTypes.func.isRequired,
    reloadUserPermissions: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: { getOrganizations: {}, getInitiative: {}, loading: false, error: null },
  }

  el = React.createRef()

  state = {
    submitting: false,
    submitError: null,
    submitSuccess: null,
  }

  async onSubmit(values, mutate) {
    const {
      isCreating,
      data: { variables, refetch },
      reloadUserPermissions,
    } = this.props;

    this.setState({ submitting: true, submitError: null, submitSuccess: null });

    try {
      // First, we create/update the initiative
      const body = omit(values, [
        'id',
        '__typename',
        'organizationId',
        'ownerOrganization',
        'logo',
        'coverImage',
        'photos',
        'partnerLogos',
      ]);

      const { data: initiativeData, errors: initiativeErrors } = await mutate({
        variables: {
          ...(isCreating ? { organizationId: +values.organizationId.value } : { id: variables.id }),
          body,
        },
      });

      if (initiativeErrors?.[0].message.includes('already exists')) {
        this.setState({
          submitError: translateText('An initiative with this name already exists. Please choose another one.')
        });
        throw new Error('controlled');
      }

      const initiativeId = isCreating
        ? +initiativeData.createInitiative.id
        : +initiativeData.updateInitiative.id;

      // Second, we upload the logo and cover image
      try {
        await this.uploadLogo(initiativeId, values);
        await this.uploadCoverImage(initiativeId, values);
      } catch (e) {
        this.setState({
          submitError: translateText('Unable to upload or delete the logo and cover image. Please try again in a few minutes.')
        });
        throw new Error('controlled');
      }

      // Third, we upload the photos
      try {
        await this.uploadPhotos(initiativeId);
      } catch (e) {
        this.setState({
          submitError: translateText('Unable to upload or delete the photos. Please try again in a few minutes.')
        });
        throw new Error('controlled');
      }

      // Fourth, we upload the partner logos
      try {
        await this.uploadPartnerLogos(initiativeId);
      } catch (e) {
        this.setState({
          submitError: translateText('Unable to upload or delete the logos of the partners. Please try again in a few minutes.')
        });
        throw new Error('controlled');
      }

      // Fifth, we navigate to the initiative or refetch it
      this.setState({
        submitSuccess: isCreating
          ? translateText('The initiative has been created.')
          : translateText('The initiative has been updated.'),
      });

      if (isCreating) {
        // We fetch the user permissions again because they will include the new entity, and then
        // we redirect them
        reloadUserPermissions().finally(() => {
          Router.pushRoute('initiatives_show', { initiativeId, tab: 'details' });
        });
      } else {
        // The refetch parameter of the <Mutation> components refetches the getInitiative query
        // of the title of the page and not the one used to populate the form
        // We absolutely need to refetch so the form is aware which images are now present in
        // the initiative
        refetch({ variables });
      }
    } catch (e) {
      if (e.message !== 'controlled') {
        this.setState({
          submitError: translateText(`Unable to ${isCreating ? 'create' : 'update'} the initiative. Please try again in a few minutes`),
        });
      }
    }

    this.setState({ submitting: false });

    // We scroll to the alert
    const bounds = this.el.current.getBoundingClientRect();
    const scroll = bounds.top + window.scrollY - HEADER_HEIGHT;
    smoothScroll(500, window.scrollY, scroll);
  }

  onClickDelete() {
    const {
      displaySuccess,
      displayError,
      deleteInitiative,
      data: { getInitiative: initiative }
    } = this.props;

    deleteInitiative({ variables: { initiativeId: +initiative.id } })
      .then(() => {
        displaySuccess({
          title: translateText('The initiative has been deleted'),
        });

        // We redirect the user to the parent organization
        const organizationId = initiative.ownerOrganization.id;
        Router.pushRoute('organizations_show', { organizationId });
      })
      .catch(() => {
        displayError({
          title: translateText('Unable to delete the initiative'),
          message: translateText('Please try again in a few minutes.'),
        });
      });
  }

  /**
   * Get the initial values of the form
   * @returns {any}
   */
  getInitialValues() {
    const {
      data: { getInitiative: initiative },
    } = this.props;
    return {
      ...initiative,
      logo: Upload.parseValue(initiative.logo),
      coverImage: Upload.parseValue(initiative.coverImage),
      photos: Upload.parseValue(initiative.photos),
      partnerLogos: Upload.parseValue(initiative.partnerLogos),
    };
  }

  /**
   * Return the list of partner logos to delete
   */
  getPartnerLogosToDelete() {
    const { isCreating } = this.props;

    if (isCreating || !this.partnerLogosValue) {
      return [];
    }

    const {
      data: { getInitiative: initiative },
    } = this.props;

    return differenceWith(
      initiative.partnerLogos,
      this.partnerLogosValue,
      (l1, l2) => l1.id === l2.id
    );
  }

  /**
   * Return the list of partner logos to upload
   */
  getPartnerLogosToUpload() {
    const { isCreating } = this.props;

    if (!this.partnerLogosValue) {
      return [];
    }

    if (isCreating) {
      return this.partnerLogosValue;
    }

    const {
      data: { getInitiative: initiative },
    } = this.props;

    return differenceWith(
      this.partnerLogosValue,
      initiative.partnerLogos,
      (l1, l2) => l1.id === l2.id
    );
  }

  /**
   * Return the list of the partnes logos to update (because of their alt text)
   * @param {Array<Object>} uploadedLogos Result of the query to upload the partner logos
   */
  getPartnerLogosToUpdate(uploadedLogos) {
    const { isCreating } = this.props;

    const logosToUpload = this.getPartnerLogosToUpload();

    const logosToUpdate = [
      ...uploadedLogos
        // We assume the order has been maintained
        .map((l, i) => ({ ...l, text: logosToUpload[i].alt }))
        .filter(l => l.text)
        .map(l => ({ ...l, alt: l.text })),
    ];

    if (!isCreating && this.partnerLogosValue) {
      const {
        data: { getInitiative: initiative },
      } = this.props;

      logosToUpdate.push(
        ...this.partnerLogosValue.filter((logo) => {
          const initiativeLogo = exists(initiative.partnerLogos)
            ? initiative.partnerLogos.find(l => l.id === logo.id)
            : null;

          if (initiativeLogo && logo.alt === '' && initiativeLogo.text === null) {
            return false;
          }

          return !!initiativeLogo && logo.alt !== initiativeLogo.text;
        })
      );
    }

    return logosToUpdate;
  }

  /**
   * Upload the cover image of the initiative
   * NOTE: this operation might be noop
   * @param {string|number} initiativeId ID of the initiative
   * @param {object} formValues Values of the form
   */
  uploadCoverImage(initiativeId, formValues) {
    const { isCreating, token, data: { getInitiative } } = this.props;

    const formImage = formValues.coverImage?.[0];
    const initiativeImage = !isCreating ? getInitiative.coverImage : null;

    return new Promise((resolve, reject) => {
      if (shouldDeleteImage(isCreating, formImage, initiativeImage)) {
        return deleteCoverImage(token, initiativeId)
          .then(resolve)
          .catch(reject);
      }
      return resolve();
    }).then(() => {
      if (shouldUploadImage(isCreating, formImage, initiativeImage)) {
        return uploadCoverImage(token, initiativeId, this.coverImageValue[0].instance);
      }
      return Promise.resolve();
    });
  }

  /**
   * Upload the logo of the initiative
   * NOTE: this operation might be noop
   * @param {string|number} initiativeId ID of the initiative
   * @param {object} formValues Values of the form
   */
  uploadLogo(initiativeId, formValues) {
    const { isCreating, token, data: { getInitiative } } = this.props;

    const formImage = formValues.logo?.[0];
    const initiativeImage = !isCreating ? getInitiative.logo : null;

    return new Promise((resolve, reject) => {
      if (shouldDeleteImage(isCreating, formImage, initiativeImage)) {
        return deleteLogo(token, initiativeId)
          .then(resolve)
          .catch(reject);
      }
      return resolve();
    }).then(() => {
      if (shouldUploadImage(isCreating, formImage, initiativeImage)) {
        return uploadLogo(token, initiativeId, this.logoValue[0].instance);
      }
      return Promise.resolve();
    });
  }

  /**
   * Upload the partner logos of the partners of the initiative
   * NOTE: this operation might be noop
   * @param {string|number} initiativeId ID of the initiative
   */
  async uploadPartnerLogos(initiativeId) {
    const { token } = this.props;

    const logosToDelete = this.getPartnerLogosToDelete();
    const logosToUpload = this.getPartnerLogosToUpload();

    if (logosToDelete.length) {
      const { deleteLogos } = this.props;
      await deleteLogos({ variables: { initiativeId, ids: logosToDelete.map(l => +l.id) } });
    }

    let uploadedLogos = [];
    if (logosToUpload.length) {
      // @ts-ignore
      ({ data: uploadedLogos } = await uploadLogos(
        token,
        initiativeId,
        logosToUpload.map(l => l.instance)
      ));
    }

    const logosToUpdate = this.getPartnerLogosToUpdate(uploadedLogos);
    if (logosToUpdate.length) {
      const { updateLogo } = this.props;

      for (let i = 0, j = logosToUpdate.length; i < j; i++) {
        const logo = logosToUpdate[i];
        // eslint-disable-next-line no-await-in-loop
        await updateLogo({
          variables: {
            initiativeId,
            id: +logo.id,
            body: {
              text: logo.alt,
            },
          },
        });
      }
    }
  }

  /**
   * Upload the photos of the initiative
   * NOTE: this operation might be noop
   * @param {string|number} initiativeId ID of the initiative
   */
  async uploadPhotos(initiativeId) {
    const { isCreating, token } = this.props;

    let photosToDelete = [];
    let photosToUpload = [];

    if (!this.photosValue) {
      return;
    }

    if (isCreating) {
      photosToUpload = this.photosValue;
    } else {
      const {
        data: { getInitiative: initiative },
      } = this.props;

      photosToUpload = differenceWith(
        this.photosValue,
        initiative.photos,
        (p1, p2) => p1.id === p2.id
      );

      photosToDelete = differenceWith(
        initiative.photos,
        this.photosValue,
        (p1, p2) => p1.id === p2.id
      );
    }

    if (photosToDelete.length) {
      const { deletePhotos } = this.props;
      await deletePhotos({ variables: { initiativeId, ids: photosToDelete.map(p => +p.id) } });
    }

    if (photosToUpload.length) {
      await uploadPhotos(token, initiativeId, photosToUpload.map(p => p.instance));
    }
  }

  render() {
    const { submitting, submitError, submitSuccess } = this.state;
    const {
      data: { loading, error, getInitiative: initiative, getOrganizations, variables },
      isCreating,
      canUpdate,
      canDelete,
      getOrganizationsOptions,
    } = this.props;

    const mutationFn = isCreating ? createInitiative : updateInitiative;

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          <T text="Unable to load the initiative. Please try again in a few minutes." />
        </div>
      );
    }

    if (loading && (!isCreating && !initiative)) {
      return (
        <div className="text-center">
          <LoadingSpinner inline />
        </div>
      );
    }

    const organizationsOptions = !loading && !error && isCreating ? getOrganizationsOptions(getOrganizations.data) : [];

    return (
      <Mutation mutation={mutationFn} refetchQueries={() => ['getInitiative', 'getInitiatives']}>
        {mutate => (
          <div ref={this.el}>
            <Form
              onSubmit={values => this.onSubmit(values, mutate)}
              initialValues={isCreating ? {} : this.getInitialValues()}
              noValidate
            >
              {submitError && (
                <div className="alert alert-danger" role="alert">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="alert alert-info" role="alert">
                  {submitSuccess}
                </div>
              )}
              <div className="form-row">
                <div className="col-sm-12">
                  <div className="alert alert-warning" role="alert">
                    <T text="Please note that all the information you fill in below is made public." />{' '}
                    {isCreating ? (
                      <T text="A public page of the initiative will be available to anyone." />
                    ) : (
                      <Fragment>
                        <Link
                          route="public_initiatives_show"
                          params={{
                            initiativeId: variables.id,
                            initiativeSlug: slugify(initiative.name),
                          }}
                        >
                          <a target="_blank"><T text="Click here" /></a>
                        </Link>{' '}
                        <T text="to see the public initiative page." />
                      </Fragment>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div
                  className={classnames({
                    'col-sm-12': true,
                    'col-md-6': !isCreating,
                  })}
                >
                  <div className="form-group">
                    <label htmlFor="organization-name">
                      <T text="Organization" /> <span className="required-icon">*</span>:
                    </label>
                    {!isCreating && (
                      <Text
                        type="text"
                        field="ownerOrganization.name"
                        id="organization-name"
                        className="form-control"
                        disabled
                      />
                    )}
                    {isCreating && (
                      <Select
                        type="text"
                        field="organizationId"
                        id="organization-name"
                        placeholder={translateText('Select an organization')}
                        options={organizationsOptions}
                        required
                        validate={requiredValidation}
                      />
                    )}
                  </div>
                </div>
                {!isCreating && (
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="initiative-id">
                        <T text="ID" />:
                      </label>
                      <Text
                        type="text"
                        field="id"
                        id="initiative-id"
                        className="form-control"
                        disabled
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="col-sm-12 col-md-6">
                  <div className="form-group">
                    <label htmlFor="initiative-name">
                      <T text="Initiative name" />{' '}
                      <span className="required-icon">*</span>:
                    </label>
                    <Text
                      type="text"
                      field="name"
                      id="initiative-name"
                      className="form-control"
                      maxLength="255"
                      required
                      validate={requiredValidation}
                      disabled={!isCreating && !canUpdate}
                    />
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="form-group">
                    <label htmlFor="initiative-email">
                      <T text="Contact email" />:
                    </label>
                    <Text
                      type="email"
                      field="contactEmail"
                      id="initiative-email"
                      className="form-control"
                      maxLength="255"
                      required
                      validate={emailValidation}
                      disabled={!isCreating && !canUpdate}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="col-sm-12 col-md-6">
                  <div className="form-group">
                    <label htmlFor="initiative-logo">
                      <T text="Logo" />:
                    </label>
                    <Upload
                      field="logo"
                      id="initiative-logo"
                      multiple={false}
                      max={Infinity}
                      onValueChange={(value) => {
                        this.logoValue = value;
                      }}
                      disabled={!isCreating && !canUpdate}
                    />
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="form-group">
                    <label htmlFor="initiative-cover-image">
                      <T text="Cover image" />:
                    </label>
                    <Upload
                      field="coverImage"
                      id="initiative-cover-image"
                      multiple={false}
                      max={Infinity}
                      onValueChange={(value) => {
                        this.coverImageValue = value;
                      }}
                      disabled={!isCreating && !canUpdate}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="initiative-description">
                  <T text="Description" />:
                </label>
                <TextArea
                  field="description"
                  id="initiative-description"
                  className="form-control"
                  aria-describedby="initiative-description-help"
                  maxLength="255"
                  disabled={!isCreating && !canUpdate}
                />
                <small id="initiative-description-help" className="form-text text-muted">
                  <T text="A sentence to explain what is the initiative about and what it does." />
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="initiative-video">
                  <T text="YouTube video URL" />:
                </label>
                <Text
                  type="url"
                  field="videoUrl"
                  id="initiative-video"
                  className="form-control"
                  aria-describedby="initiative-video-help"
                  maxLength="255"
                  validate={(value) => {
                    if (exists(urlValidation(value))) {
                      return urlValidation(value);
                    }

                    return !exists(value) || isValidYouTubeURL(value)
                      ? undefined
                      : translateText('The URL must have the following format: https://www.youtube.com/watch?v=XXX where XXX is the ID of the video.');
                  }}
                  disabled={!isCreating && !canUpdate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="initiative-introduction">
                  <T text="Introduction" />:
                </label>
                <Wysiwyg
                  field="introduction"
                  id="initiative-introduction"
                  aria-describedby="initiative-introduction-help"
                  maxLength="511"
                  disabled={!isCreating && !canUpdate}
                />
                <small id="initiative-introduction-help" className="form-text text-muted">
                  <T text="Short introduction of your initiative in more details." />
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="initiative-photos">
                  <T text="Photos" />:
                </label>
                <Upload
                  field="photos"
                  id="initiative-photos"
                  max={Infinity}
                  onValueChange={(value) => {
                    this.photosValue = value;
                  }}
                  disabled={!isCreating && !canUpdate}
                />
              </div>
              <div className="form-group form-check">
                <label htmlFor="initiative-location-public">
                  <Checkbox
                    field="isLocationPublic"
                    id="initiative-location-public"
                    aria-describedby="initiative-location-public-warning"
                    className="form-check-input"
                    disabled={!isCreating && !canUpdate}
                  />
                  <span className="form-check-label">
                    <T text="Display a map with the locations of the camera deployments on the public page" />
                  </span>
                </label>
                <div id="initiative-location-public-warning" className="font-weight-bold">
                  <T text="Please note the exact locations will be disclosed." />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="initiative-content">
                  <T text="Content" />:
                </label>
                <Wysiwyg
                  field="content"
                  id="initiative-content"
                  maxLength="1024"
                  disabled={!isCreating && !canUpdate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="initiative-contact-content">
                  <T text="Contact content" />:
                </label>
                <TextArea
                  field="contactContent"
                  id="initiative-contact-content"
                  className="form-control"
                  aria-describedby="initiative-contact-content-help"
                  maxLength="255"
                  disabled={!isCreating && !canUpdate}
                />
                <small id="initiative-contact-content-help" className="form-text text-muted">
                  <T text="A sentence to invite people to contact you." />
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="initiative-partners-logos">
                  <T text="Partners logos" />:
                </label>
                <Upload
                  field="partnerLogos"
                  id="initiative-partners-logos"
                  max={Infinity}
                  askAlternativeText
                  onValueChange={(value) => {
                    this.partnerLogosValue = value;
                  }}
                  disabled={!isCreating && !canUpdate}
                />
              </div>
              {!isCreating && canDelete && (
                <div className="form-group mt-5">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    aria-describedby="initiative-delete-1-help initiative-delete-2-help"
                    onClick={() => this.onClickDelete()}
                  >
                    <T text="Delete Initiative" />
                  </button>
                  <span id="initiative-delete-1-help" className="font-weight-bold ml-2">
                    <T text="This action can’t be undone." />
                  </span>{' '}
                  <span id="initiative-delete-2-help">
                    <T text="Projects and images associated with this initiative will not be impacted if this initiative is deleted." />
                  </span>
                </div>
              )}
              {(isCreating || canUpdate) && (
                <div className="form-actions">
                  {submitting ? (
                    <button type="submit" className="btn btn-primary" disabled>
                      {translateText(isCreating ? 'Creating...' : 'Updating...')}
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      {translateText(isCreating ? 'Create' : 'Save changes')}
                    </button>
                  )}
                </div>
              )}
            </Form>
          </div>
        )}
      </Mutation>
    );
  }
}

export default InitiativeForm;
