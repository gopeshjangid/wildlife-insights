import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Head from 'layout/head';
import { Form, Text } from 'components/form';
import { Link } from 'lib/routes';
import { requestNewPassword, resetPassword } from 'modules/reset-password/actions';
import AuthPage from 'layout/auth-page';
import LoadingSpinner from 'components/loading-spinner';
import {
  emailValidation,
  passwordValidation,
  requiredValidation,
} from 'components/form/validations';

class ResetPasswordPage extends PureComponent {
  static propTypes = {
    resetpassword: PropTypes.shape({
      errors: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
      loading: PropTypes.bool,
      status: PropTypes.string,
    }).isRequired,
    token: PropTypes.string,
    requestNewPassword: PropTypes.func.isRequired,
    resetPassword: PropTypes.func.isRequired,
  };

  static defaultProps = { token: null };

  onSubmit(values) {
    const {
      token,
      requestNewPassword: requestNew,
      resetPassword: reset,
    } = this.props;
    if (!token) {
      requestNew(values);
    } else {
      reset(values);
    }
  }

  render() {
    const { resetpassword: { loading, status, errors }, token } = this.props;

    return (
      <AuthPage className="page-sign-in">
        <Head title="Reset password" />
        <div className="row justify-content-center">
          <div className="col col-md-6">
            <h1 className="text-center">Reset password</h1>
            <div className="auth-page-form">
              {
                status === 'error' && errors.map(({ title }) => (
                  <div
                    className="alert alert-danger"
                    role="alert"
                    key={title.toLowerCase()}
                    dangerouslySetInnerHTML={{__html: title.replace(/(https?:\/\/[^\s]+)/g, "<a href='$1' target='_blank' >here</a>")}}
                  />
                ))
              }
              {
                status === 'success' && !token && (
                  <div className="alert alert-success" role="alert">
                    An email with the link to reset your password will shortly arrive in your inbox.
                  </div>
                )
              }
              {
                status === 'success' && !!token && (
                  <Fragment>
                    <div className="alert alert-success" role="alert">
                      You can now log in with your new password.
                    </div>
                    <div className="text-center mt-2">
                      <Link route="/login">
                        <a className="btn btn-primary">
                          Log in
                        </a>
                      </Link>
                    </div>
                  </Fragment>
                )
              }
              {
                loading && (
                  <div className="text-center">
                    <LoadingSpinner inline />
                  </div>
                )
              }
              {
                !loading && status !== 'success' && !token && (
                  <Fragment>
                    <p className="intro">
                      {'Fill in the email address you used for the registration and we\'ll send you an email with the link to reset your password.'}
                    </p>
                    <Form
                      onSubmit={values => this.onSubmit(values)}
                      noValidate
                    >
                      <div className="form-group">
                        <label htmlFor="sign-in-email">
                          <span>Email</span> <span className="required-icon">*</span><span>:</span>
                        </label>
                        <Text
                          autoComplete="off"
                          autoFocus
                          field="email"
                          id="sign-in-email"
                          placeholder="Email address"
                          validate={value => requiredValidation(value) || emailValidation(value)}
                          type="email"
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          Send reset link
                        </button>
                      </div>
                    </Form>
                  </Fragment>
                )
              }
              {
                !loading && status !== 'success' && !!token && (
                  <Fragment>
                    <p className="intro">
                      Please type your new password below.
                    </p>
                    <Form
                      onSubmit={values => this.onSubmit(values)}
                      noValidate
                    >
                      <div className="form-group">
                        <label htmlFor="sign-up-password">
                          <span>New password</span> <span className="required-icon">*</span><span>:</span>
                        </label>
                        <Text
                          type="password"
                          field="password"
                          id="sign-up-password"
                          min={8}
                          notify={['repeatPassword']}
                          validate={passwordValidation}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="sign-up-password-confirmation">
                          <span>Repeat password</span> <span className="required-icon">*</span><span>:</span>
                        </label>
                        <Text
                          type="password"
                          field="repeatPassword"
                          min={8}
                          id="sign-up-password-confirmation"
                          validate={passwordValidation}
                          notify={['password']}
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          Reset password
                        </button>
                      </div>
                    </Form>
                  </Fragment>
                )
              }
            </div>
            <div className="more-actions">
              <p>
                <span>{'Don\'t have an account?'} </span>
                <Link route="/join"><a>Sign up to Wildlife Insights</a></Link>
              </p>
              <p>
                <span>Already have an account? </span>
                <Link route="/login"><a>Sign in to Wildlife Insights</a></Link>
              </p>
            </div>
          </div>
        </div>
      </AuthPage>
    );
  }
}

const mapStateToProps = ({ resetpassword, routes: { query } }) => ({
  resetpassword,
  token: query.token,
});

export default connect(mapStateToProps, { requestNewPassword, resetPassword })(ResetPasswordPage);
