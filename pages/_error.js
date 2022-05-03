import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ErrorPage from 'layout/error-page';

class CustomErrorPage extends PureComponent {
  static propTypes = { statusCode: PropTypes.number };

  static defaultProps = { statusCode: null };

  static getInitialProps({ res, err }) {
    const { statusCode } = res || err;
    return { statusCode };
  }

  render() {
    const { statusCode } = this.props;
    return (
      <ErrorPage>
        <h1>{statusCode}</h1>
        <p>
          {
            statusCode
              ? 'An error occurred on the server'
              : 'An error occurred on the client'
          }
        </p>
        <p>
          <a href="/" className="btn btn-primary">Go to homepage</a>
        </p>
      </ErrorPage>
    );
  }
}

export default CustomErrorPage;
