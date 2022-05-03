import React, { Fragment, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import { useMutation, useQuery } from 'react-apollo-hooks';
import { components } from 'react-select';
import { exists, translateText, getGraphQLErrorMessage } from 'utils/functions';
import { Form, Scope, Select, Text, ToggleButton } from 'components/form';
import { emailValidation, requiredValidation } from 'components/form/validations';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import updateTaggeUpload from './mutation-tagger-upload.graphql';
import queryTaggeUpload from './quary-tagger-upload.graphql';

import {
  getFormInitialValues,
  getMutationChangeData,
  getQuery,
  getMutation,
  didMutationPerformAllChanges,
  getMutationCreateData,
  parseUsers,
  getRoleOptionsForUser,
} from './helpers';

import './style.scss';

const UsersPermissionsModal = ({
  open,
  onClose,
  concernedEntity,
  invitationRoleOptions,
  reloadUserPermissions,
  organizationId,
  isProjectOwner,
}) => {
  // Mutation state
  const [mutationError, setMutationError] = useState(false);
  const [mutationErrorObj, setMutationErrorObj] = useState({});
  const [mutationPartialError, setMutationPartialError] = useState(false);
  const [mutationSuccess, setMutationSuccess] = useState(false);
  const [mutationSuccessTaggerUpload, setMutationSuccessTaggerUpload] = useState(false);

  // Query state
  const [users, setUsers] = useState([]);
  const [valueTaggerUpload, setValueTaggerUpload] = useState(false);

  const query = getQuery(concernedEntity);
  const mutation = getMutation(concernedEntity);
  const userCanMakeChanges = useMemo(
    () => users.some(user => getRoleOptionsForUser(user).length > 1)
      || users.some(user => user.canBeRevoked),
    [users]
  );

  const { data: queryData, loading: queryLoading, error: queryError, refetch } = useQuery(query, {
    skip: !open || !concernedEntity,
    variables: { entityId: concernedEntity ? concernedEntity.id : null },
  });
  const [mutate, { loading: mutationLoading }] = useMutation(mutation);
  const [mutateTaggerUpload, { data: mutationTaggerUploadData, loading: mutationTaggerUploadLoading, error: mutationTaggerUploadError }] = useMutation(updateTaggeUpload);

  const { data: queryDataTaggerUpload, loading: queryLoadingTaggerUpload, error: queryErrorTaggerUpload, refetch: refetchQueryTaggerUpload } = useQuery(queryTaggeUpload, {
    skip: !open || !concernedEntity || concernedEntity?.type !== 'project',
    variables: { organizationId, projectId: concernedEntity ? concernedEntity.id : null },
  });

  useEffect(() => {
    if (queryLoading || queryError) {
      setUsers([]);
    } else if (queryData) {
      const key = Object.keys(queryData)[0];
      if (queryData[key]) {
        setUsers(parseUsers(queryData[key]));
      }
    }
  }, [queryData, queryLoading, queryError, setUsers]);

  useEffect(() => {
    if (!open) {
      setMutationError(false);
      setMutationPartialError(false);
      setMutationSuccess(false);
      setMutationSuccessTaggerUpload(false);
    }
  }, [open, setMutationError, setMutationPartialError, setMutationSuccess]);

  const submit = mutationData => mutate({ variables: { body: mutationData } })
    .then((resp) => {
      const { data, errors } = resp;
      const res = data[Object.keys(data)[0]];
      setMutationErrorObj(resp);
      setMutationError(false);
      setMutationSuccess(false);
      if (errors && errors.length > 0) {
        setMutationError(true);
      } else {
        if (didMutationPerformAllChanges(mutationData, res)) {
          setMutationSuccess(true);
        } else {
          setMutationPartialError(true);
        }
        refetch();
      }
    })
    .catch(() => setMutationError(true));

  const onSubmitChanges = (formData) => {
    const mutationData = getMutationChangeData(concernedEntity.id, users, formData);
    submit(mutationData)
      // The user might change their own role so we need to refetch their permissions
      .then(reloadUserPermissions);
  };

  const onSubmitNewUser = (formData) => {
    const mutationData = getMutationCreateData(concernedEntity.id, formData);
    submit(mutationData);
  };

  const customRoleOption = (props) => {
    const { data, children } = props;
    return (
      <Fragment>
        <components.Option {...props}>
          {children}<br />
          <span className="description">
            <T
              text={data.description[concernedEntity?.type] ? data.description[concernedEntity?.type] : data.description.default}
              params={{
                entity: concernedEntity?.type ? translateText(concernedEntity?.type) : '',
              }}
            />
          </span>
        </components.Option>
      </Fragment>
    );
  };

  const toggleTaggerPermission = (obj) => {
    mutateTaggerUpload(
      {
        variables:
        {
          projectId: concernedEntity.id,
          organizationId,
          body: { taggerUpload: obj.target.checked }
        }
      }
    ).then(() => {
      refetchQueryTaggerUpload();
      setMutationSuccessTaggerUpload(true);
    }).catch(() => setMutationSuccessTaggerUpload(false));
  };

  useEffect(() => {
    if (!queryLoadingTaggerUpload && queryDataTaggerUpload) {
      setValueTaggerUpload(queryDataTaggerUpload?.getProject?.taggerUpload);
    }
  }, [queryDataTaggerUpload, queryLoadingTaggerUpload]);

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-users-permissions-modal"
      contentLabel="Users Permissions"
    >
      {open && (
        <Fragment>
          <div className="content-panel">
            <h2>Users permissions</h2>
            {mutationSuccess && !mutationLoading && (
              <div className="alert alert-info" role="alert">
                The permissions have been updated.
              </div>
            )}
            {mutationError && !mutationLoading && (
              <div className="alert alert-danger" role="alert">
                {getGraphQLErrorMessage(mutationErrorObj)}
              </div>
            )}
            {mutationPartialError && !mutationLoading && (
              <div className="alert alert-danger" role="alert">
                Some of the changes you requested {"weren't"} performed correctly. Please try again
                in a few minutes.
              </div>
            )}
            {mutationTaggerUploadError && !mutationTaggerUploadLoading && (
              <div className="alert alert-danger" role="alert">
                {getGraphQLErrorMessage(mutationTaggerUploadError)}
              </div>
            )}
            {mutationSuccessTaggerUpload && !mutationTaggerUploadError && !mutationTaggerUploadLoading && (
              <div className="alert alert-info" role="alert">
                Tagger user permission has been updated.
              </div>
            )}
            <p>
              <T
                text="Below are the persons who have access to this {entity}."
                params={{
                  entity: concernedEntity?.type ? translateText(concernedEntity?.type) : '',
                }}
              />
            </p>
            {queryLoading && !users.length && (
              <div className="text-center my-3">
                <LoadingSpinner inline />
              </div>
            )}
            {!!users.length && (
              <Form
                initialValues={getFormInitialValues(users)}
                onSubmit={!mutationLoading && onSubmitChanges}
                noValidate
              >
                <div className="users-list container">
                  {users.map((user, i) => {
                    const roleOptionsForUser = getRoleOptionsForUser(user, concernedEntity?.type);
                    return (
                      <div
                        key={user.id}
                        className={classnames({
                          row: true,
                          'align-items-center': true,
                          'mt-3': i > 0,
                        })}
                      >
                        <Scope scope={`users[${i}]`}>
                          <div
                            className={classnames({
                              'col-7': user.canBeRevoked,
                              'col-8': !user.canBeRevoked,
                              'pl-0': true,
                            })}
                          >
                            <div className="profile-picture">
                              {`${exists(user.firstName) ? user.firstName[0] : ''}${
                                exists(user.lastName) ? user.lastName[0] : ''
                              }`}
                            </div>
                            <span className="name">
                              {`${exists(user.firstName) ? user.firstName : ''} ${
                                exists(user.lastName) ? user.lastName : ''
                              }`}
                            </span>
                            <br />
                            <span className="email">{user.email}</span>
                          </div>
                          <div
                            className={classnames(
                              user.canBeRevoked ? 'col-5' : 'col-4',
                              'pr-0',
                              'd-flex',
                              'justify-content-end',
                              'role'
                            )}
                          >
                            <div
                              className={classnames({
                                'mr-4': user.canBeRevoked,
                                'flex-grow-1': true,
                              })}
                            >
                              <Select
                                field="role"
                                aria-label={translateText('Role')}
                                options={roleOptionsForUser}
                                disabled={mutationLoading || roleOptionsForUser.length <= 1}
                              />
                            </div>
                            {user.canBeRevoked && (
                              <ToggleButton
                                field="revoke"
                                label={translateText('Revoke')}
                                className="btn-secondary btn-sm"
                                disabled={mutationLoading}
                              />
                            )}
                          </div>
                          {user.isImplicit && (
                            <div className="col-12 pl-0 mt-2">
                              <small className="implicit-note">
                                <T
                                  text="This user has access to this {entity} because they've been given a role to its parent organization or initiative."
                                  params={{
                                    entity: concernedEntity?.type ? translateText(concernedEntity?.type) : '',
                                  }}
                                />
                              </small>
                            </div>
                          )}
                        </Scope>
                      </div>
                    );
                  })}
                </div>
                {userCanMakeChanges && (
                  <p className="d-flex justify-content-end mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={mutationLoading}
                    >
                      Save changes
                    </button>
                  </p>
                )}
              </Form>
            )}
            {concernedEntity?.type === 'project' && isProjectOwner
              && (
                <Fragment>
                  <h3 className="mt-4">Customize project Permissions</h3>
                  <div className={classnames('checkbox-tagger', { 'mrg-top-1': !queryLoadingTaggerUpload && !mutationTaggerUploadLoading })}>
                    {(queryLoadingTaggerUpload || mutationTaggerUploadLoading)
                      && <LoadingSpinner inline mini />
                    }
                    {!queryLoadingTaggerUpload && !mutationTaggerUploadLoading
                      && <input checked={valueTaggerUpload} disabled={mutationTaggerUploadLoading || queryLoadingTaggerUpload} type="checkbox" onChange={input => toggleTaggerPermission(input)} name="chk-tagger-upload" id="chk-tagger-upload" />
                    }
                  </div>
                  <div className="allow-tagger">Allow Taggers in this project to upload images</div>
                  <div className="checkbox-note">By default, Taggers do not have permissions to upload images.
                    You can grant upload permissions to all Taggers within this project by selecting this option.
                  </div>
                </Fragment>
              )
            }
            {invitationRoleOptions.length > 0 && (
              <Fragment>
                <h3 className="mt-4">Invite user</h3>
                <p>
                  <T
                    text="To invite a user to this {entity}, please fill in their email address and assign them a role."
                    params={{
                      entity: concernedEntity?.type ? translateText(concernedEntity?.type) : '',
                    }}
                  />
                </p>
                <Form
                  initialValues={{ role: { value: 'viewer' } }}
                  noValidate
                  onSubmit={!mutationLoading && onSubmitNewUser}
                >
                  <div className="container">
                    <div className="row">
                      <div className="col-7 pl-0">
                        <Text
                          type="email"
                          field="email"
                          aria-label={translateText('Email address')}
                          placeholder={translateText('david.smith@provider.com')}
                          className="email-input"
                          required
                          disabled={mutationLoading}
                          validate={(value) => {
                            if (exists(emailValidation(value))) {
                              return emailValidation(value);
                            }
                            return requiredValidation(value);
                          }}
                        />
                      </div>
                      <div className="col-3 role invite-role">
                        <Select
                          field="role"
                          aria-label={translateText('Role')}
                          options={invitationRoleOptions}
                          validate={requiredValidation}
                          required
                          disabled={mutationLoading}
                          customComponent={customRoleOption}
                        />
                      </div>
                      <div className="col-2 pr-0 text-right">
                        <button
                          type="submit"
                          className="btn btn-sm btn-primary"
                          disabled={mutationLoading}
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                  </div>
                </Form>
              </Fragment>
            )}
          </div>
          <div className="actions-panel">
            <button type="button" className="btn btn-primary btn-alt" onClick={onClose}>
              Done
            </button>
          </div>
        </Fragment>
      )}
    </ReactModal>
  );
};

UsersPermissionsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  concernedEntity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
  }),
  invitationRoleOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  reloadUserPermissions: PropTypes.func.isRequired,
  organizationId: PropTypes.number.isRequired,
  isProjectOwner: PropTypes.bool.isRequired,
};

UsersPermissionsModal.defaultProps = {
  concernedEntity: null,
};

export default UsersPermissionsModal;
