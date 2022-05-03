import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import ReactModal from 'react-modal';
import { useQuery, useMutation } from 'react-apollo-hooks';
import classnames from 'classnames';

import { exists, getGraphQLErrorMessage, translateText } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import { Form, Text, TextArea } from 'components/form';
import { requiredValidation } from 'components/form/validations';
import getSubProjectQuery from './subproject.graphql';
import createSubProjectQuery from 'components/subprojects/modal/subproject/create-subproject.graphql';
import updateSubProjectQuery from 'components/subprojects/modal/subproject/update-subproject.graphql';
import './style.scss';

const SubProjectModal = ({
  subProjectId,
  projectId,
  open,
  onClose,
  canEdit,
  onSaved,
  isCreating,
}) => {
  const [subProject, setSubProject] = useState(null);

  const { data, error, loading } = useQuery(getSubProjectQuery, {
    variables: { subProjectId },
    skip: !exists(subProjectId) || isCreating,
  });

  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(isCreating ? createSubProjectQuery : updateSubProjectQuery, {
    refetchQueries: () => ['getSubProjects'],
  });

  const onSubmit = (values) => {
    const body = {
      ...omit(values, ['id', '__typename']),
    };

    mutate({ variables: { projectId, subProjectId, body } })
      .then((respCreateSubProject) => {
        if (!respCreateSubProject.errors) {
          onSaved(respCreateSubProject);
        }
      });
  };

  useEffect(() => {
    if (!error && !loading && data?.getSubProject) {
      setSubProject(data.getSubProject);
    }
  }, [data, loading, error, setSubProject]);

  const errMsg = getGraphQLErrorMessage(mutationError);

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-subproject-modal"
      contentLabel={translateText('Subproject form')}
    >
      {loading && !subProject && (
        <div className="content-panel">
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        </div>
      )}
      {(!!subProject || isCreating) && (
        <Form onSubmit={onSubmit} initialValues={subProject ? subProject : {}} noValidate>
          <Fragment>
            <div className="content-panel">
              {mutationError && (
                <div className="alert alert-danger" role="alert">
                  {
                    isCreating ? <T text="Unable to create the subproject." />
                      : <T text="Unable to update the subproject." />
                  }
                  {' '}
                  {translateText(errMsg)}
                </div>
              )}
              {mutationData && (
                <div className="alert alert-info" role="alert">
                  {isCreating ? <T text="The subproject has been created." />
                    : <T text="The subproject has been updated." />
                  }
                </div>
              )}
              {error && (
                <div className="content-panel">
                  <div className="alert alert-danger" role="alert">
                    <T text="Unable to load the subproject. Please try again in a few minutes." />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className={classnames('col-sm-12', { 'col-md-6': subProject })}>
                  <div className="form-group">
                    <label htmlFor="subproject-name">
                      <T text="Subproject name" /> <span className="required-icon">*</span>:
                    </label>
                    <Text
                      type="text"
                      field="name"
                      id="subproject-name"
                      className="form-control"
                      required
                      maxLength="1000"
                      validate={requiredValidation}
                      disabled={!isCreating && !canEdit}
                    />
                  </div>
                </div>
                {subProject
                  && (
                    <div className="col-sm-12 col-md-6">
                      <div className="form-group">
                        <label htmlFor="subproject-id">
                          <T text="Subproject ID" />:
                        </label>
                        <Text
                          type="text"
                          field="id"
                          id="subproject-id"
                          className="form-control"
                          disabled
                        />
                      </div>
                    </div>
                  )
                }
              </div>
              <div className="form-row">
                <div className="col-sm-12 col-md-12">
                  <div className="form-group">
                    <label htmlFor="subproject-design">
                      <T text="Design" />:
                    </label>
                    <TextArea
                      field="design"
                      id="subproject-design"
                      className="form-control"
                      disabled={!isCreating && !canEdit}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="actions-panel">
              <button
                type="button"
                className="btn btn-secondary btn-alt"
                onClick={onClose}
              >
                {translateText(canEdit ? 'Cancel' : 'Close')}
              </button>
              {canEdit && (
                <button
                  type="submit"
                  className="btn btn-primary btn-alt"
                  disabled={mutationLoading}
                >
                  {
                    mutationLoading ? translateText(isCreating ? 'Creating...' : 'Updating...')
                      : translateText(isCreating ? 'Create' : 'Save changes')
                  }
                </button>
              )}
            </div>
          </Fragment>
        </Form>
      )}
    </ReactModal>
  );
};

SubProjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  subProjectId: PropTypes.number,
  projectId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  canEdit: PropTypes.bool.isRequired,
  onSaved: PropTypes.func,
  isCreating: PropTypes.bool.isRequired,
};

SubProjectModal.defaultProps = {
  subProjectId: null,
  onClose: () => { },
  onSaved: () => { },
};

export default SubProjectModal;
