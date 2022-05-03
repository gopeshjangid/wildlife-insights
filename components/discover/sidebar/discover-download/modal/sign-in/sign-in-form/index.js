import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { signInRequest } from 'modules/auth/actions';
import { Form, Text } from 'components/form';
import { Link, Router } from 'lib/routes';
import LoadingSpinner from 'components/loading-spinner';
import {
  emailValidation,
  requiredValidation,
} from 'components/form/validations';
import './style.scss';

class SignInForm extends PureComponent {
  static propTypes = {
    auth: PropTypes.shape({
      authenticated: PropTypes.bool,
      errors: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
      loading: PropTypes.bool,
      status: PropTypes.string,
    }),
    logInRequest: PropTypes.func,
  };

  static defaultProps = {
    auth: {
      authenticated: false,
      errors: null,
      loading: false,
      status: null,
    },
    logInRequest: () => {
    },
  };

  state = {
    clicked: false,
  };

  componentDidUpdate() {
    const { auth } = this.props;
    const { status, authenticated, loading } = auth;
    if (!loading && status === 'success' && authenticated) {
      Router.replaceRoute('discover');
    }
  }

  onSubmit(values) {
    const { logInRequest } = this.props;
    this.setState({ clicked: true });
    logInRequest(values);
  }

  render() {
    const { auth } = this.props;
    const { clicked } = this.state;
    const { loading, status, errors } = auth;

    return (
      <div className="signin-form row text-left">
        <div className="col col-md-12">
          <div className="auth-page-form">
            {
              !loading && clicked && status === 'error' && errors.map(({ title }) => (
                <div
                  className="alert alert-danger"
                  role="alert"
                  key={title.toLowerCase()}
                >
                  {title}
                </div>
              ))
            }
            <Form
              onSubmit={values => this.onSubmit(values)}
              noValidate
              method="post"
            >
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <div className="no-account">{'Don\'t have an account?'}</div>
                <div className="join">
                  <Link route="/join"><a target="_signup">Sign up to Wildlife Insights</a></Link>
                </div>
              </div>
              <div className="form-actions">
                {
                  loading
                    ? (
                      <div className="spinner">
                        <LoadingSpinner inline />
                      </div>
                    )
                    : (
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        Sign in
                      </button>
                    )
                }
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default connect(mapStateToProps, { logInRequest: signInRequest })(
  SignInForm,
);
