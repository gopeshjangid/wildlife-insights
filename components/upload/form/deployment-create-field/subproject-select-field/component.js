import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import T from 'components/transifex/translate';
import { getAuthApolloClient } from 'lib/initApollo';
import { getGraphQLErrorMessage } from 'utils/functions';
import { GQL_DEFAULT } from 'utils/app-constants';

import { LookupSelect } from 'components/form';
import getSubprojectsQuery from './getSubprojects.graphql';

class SubprojectSelectField extends PureComponent {
  static propTypes = {
    projectId: PropTypes.string
  };

  static defaultProps = {
    projectId: null
  };

  state = {
    error: null,
    thereAreSubprojects: false
  };

  getSubprojectsList = search => {
    const { projectId } = this.props;

    if (!projectId) {
      return Promise.resolve([]);
    }

    this.setState({
      error: null,
    });

    const gqlClient = getAuthApolloClient(GQL_DEFAULT);

    return gqlClient.query({
      query: getSubprojectsQuery,
      variables: {
        projectId: +projectId,
        filters: { name: search || '' }
      }
    }).then(resp => {
      const data = get(resp, 'data.getSubProjectsByProject.data') || [];

      if (!search) {
        this.setState({
          thereAreSubprojects: data && data.length
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
    const { projectId } = this.props;
    const { thereAreSubprojects, error } = this.state;

    return (
      <div className="form-group">
        <label htmlFor="deployment-subproject">
          <T text="Subproject" />{' '}
        </label>
        <LookupSelect
          // key added so that component gets rerendered 
          // on project selection change
          key={projectId ? projectId + '-subproject' : 'projectValue-subproject'}
          isClearable
          type="text"
          disabled={!projectId}
          field="subProjectOption"
          id="deployment-subproject"
          placeholder="Select a subproject"
          fetchInitialOptions={() => []}
          fetchResults={search => this.getSubprojectsList(search)}
          aria-describedby="deployment-subproject"
        />
        {projectId && !error && !thereAreSubprojects && (
          <small className="form-text">
            {"There isn't any subproject for this project."}
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

export default SubprojectSelectField;
