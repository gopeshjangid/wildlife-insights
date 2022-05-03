import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from 'react-apollo-hooks';

import HighlightButton from 'components/highlight-button';
import { getGraphQLErrorMessage } from 'utils/functions';
import updateImageHighlight from './update-image-highlight.graphql';
import getDataFileQuery from './getDataFile.graphql';

const HighlightBtnHolder = ({
  imageId,
  projectId,
  deploymentId,
  disabled,
  displayError
}) => {
  const { data, refetch: refetchGetDataFile } = useQuery(getDataFileQuery, {
    variables: {
      projectId,
      deploymentId,
      id: imageId
    },
    skip: !projectId || !deploymentId || !imageId
  });

  const [mutate] = useMutation(updateImageHighlight, {
    // @ts-ignore
    refetchQueries: refetchGetDataFile,
  });

  const onClickHighlight = (bool) => {
    mutate({
      variables: {
        projectId,
        id: imageId,
        body: { highlighted: !bool }
      }
    }).catch((error) => {
      displayError({
        title: !bool
          ? 'Unable to highlight the photo'
          : 'Unable to remove the highlight from the photo',
        message: getGraphQLErrorMessage(error),
      });
    });
  };

  const isHighlighted = !!data?.getDataFile?.highlighted;

  return (
    <HighlightButton
      className="btn btn-sm"
      highlighted={isHighlighted}
      onClick={(...args) => onClickHighlight(...args)}
      iconSize="lg"
      label={isHighlighted ? 'Highlighted' : 'Highlight'}
      disabled={disabled}
    />
  );
};

HighlightBtnHolder.propTypes = {
  imageId: PropTypes.number.isRequired,
  projectId: PropTypes.number.isRequired,
  deploymentId: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  displayError: PropTypes.func.isRequired
};

export default HighlightBtnHolder;
