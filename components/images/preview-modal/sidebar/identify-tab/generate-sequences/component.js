import React, { useState } from 'react';
import { useMutation } from 'react-apollo-hooks';
import PropTypes from 'prop-types';
import { uniq } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

import { getGraphQLErrorMessage } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import sequenceUpdateQuery from 'utils/shared-gql-queries/adjust-datafiles-for-sequence.graphql';

function GenerateSequences({
  displayError,
  imagesWithoutSequence
}) {
  const [disableSeqRefresh, setDisableSeqRefresh] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [mutate] = useMutation(sequenceUpdateQuery);

  const generateSequences = () => {
    // create dictionary of deploymentIds per projectId
    const depsPerProject = imagesWithoutSequence.reduce((res, image) => {
      const { id, projectId } = image.deployment;
      if (!res[projectId]) {
        res[projectId] = [];
      }
      res[projectId].push(id);
      return res;
    }, {});

    const promises = [];
    Object.keys(depsPerProject).forEach(projectId => {
      const uniqueDepIds = uniq(depsPerProject[projectId]) || [];
      uniqueDepIds.forEach(depId => {
        promises.push(mutate({
          variables: {
            projectId: +projectId,
            deploymentId: +depId
          }
        }));
      });
    });

    setIsMutating(true);
    Promise.all(promises).then(() => {
      setDisableSeqRefresh(true);
    }).catch((error) => {
      displayError({
        title: 'Unable to regenerate sequences',
        message: getGraphQLErrorMessage(error),
      });
    }).finally(() => {
      setIsMutating(false);
    });
  };

  return (
    <div className="mt-4 seq-gen-msg">
      <span>
        Sequence generation is in progress. Please refresh the page to view the
        identification or click the button below to restart the process for
        incomplete sequences in the deployment.
      </span>
      <div className="d-flex mt-3 align-items-center">
        <button
          type="button"
          className="btn btn-primary action-btn-3"
          onClick={generateSequences}
          disabled={disableSeqRefresh || isMutating}
        >
          <FontAwesomeIcon className="mr-1" icon={faRedo} size="sm" />
          <span>Regenerate sequences</span>
        </button>
        {isMutating && <LoadingSpinner transparent inline mini />}
      </div>
      {
        disableSeqRefresh && (
          <div className="alert alert-info mt-2 p-2" role="alert">
            <span>
              Sequences are being regenerated for the deployment. It may take a
              few minutes to complete the process. Please check back later.
            </span>
          </div>
        )
      }
    </div>
  );
}

GenerateSequences.propTypes = {
  imagesWithoutSequence: PropTypes.arrayOf(PropTypes.shape({
    thumbnailUrl: PropTypes.string.isRequired,
  })),
  displayError: PropTypes.func.isRequired
};

GenerateSequences.defaultProps = {
  imagesWithoutSequence: [],
};

export default GenerateSequences;
