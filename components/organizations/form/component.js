import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import omit from 'lodash/omit';
import { Mutation } from 'react-apollo';

import { smoothScroll, HEADER_HEIGHT } from 'utils/scroll';
import { Router } from 'lib/routes';
import { Form, Text, TextArea } from 'components/form';
import LoadingSpinner from 'components/loading-spinner';
import { requiredValidation, urlValidation, emailValidation } from 'components/form/validations';
import updateOrganization from './update.graphql';
import createOrganization from './create.graphql';

class OrganizationForm extends PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      getOrganization: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    // eslint-disable-line react/no-unused-prop-types
    isCreating: PropTypes.bool.isRequired,
    organizationId: PropTypes.number,
    canUpdate: PropTypes.bool.isRequired,
    reloadUserPermissions: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: { getOrganization: {}, loading: false, error: null },
    organizationId: null,
  }

  el = React.createRef()

  onSubmit(values, mutate) {
    const { isCreating, organizationId, reloadUserPermissions } = this.props;

    const body = { ...omit(values, ['id', '__typename']) };

    mutate({
      variables: {
        ...(isCreating ? {} : { organizationId: +organizationId }),
        body,
      },
    })
      .then(({ data }) => {
        if (isCreating) {
          // We fetch the user permissions again because they will include the new entity, and then
          // we redirect them
          reloadUserPermissions().finally(() => {
            Router.pushRoute('organizations_show', {
              organizationId: data.createOrganization.id,
            });
          });
        }
      })
      .finally(() => {
        const bounds = this.el.current.getBoundingClientRect();
        const scroll = bounds.top + window.scrollY - HEADER_HEIGHT;
        smoothScroll(500, window.scrollY, scroll);
      });
  }

  render() {
    const {
      data: { loading, error, getOrganization: organization },
      isCreating,
      canUpdate,
    } = this.props;

    const mutationFn = isCreating ? createOrganization : updateOrganization;

    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          Unable to load the organization. Please try again in a few minutes.
        </div>
      );
    }

    if (loading && (!isCreating && !organization)) {
      return (
        <div className="text-center">
          <LoadingSpinner inline />
        </div>
      );
    }

    return (
      <Mutation mutation={mutationFn} refetchQueries={['getOrganization', 'getOrganizations']}>
        {(mutate, { loading: mutationLoading, error: mutationError, data: mutationData }) => {
          const nameTakenError = mutationError
            ? mutationError?.graphQLErrors?.[0].message.includes('is not unique')
            : false;

          return (
            <div ref={this.el}>
              <Form
                onSubmit={values => this.onSubmit(values, mutate)}
                initialValues={organization}
                noValidate
              >
                {mutationError && !nameTakenError && (
                  <div className="alert alert-danger" role="alert">
                    {isCreating
                      ? 'Unable to create the organization'
                      : 'Unable to update the organization'}
                    . Please try again in a few minutes.
                  </div>
                )}
                {mutationError && nameTakenError && (
                  <div className="alert alert-danger" role="alert">
                    An organization with this name already exists. Please choose another one.
                  </div>
                )}
                {!mutationError && mutationData && (
                  <div className="alert alert-info" role="alert">
                    {isCreating
                      ? 'The organization has been created.'
                      : 'The organization has been updated.'}
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
                        <span>Organization name</span>{' '}
                        <span className="required-icon">*</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="name"
                        id="organization-name"
                        className="form-control"
                        maxLength="255"
                        required
                        validate={requiredValidation}
                        disabled={!isCreating && !canUpdate}
                      />
                    </div>
                  </div>
                  {!isCreating && (
                    <div className="col-sm-12 col-md-6">
                      <div className="form-group">
                        <label htmlFor="organization-id">
                          ID:
                        </label>
                        <Text
                          type="text"
                          field="id"
                          id="organization-id"
                          className="form-control"
                          disabled
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="organization-street-adress">
                    <span>Street address</span>
                    <span>:</span>
                  </label>
                  <TextArea
                    field="streetAddress"
                    id="organization-street-adress"
                    className="form-control"
                    maxLength="255"
                    disabled={!isCreating && !canUpdate}
                  />
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-4">
                    <div className="form-group">
                      <label htmlFor="organization-country-code">
                        <span>Country code</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="countryCode"
                        id="organization-country-code"
                        className="form-control"
                        maxLength="255"
                        disabled={!isCreating && !canUpdate}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-4">
                    <div className="form-group">
                      <label htmlFor="organization-city">
                        <span>City</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="city"
                        id="organization-city"
                        className="form-control"
                        maxLength="255"
                        disabled={!isCreating && !canUpdate}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-4">
                    <div className="form-group">
                      <label htmlFor="organization-state">
                        <span>State</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="state"
                        id="organization-state"
                        className="form-control"
                        maxLength="255"
                        disabled={!isCreating && !canUpdate}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="organization-postal-code">
                        <span>Postal code</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="postalCode"
                        id="organization-postal-code"
                        className="form-control"
                        maxLength="255"
                        disabled={!isCreating && !canUpdate}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="organization-phone">
                        <span>Phone</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="phone"
                        id="organization-phone"
                        className="form-control"
                        maxLength="255"
                        disabled={!isCreating && !canUpdate}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="organization-email">
                        <span>Email</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="email"
                        id="organization-email"
                        className="form-control"
                        maxLength="255"
                        validate={emailValidation}
                        aria-describedby="organization-email-help"
                        disabled={!isCreating && !canUpdate}
                      />
                      <small id="organization-email-help" className="form-text text-muted">
                        Please enter your preferred contact email.
                      </small>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="organization-url">
                        <span>Website</span>
                        <span>:</span>
                      </label>
                      <Text
                        type="text"
                        field="organizationUrl"
                        id="organization-url"
                        className="form-control"
                        maxLength="255"
                        validate={urlValidation}
                        aria-describedby="organization-url-help"
                        disabled={!isCreating && !canUpdate}
                      />
                      <small id="organization-url-help" className="form-text text-muted">
                        {"Please enter your organization's website."}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="organization-remarks">
                    <span>Remarks</span>
                    <span>:</span>
                  </label>
                  <TextArea
                    field="remarks"
                    id="organization-remarks"
                    className="form-control"
                    aria-describedby="organization-remarks-help"
                    disabled={!isCreating && !canUpdate}
                  />
                  <small id="organization-remarks-help" className="form-text text-muted">
                    Any additional comments.
                  </small>
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
              </Form>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default OrganizationForm;
