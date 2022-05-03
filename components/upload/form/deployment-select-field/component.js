import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { LookupSelect } from 'components/form';
import { requiredValidation } from 'components/form/validations';
import { getGraphQLErrorMessage } from 'utils/functions';
import { getAuthApolloClient } from 'lib/initApollo';
import { GQL_DEFAULT } from 'utils/app-constants';
import getDeploymentsQuery from './getDeployments.graphql';

class DeploymentSelectField extends PureComponent {
  static propTypes = {
    project: PropTypes.shape({
      value: PropTypes.string,
      name: PropTypes.string,
    }),
  };

  static defaultProps = {
    project: null,
  };

  state = {
    error: null,
    thereAreDeployments: false
  };

  getDepoymentsList = search => {
    const { project } = this.props;

    if (!project?.value) {
      return Promise.resolve([]);
    }

    this.setState({
      error: null,
    });

    const gqlClient = getAuthApolloClient(GQL_DEFAULT);

    return gqlClient.query({
      query: getDeploymentsQuery,
      variables: {
        projectId: +project?.value,
        filters: { name: search || '' }
      }
    }).then(resp => {
      const data = get(resp, 'data.getDeploymentsByProject.data') || [];

      if (!search) {
        this.setState({
          thereAreDeployments: data && data.length
        });
      }

      return data.map(({ id, deploymentName }) => ({
        label: deploymentName,
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
    const { project } = this.props;
    const { thereAreDeployments, error } = this.state;

    return (
      <div className="form-row">
        <div className="col-sm-12">
          <div className="form-group">
            <label htmlFor="upload-image-deployment">
              Camera deployment: <span className="required-icon">*</span>
            </label>
            <LookupSelect
              // key added so that component gets rerendered 
              // on project selection change
              key={project?.value ? project.value + '-deployment' : 'projectValue-deployment'}
              isClearable
              type="text"
              disabled={!project}
              field="deployment"
              id="upload-image-deployment"
              placeholder="Select a camera deployment"
              fetchInitialOptions={() => []}
              fetchResults={search => this.getDepoymentsList(search)}
              aria-describedby="upload-image-deployment"
              validate={requiredValidation}
            />
            {project && !error && !thereAreDeployments && (
              <small className="form-text">
                {"There isn't any camera deployment for this project."}
              </small>
            )}
            {error && (
              <small className="form-text alert-danger err-msg-small">
                {error}
              </small>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DeploymentSelectField;
