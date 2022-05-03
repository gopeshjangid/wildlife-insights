import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-apollo-hooks';
import classnames from 'classnames';

import { exists, translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import { Form, Scope, ToggleButton } from 'components/form';
import LoadingSpinner from 'components/loading-spinner';
import {
  getApproveMutationData,
  getRejectMutationData,
  didApproveMutationPerformAllChanges,
  didRejectMutationPerformAllChanges,
} from './helpers';

import usersQuery from './query.graphql';
import approveMutation from './approve-mutation.graphql';
import rejectMutation from './reject-mutation.graphql';
import './style.scss';

const AccountValidation = () => {
  const [users, setUsers] = useState([]);

  const [mutationError, setMutationError] = useState(false);
  const [mutationPartialError, setMutationPartialError] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationSuccess, setMutationSuccess] = useState(false);

  const { data, loading, error, refetch } = useQuery(usersQuery);
  const [approve] = useMutation(approveMutation);
  const [reject] = useMutation(rejectMutation);

  useEffect(() => {
    if (!loading && data?.getParticipants?.data) {
      setUsers(data.getParticipants.data);
    }
  }, [data, loading, setUsers]);

  const onSubmit = (formData) => {
    const approveMutationData = getApproveMutationData(formData);
    const rejectMutationData = getRejectMutationData(formData);

    // These flags help us determine which alert to show to the user
    // If only success is true, then everything went well
    // If only error is true, then everything went wrong
    // In any other cases, then it's been partially wrong
    let submitPartialError = false; // Whether the approve or execute mutations partially errored
    let submitError = false; // Whether the approve or execute mutations errored
    let submitSuccess = false; // // Whether the approve or execute mutations succeeded

    const executeApprove = () => approve({ variables: { body: approveMutationData } })
      .then(({ data: approveData }) => {
        const res = approveData[Object.keys(approveData)[0]];
        if (didApproveMutationPerformAllChanges(approveMutationData, res)) {
          submitSuccess = true;
        } else {
          submitPartialError = true;
        }
      })
      .catch(() => {
        submitError = true;
      });

    const executeReject = () => reject({ variables: { body: rejectMutationData } })
      .then(({ data: rejectData }) => {
        const res = rejectData[Object.keys(rejectData)[0]];
        if (didRejectMutationPerformAllChanges(rejectMutationData, res)) {
          submitSuccess = true;
        } else {
          submitPartialError = true;
        }
      })
      .catch(() => {
        submitError = true;
      });

    setMutationLoading(true);
    setMutationSuccess(false);
    setMutationPartialError(false);
    setMutationError(false);

    executeApprove()
      .then(executeReject)
      .then(() => {
        if (submitSuccess && !submitPartialError && !submitError) {
          setMutationSuccess(true);
        } else if (submitError && !submitPartialError && !submitSuccess) {
          setMutationError(true);
        } else {
          setMutationPartialError(true);
        }

        setMutationLoading(false);
        refetch();
      });
  };

  return (
    <div className="c-account-validation">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <T text="Below are the persons that have signed up to Wildlife Insights. You can either approve their account and they will gain access to the platform, or reject them and their information will be deleted." />
        </div>
      </div>
      {!error && loading && !users.length && (
        <div className="row mt-5">
          <div className="col-md-8 offset-md-2 text-center">
            <LoadingSpinner inline />
          </div>
        </div>
      )}
      {(error || (!loading && !users.length) || mutationSuccess || mutationError
        || mutationPartialError) && (
        <div className="row mt-5">
          <div className="col-md-8 offset-md-2">
            {error && (
              <div className="alert alert-danger" role="alert">
                <T text="Unable to load the users. Please try again in a few minutes." />
              </div>
            )}
            {(!loading && !error && !users.length) && (
              <div className="alert alert-info" role="alert">
                <T text="All the pending users have been reviewed." />
              </div>
            )}
            {mutationSuccess && !mutationLoading && (
              <div className="alert alert-info" role="alert">
                <T text="The user accounts have been updated." />
              </div>
            )}
            {mutationError && !mutationLoading && (
              <div className="alert alert-danger" role="alert">
                <T text="Unable to edit the user accounts. Please try again in a few minutes." />
              </div>
            )}
            {mutationPartialError && !mutationLoading && (
              <div className="alert alert-danger" role="alert">
                <T text="Some of the changes you requested weren't performed correctly. Please try again in a few minutes." />
              </div>
            )}
          </div>
        </div>
      )}
      {!!users.length && (
        <div className="row mt-5">
          <div className="col-md-8 offset-md-2">
            <Form
              initialValues={{ users }}
              onSubmit={!mutationLoading && onSubmit}
              noValidate
            >
              <div className="users-list container">
                {users.map((user, i) => (
                  <div
                    key={user.id}
                    className={classnames({
                      row: true,
                      'align-items-center': true,
                      'mt-3': i > 0,
                    })}
                  >
                    <Scope scope={`users[${i}]`}>
                      <div className="col-7 pl-0">
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
                      <div className="col-5 pr-0 d-flex justify-content-end">
                        <ToggleButton
                          field="approve"
                          label={translateText('Approve')}
                          className="btn-secondary btn-sm"
                          disabled={mutationLoading}
                        />
                        <ToggleButton
                          field="reject"
                          label={translateText('Reject')}
                          className="btn-secondary btn-sm ml-2"
                          disabled={mutationLoading}
                        />
                      </div>
                    </Scope>
                  </div>
                ))}
              </div>
              {!loading && !error && !!users.length && (
                <p className="d-flex justify-content-end mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={mutationLoading}
                  >
                    <T text={mutationLoading ? 'Saving...' : 'Save changes'} />
                  </button>
                </p>
              )}
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountValidation;
