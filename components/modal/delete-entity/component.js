import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { useMutation } from 'react-apollo-hooks';
import { get } from 'lodash';

import { Form } from 'components/form';
import { translateText, getGraphQLErrorMessage } from 'utils/functions';
import { ENTITY_ASSOCIATION_ERROR } from 'utils/app-constants';
import T from 'components/transifex/translate';
import deleteSubprojectQuery from './delete-subproject.graphql';
import deleteLocationQuery from './delete-location.graphql';
import deleteDeploymentQuery from './delete-deployment.graphql';
import deleteDeviceQuery from './delete-device.graphql';
import './style.scss';

const MSG = 'Are you sure you want to delete the selected entities?';
const ENTITY_TYPES = {
  subproject: {
    title: 'Delete Subproject',
    msgOne: MSG,
    msgTwo: 'Note: Deployments within this subproject will not be deleted.',
    successMsg: 'Subproject deleted successfully.',
    mutationQuery: deleteSubprojectQuery,
    refetch: ['getSubProjects']
  },
  location: {
    title: 'Delete Location',
    msgOne: MSG,
    msgTwo: 'Note: Locations can only be deleted if they are not associated with a deployment.',
    successMsg: 'Location deleted successfully.',
    mutationQuery: deleteLocationQuery,
    associationError: 'This Location is associated with a Deployment. If you\'d like to delete this Location, please first delete the associated Deployment.',
    refetch: ['getLocations']
  },
  deployment: {
    title: 'Delete Deployment',
    msgOne: MSG,
    successMsg: 'Deployment deleted successfully.',
    mutationQuery: deleteDeploymentQuery,
    refetch: ['getDeployments']
  },
  device: {
    title: 'Delete Device',
    msgOne: MSG,
    successMsg: 'Device deleted successfully.',
    mutationQuery: deleteDeviceQuery,
    associationError: 'This Device is associated with a Deployment. If you\'d like to delete this Device, please first delete the associated Deployment.',
    refetch: ['getDevices']
  }
};

const DeleteEntityModal = ({
  id,
  projectId,
  organizationId,
  open,
  onClose,
  entityType
}) => {
  const entity = ENTITY_TYPES[entityType];
  if (!entity) {
    return null;
  }

  const [
    mutate, { data: mutationData, loading: mutationLoading, error: mutationError }
  ] = useMutation(entity.mutationQuery, {
    refetchQueries: () => entity.refetch,
  });

  const onSubmit = () => {
    let params;
    if (entityType === 'subproject') {
      params = { id };
    } else if (entityType === 'device') {
      params = { id, organizationId };
    }
    else {
      params = { id, projectId };
    }

    mutate({
      variables: { ...params }
    });
  };

  // for device and location entity, check if api error 
  // is due to its association with other entity
  let isAssociationError = false;
  let errMsg = '';

  if (mutationError) {
    const statusCode = get(mutationError, 'graphQLErrors[0].extensions.exception.status');
    if ((entityType === 'device' || entityType === 'location')
      && statusCode === ENTITY_ASSOCIATION_ERROR) {
      isAssociationError = true;
      errMsg = entity.associationError;
    } else {
      errMsg = getGraphQLErrorMessage(mutationError);
    }
  }

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-delete-entity"
      contentLabel={translateText(entity.title)}
    >
      <div className="content-panel">
        <h2>{entity.title}</h2>
        {
          !mutationData && (
            <div className="row">
              <div className="col">
                {
                  mutationError && (
                    <div className="alert alert-danger" role="alert">
                      {errMsg}
                    </div>
                  )
                }
                <Form onSubmit={onSubmit} noValidate>
                  {!isAssociationError && (
                    <div className="form-group">
                      <p>{entity.msgOne}</p>
                      {entity.msgTwo && (
                        <p>{entity.msgTwo}</p>
                      )}
                    </div>
                  )}
                  <div className="actions-panel">
                    <button type="submit"
                      disabled={mutationLoading || isAssociationError}
                      className="btn btn-secondary btn-sm"
                    >
                      {mutationLoading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )
        }
        {
          mutationData && !mutationError && (
            <Fragment>
              <div className="alert alert-info" role="alert">
                <T text={entity.successMsg} />
              </div>
              <div className="actions-panel">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Fragment>
          )
        }
      </div>
    </ReactModal>
  );
};

DeleteEntityModal.propTypes = {
  id: PropTypes.number.isRequired,
  projectId: PropTypes.number,
  organizationId: PropTypes.number,
  open: PropTypes.bool.isRequired,
  entityType: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

DeleteEntityModal.defaultProps = {
  projectId: null,
  organizationId: null,
  onClose: () => { }
};

export default DeleteEntityModal;
