import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import T from 'components/transifex/translate';
import { getAuthApolloClient } from 'lib/initApollo';
import { getGraphQLErrorMessage } from 'utils/functions';
import { GQL_DEFAULT } from 'utils/app-constants';

import { LookupSelect } from 'components/form';
import { requiredValidation } from 'components/form/validations';
import getDevicesQuery from 'components/deployments/modal/deployment/devices.graphql';

class DeviceSelectField extends PureComponent {
  static propTypes = {
    projectId: PropTypes.string,
    organizationId: PropTypes.number
  };

  static defaultProps = {
    projectId: null,
    organizationId: null
  };

  state = {
    error: null,
    thereAreDevices: false
  };

  getDevicesList = search => {
    const { projectId, organizationId } = this.props;

    if (!projectId || !organizationId) {
      return Promise.resolve([]);
    }

    this.setState({
      error: null,
    });

    const gqlClient = getAuthApolloClient(GQL_DEFAULT);

    return gqlClient.query({
      query: getDevicesQuery,
      variables: {
        projectId: +projectId,
        organizationId: +organizationId,
        filters: { name: search || '' }
      }
    }).then(resp => {
      const data = get(resp, 'data.getDevices.data') || [];

      if (!search) {
        this.setState({
          thereAreDevices: data && data.length
        });
      }

      return data.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
    }).catch(err => {
      this.setState({
        error: getGraphQLErrorMessage(err)
      });

      return [];
    });
  };

  render() {
    const { projectId, organizationId } = this.props;
    const { thereAreDevices, error } = this.state;

    return (
      <div className="form-group">
        <label htmlFor="deployment-device">
          <T text="Camera" />{' '}
          <span className="required-icon">*</span>:
        </label>
        <LookupSelect
          // key added so that component gets rerendered 
          // on project selection change
          key={projectId ? projectId + '-device' : 'projectValue-device'}
          isClearable
          type="text"
          disabled={!projectId || !organizationId}
          field="deviceOption"
          id="deployment-device"
          placeholder="Select a camera"
          fetchInitialOptions={() => []}
          fetchResults={search => this.getDevicesList(search)}
          aria-describedby="deployment-device-help"
          validate={requiredValidation}
        />
        {projectId && organizationId && !error && !thereAreDevices && (
          <small className="form-text">
            {"There isn't any camera for this project."}
          </small>
        )}
        {error && (
          <small className="form-text alert-danger err-msg-small">
            {error}
          </small>
        )}
      </div>
    );
  }
}

export default DeviceSelectField;
