import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { LookupSelect } from 'components/form';
import { requiredValidation } from 'components/form/validations';
import { getGraphQLErrorMessage } from 'utils/functions';
import { getAuthApolloClient } from 'lib/initApollo';
import { GQL_DEFAULT } from 'utils/app-constants';

import getProjectsQuery from './getProjects.graphql';
import getProjectQuery from './getProject.graphql';

const ProjectSelectField = ({
  canUploadToProject,
  onChange,
  projectId,
  organizationId
}) => {
  const [error, setError] = useState(null);

  const getProjectsList = search => {
    setError(null);

    const gqlClient = getAuthApolloClient(GQL_DEFAULT);

    return gqlClient.query({
      query: getProjectsQuery,
      variables: {
        filters: { shortName: search || '' }
      }
    }).then(resp => {
      const data = get(resp, 'data.getProjects.data') || [];
      const projectsToConsider = data.filter(project => canUploadToProject(project.id));

      return projectsToConsider.map(({
        id,
        shortName,
        organizationId,
        taggerUpload,
        projectType
      }) => ({
        value: id,
        label: shortName,
        organizationId: organizationId,
        taggerUpload: taggerUpload,
        projectType: projectType
      }));
    }).catch(err => {
      setError(getGraphQLErrorMessage(err));
      return [];
    });
  };

  // for default dropdown option - if projectId is available 
  const getInitialProject = () => {
    if (!projectId || !organizationId || !canUploadToProject(projectId)) {
      return Promise.resolve();
    }

    const gqlClient = getAuthApolloClient(GQL_DEFAULT);

    return gqlClient.query({
      query: getProjectQuery,
      variables: {
        id: +projectId,
        organizationId: +organizationId
      }
    }).then(resp => {
      const data = get(resp, 'data.getProject') || {};

      if (data.id) {
        return {
          value: data.id,
          label: data.shortName,
          organizationId: data.organizationId,
          taggerUpload: data.taggerUpload,
          projectType: data.projectType
        }
      } else {
        return {};
      }
    }).catch(() => {
      return {};
    });
  };

  return (
    <div className="form-group">
      <label htmlFor="upload-image-project">
        Project: <span className="required-icon">*</span>
      </label>
      <LookupSelect
        key={projectId ? projectId + '-projects' : 'projectId-projects'}
        type="text"
        field="project"
        id="upload-image-project"
        onChange={onChange}
        placeholder="Select a project"
        fetchInitialOptions={() => getInitialProject()}
        fetchResults={search => getProjectsList(search)}
        validate={requiredValidation}
        initialLoadingSpinner={false}
      />
      {error && (
        <small className="form-text alert-danger err-msg-small">
          {error}
        </small>
      )}
    </div>
  );
};

ProjectSelectField.propTypes = {
  canUploadToProject: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  projectId: PropTypes.string,
  organizationId: PropTypes.string,
};

ProjectSelectField.defaultProps = {
  onChange: () => null,
  projectId: null,
  organizationId: null
};

export default ProjectSelectField;
