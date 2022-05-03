import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Text, TextArea, Checkbox } from 'informed';
import { Link } from 'lib/routes';
import { userSaveRequest } from 'modules/user/actions';
import { isAdminUser, isWhitelistedUser } from 'modules/user/helpers';
import SimplePage from 'layout/simple-page';
import Head from 'layout/head';
import LoadingSpinner from 'components/loading-spinner';
import PermissionPage from './permissions';

class ProfilePage extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({
      data: PropTypes.object,
      errors: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
      isSaving: PropTypes.bool,
      savingStatus: PropTypes.string,
    }),
    isUserAdmin: PropTypes.bool.isRequired,
    isUserWhitelisted: PropTypes.bool.isRequired,
    languages: PropTypes.shape({
      current: PropTypes.string,
      list: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
      ),
    }),
    profileSave: PropTypes.func,
  };

  static defaultProps = {
    user: { data: null, errors: null, isSaving: false, savingStatus: null },
    languages: { current: 'en' },
    profileSave: () => {
    },
  };

  onSubmit(values) {
    const { profileSave } = this.props;
    profileSave(values);
  }

  render() {
    const { user, isUserAdmin, isUserWhitelisted } = this.props;
    const { data, errors, isSaving, savingStatus } = user;
    return (
      <SimplePage>
        <Head title="Account details" />
        <div className="sign-up-content">
          <h1>Account details</h1>
          {
            isSaving && (
              <div className="text-center">
                <LoadingSpinner inline />
              </div>
            )
          }
          {
            !isSaving && savingStatus === 'error' && errors.map(({ title }) => (
              <div
                className="alert alert-danger"
                role="alert"
                key={title.toLowerCase()}
              >
                {title}
              </div>
            ))
          }
          {
            !isSaving && savingStatus === 'success' && (
              <div className="alert alert-success" role="alert">
                User saved successfully.
              </div>
            )
          }
          {
            !isSaving && (
              <Form
                onSubmit={values => this.onSubmit(values)}
                initialValues={data}
              >
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-firstname">
                        First name <span className="required-icon">*</span>:
                      </label>
                      <Text
                        type="text"
                        field="firstName"
                        id="sign-up-firstname"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-lastname">
                        Last name:
                      </label>
                      <Text
                        type="text"
                        field="lastName"
                        id="sign-up-lastname"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-email">
                        Email <span className="required-icon">*</span>:
                      </label>
                      <Text
                        type="email"
                        field="email"
                        id="sign-up-email"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-phone">
                        Phone number:
                      </label>
                      <Text
                        type="text"
                        field="phone"
                        id="sign-up-phone"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="sign-up-address">
                    Street address:
                  </label>
                  <TextArea
                    field="streetAddress"
                    id="sign-up-address"
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-country-code">
                        Country code:
                      </label>
                      <Text
                        type="text"
                        field="countryCode"
                        id="sign-up-country-code"
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-state">
                        State:
                      </label>
                      <Text
                        type="text"
                        field="state"
                        id="sign-up-state"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-city">
                        City:
                      </label>
                      <Text
                        type="text"
                        field="city"
                        id="sign-up-city"
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div className="form-group">
                      <label htmlFor="sign-up-postal-code">
                        Postal code:
                      </label>
                      <Text
                        type="text"
                        field="postalCode"
                        id="sign-up-postal-code"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                {!isUserAdmin && (
                  <div className="form-row mt-4">
                    <div className="col-sm-12">
                      <div className="form-group form-check">
                        <label htmlFor="sign-up-common-names">
                          <Checkbox
                            field="useCommonNames"
                            id="sign-up-common-names"
                            className="form-check-input"
                            aria-describedby="sign-up-common-names-help"
                          />
                          <span className="form-check-label">
                            Use common names
                          </span>
                        </label>
                        <div id="sign-up-common-names-help" className="form-text text-muted mt-0">
                          Whenever possible, the common name of the species will be used instead of the scientific one.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className="form-actions d-flex justify-content-between align-items-center"
                >
                  <p>
                    Read the
                    {' '}
                    <Link route="terms-of-service">
                      <a target="_blank">Terms of Service</a>
                    </Link>
                    {' '}
                    and
                    {' '}
                    <Link route="privacy-policy">
                      <a target="_blank">Privacy Policy</a>
                    </Link>
                  </p>
                  <button type="submit" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </Form>
            )
          }
          <PermissionPage isUserWhitelisted={isUserWhitelisted} />
        </div>
      </SimplePage>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  isUserAdmin: isAdminUser(state.user),
  isUserWhitelisted: isWhitelistedUser(state.user),
  languages: state.languages,
});

export default connect(mapStateToProps, { profileSave: userSaveRequest })(
  ProfilePage,
);
