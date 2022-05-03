import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { getAuthApolloClient } from 'lib/initApollo';
import { getGraphQLErrorMessage } from 'utils/functions';
import { GQL_DEFAULT } from 'utils/app-constants';

import { LookupSelect } from 'components/form';
import { requiredValidation } from 'components/form/validations';
import getLocationsQuery from './getLocations.graphql';

class LocationSelectField extends PureComponent {
  static propTypes = {
    project: PropTypes.shape({
      value: PropTypes.string,
      name: PropTypes.string,
    })
  };

  static defaultProps = {
    project: null
  };

  state = {
    error: null,
    thereAreLocations: false
  };

  getLocationsList = search => {
    const { project } = this.props;

    if (!project?.value) {
      return Promise.resolve([]);
    }

    this.setState({
      error: null,
    });

    const gqlClient = getAuthApolloClient(GQL_DEFAULT);

    return gqlClient.query({
      query: getLocationsQuery,
      variables: {
        projectId: +project?.value,
        filters: { name: search || '' }
      }
    }).then(resp => {
      const data = get(resp, 'data.getLocations.data') || [];

      if (!search) {
        this.setState({
          thereAreLocations: data && data.length
        });
      }

      return data.map(({ id, placename }) => ({
        label: placename,
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
    const { thereAreLocations, error } = this.state;

    return (
      <div className="form-row">
        <div className="col-sm-12">
          <div className="form-group">
            <label htmlFor="upload-image-location">
              Location: <span className="required-icon">*</span>
            </label>
            <LookupSelect
              // key added so that component gets rerendered 
              // on project selection change
              key={project?.value ? project.value + '-location' : 'projectValue-location'}
              isClearable
              type="text"
              disabled={!project}
              field="location"
              id="upload-image-location"
              placeholder="Select a location"
              fetchInitialOptions={() => []}
              fetchResults={search => this.getLocationsList(search)}
              aria-describedby="upload-image-location"
              validate={requiredValidation}
            />
            {project && !error && !thereAreLocations && (
              <small className="form-text">
                {"There isn't any location for this project."}
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

export default LocationSelectField;
