import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Head from 'layout/head';
import { signInRequest } from 'modules/auth/actions';
import { Form, Text } from 'components/form';
import routes, { Link } from 'lib/routes';
import AuthPage from 'layout/auth-page';
import LoadingSpinner from 'components/loading-spinner';
import {
  emailValidation,
  requiredValidation,
} from 'components/form/validations';
import './style.scss';

class SignInPage extends PureComponent {
  static propTypes = {
    auth: PropTypes.shape({
      authenticated: PropTypes.bool,
      errors: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
      loading: PropTypes.bool,
      status: PropTypes.string,
      token: PropTypes.string,
    }),
    callback: PropTypes.string,
    logInRequest: PropTypes.func,
  };

  static defaultProps = {
    auth: {
      authenticated: false,
      errors: null,
      loading: false,
      status: null,
      token: null,
    },
    callback: null,
    logInRequest: () => {
    },
  };

  componentDidUpdate() {
    const { auth, callback } = this.props;
    const { status, authenticated, loading } = auth;

    if (!loading && status === 'success' && authenticated) {
      if (callback) {
        const callbackUrl = decodeURIComponent(callback);
        window.location.replace(callbackUrl);
      } else {
        // Don't use pushRoute for login
        const { pattern } = routes.findByName('manage');
        window.location.replace(pattern.replace(':tab?', 'summary'));
      }
    }
  }

  onSubmit(values) {
    const { logInRequest } = this.props;
    logInRequest(values);
  }

  render() {
    const { auth } = this.props;
    const { loading, status, errors } = auth;

    return (
      <AuthPage className="page-sign-in">
        <Head title="Sign In" />
        <div className="row justify-content-center">
          <div className="col col-md-6">
            <h1 className="text-center">Sign In</h1>
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
                status === 'success' && (
                  <div className="alert alert-success" role="alert">
                    You{"'"}ve been logged successfully.
                  </div>
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
                !loading && status !== 'success' && (
                  <Form
                    onSubmit={values => this.onSubmit(values)}
                    noValidate
                    method="post"
                  >
                    <Fragment>
                      <div className="form-group">
                        <label htmlFor="sign-in-email">
                          <span>Email</span> <span className="required-icon">*</span>
                        </label>
                        <Text
                          autoFocus
                          field="email"
                          id="sign-in-email"
                          placeholder="Email address"
                          validate={value => requiredValidation(value) || emailValidation(value)}
                          type="email"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="sign-in-password">
                          <span>Password</span> <span className="required-icon">*</span>
                        </label>
                        <Text
                          field="password"
                          id="sign-in-password"
                          placeholder="Password"
                          validate={requiredValidation}
                          type="password"
                        />
                      </div>
                      <div className="form-actions">
                        <Link route="/reset-password">
                          <a className="action-link">
                            Reset password
                          </a>
                        </Link>
                        <button type="submit" className="btn btn-primary">
                          Log in
                        </button>
                      </div>
                      <div>
                        <Link route={`${process.env.BACKEND_API_URL}/v1/auth/loginca`}>
                          <a className="font-weight-bold text-decoration-underline">
                            <u>Sign in with Microsoft</u>
                          </a>
                        </Link>
                      </div>
                    </Fragment>
                  </Form>
                )
              }
            </div>
            <div className="more-actions">
              <p>
                <span>{'Don\'t have an account?'} </span>
                <Link route="/join"><a>Sign up to Wildlife Insights</a></Link>
              </p>
            </div>
          </div>
        </div>
      </AuthPage>
    );
  }
}

const mapStateToProps = ({ auth, routes: { query } }) => ({
  auth,
  callback: query.to || null,
});

export default connect(mapStateToProps, { logInRequest: signInRequest })(
  SignInPage,
);
