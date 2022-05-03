import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReCAPTCHA from 'react-google-recaptcha';

import { Link } from 'lib/routes';
import { exists } from 'utils/functions';
import { signUpRequest } from 'modules/signup/actions';
import Head from 'layout/head';
import AuthPage from 'layout/auth-page';
import { Form, Text, Checkbox } from 'components/form';
import LoadingSpinner from 'components/loading-spinner';
import {
  emailValidation,
  requiredValidation,
  requiredCheckboxValidation,
  passwordValidation,
} from 'components/form/validations';

import './style.scss';

const reCaptchaRef = React.createRef();

class SignUpPage extends PureComponent {
  static propTypes = {
    signup: PropTypes.shape({
      errors: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
      loading: PropTypes.bool,
      status: PropTypes.string,
    }),
    registerRequest: PropTypes.func,
    fromInvitation: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    signup: { errors: null, loading: false, status: null },
    registerRequest: () => {},
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    captchaValue: null,
    flagSubmit: false,
  }

  static async getInitialProps({ query }) {
    return {
      fromInvitation: exists(query['from-invitation']),
    };
  }

  onSubmit(values) {
    const { captchaValue } = this.state;
    const { registerRequest } = this.props;
    if (captchaValue) {
      registerRequest({ ...values, ageVerification: '13+_self_certified' });
    }
  }

  handleChange(value) {
    this.setState({ captchaValue: value });
  }

  render() {
    const { signup, fromInvitation } = this.props;
    const { loading, status, errors } = signup;
    const { captchaValue, flagSubmit } = this.state;
    return (
      <AuthPage className="page-sign-up">
        <Head title="Sign Up" />
        <div className="row justify-content-center">
          <div className="col col-md-6">
            <h1 className="text-center">Sign up</h1>
            <div className="auth-page-form">
              {status === 'error'
                && errors.map(({ title }) => (
                  <div className="alert alert-danger" role="alert" key={title}>
                    {title || 'Unable to create the account. Please try again in a few minutes.'}
                  </div>
                ))}
              {status === 'success' && (
                <div className="alert alert-success" role="alert">
                  <p>
                    Thank you for your interest in Wildlife Insights! {'We\'ve'} sent you an email
                    so you can verify your email address. Please check your inbox and spam filters.
                  </p>
                  <p className="mb-0">
                    Once verified, new accounts are reviewed and activated by the Wildlife Insights
                    staff, and can then be used to access the platform.
                  </p>
                </div>
              )}
              {fromInvitation && (
                <div className="alert alert-info">
                  {"You've"} been invited to Wildlife Insights!
                  <br />
                  After signing up, you will be granted access to the entities designated in the
                  email.
                </div>
              )}
              {loading && (
                <div className="text-center">
                  <LoadingSpinner inline />
                </div>
              )}
              {!loading && status !== 'success' && (
                <Form onSubmit={values => this.onSubmit(values)} noValidate>
                  <div className="form-group">
                    <label htmlFor="sign-up-firstname">
                      <span>First name</span> <span className="required-icon">*</span>
                      <span>:</span>
                    </label>
                    <Text
                      autoFocus
                      type="text"
                      field="firstName"
                      id="sign-up-firstname"
                      required
                      validate={requiredValidation}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sign-up-lastname">
                      <span>Last name</span> <span className="required-icon">*</span>
                      <span>:</span>
                    </label>
                    <Text
                      type="text"
                      field="lastName"
                      id="sign-up-lastname"
                      required
                      validate={requiredValidation}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sign-up-email">
                      <span>Email</span> <span className="required-icon">*</span>
                      <span>:</span>
                    </label>
                    <Text
                      type="email"
                      field="email"
                      id="sign-up-email"
                      required
                      validate={value => requiredValidation(value) || emailValidation(value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sign-up-password">
                      <span>Password</span> <span className="required-icon">*</span>
                      <span>:</span>
                    </label>
                    <Text
                      autoComplete="off"
                      type="password"
                      field="password"
                      id="sign-up-password"
                      required
                      min={8}
                      notify={['password-confirmation']}
                      validate={passwordValidation}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sign-up-password-confirmation">
                      <span>Repeat password</span>{' '}
                      <span className="required-icon">*</span>
                      <span>:</span>
                    </label>
                    <Text
                      autoComplete="off"
                      type="password"
                      field="password-confirmation"
                      required
                      min={8}
                      id="sign-up-password-confirmation"
                      validate={passwordValidation}
                      notify={['password']}
                    />
                  </div>
                  <div className="form-group form-check">
                    <label htmlFor="sign-up-accept-terms">
                      <Checkbox
                        field="accept-terms"
                        id="sign-up-accept-terms"
                        className="form-check-input"
                        required
                        validate={requiredCheckboxValidation}
                      />
                      <span>I agree to the </span>
                      <Link route="terms-of-service">
                        <a target="_blank">Terms of Service</a>
                      </Link>
                      <span> and </span>
                      <Link route="privacy-policy">
                        <a target="_blank">Privacy Policy</a>
                      </Link>
                      <span className="required-icon"> *</span>
                    </label>
                  </div>
                  <div className="form-group form-check">
                    <label htmlFor="sign-up-over-13">
                      <Checkbox
                        field="ageVerification"
                        id="sign-up-over-13"
                        className="form-check-input"
                        required
                        validate={requiredCheckboxValidation}
                      />
                      <span>I certify that I am 13 or older</span>
                      <span className="required-icon"> *</span>
                    </label>
                  </div>
                  <div className={classNames({ 'signup-recaptcha-error': !captchaValue && flagSubmit })}>
                    <ReCAPTCHA
                      ref={reCaptchaRef}
                      sitekey={process.env.GOOGLE_RECAPTCHA_KEY}
                      onChange={this.handleChange}
                    />
                    {!captchaValue && flagSubmit &&
                      <div className="invalid-feedback d-block">Please verify that you are not a robot.</div>
                    }
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" onClick={() => { this.setState({ flagSubmit: true }); }}>
                      Sign up
                    </button>
                  </div>
                </Form>
              )}
            </div>
            <div className="more-actions">
              <p>
                <span>Already have an account? </span>
                <Link route="/login">
                  <a>Sign in to Wildlife Insights</a>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </AuthPage>
    );
  }
}

const mapStateToProps = state => ({ signup: state.signup });

export default connect(
  mapStateToProps,
  { registerRequest: signUpRequest }
)(SignUpPage);
