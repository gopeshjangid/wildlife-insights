import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { exists } from 'utils/functions';
import { getImagesWithNoSequenceId } from './helpers';
import LoadingSpinner from 'components/loading-spinner';
import NoIdentificationState from './states/no-identification-state';
import EditState from './states/edit-state';
import HistoryState from './states/history-state';
import StaticState from './states/static-state';
import GenerateSequences from './generate-sequences';

import './style.scss';

// for generating unique value of react key props
let timestampForUniqueKey = (new Date()).getTime();
const constructUniqueKey = (part1, part2, part3) => {
  let result = '';

  result += exists(part1) ? part1 + '-' : '';
  result += exists(part2) ? part2 + '-' : '';
  result += exists(part3) ? part3 : '';

  return result || (new Date()).getTime();
};

const ImagePropType = PropTypes.shape({
  thumbnailUrl: PropTypes.string.isRequired,
});

function SidebarIdentifyTab({
  state,
  hasIdentifications,
  images,
  imageGroupIndex,
  displayError,
  fetchIdentifications,
  isLastImageGroup,
  isSequenceProject
}) {
  const jsxKey = constructUniqueKey(
    imageGroupIndex,
    get(images, '[0].id'),
    timestampForUniqueKey
  );

  useEffect(() => {
    // update following on identify state 
    // change, to construct unique key
    timestampForUniqueKey = (new Date()).getTime();
  }, [state]);

  useEffect(() => {
    if (state === 'error') {
      displayError({
        // Prevent several notifications
        uid: 'identifications-error-loading',
        title: 'Unable to load the identifications',
        message: 'Please try again in a few minutes.',
      });
    }
  }, [state, displayError]);

  useEffect(() => {
    if (exists(imageGroupIndex) && images?.length) {
      fetchIdentifications();
    }
  }, [images, imageGroupIndex, fetchIdentifications]);

  if (state === 'error') {
    return null;
  }

  if (state === 'loading') {
    return (
      <div className="c-sidebar-identify-tab">
        <div className="scroll-container">
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        </div>
      </div>
    );
  }

  if (isSequenceProject) {
    // display generate sequences component, if there are images 
    // with invalid sequenceId
    const noSequencedIdImages = getImagesWithNoSequenceId(images || []);
    if (Array.isArray(noSequencedIdImages) && noSequencedIdImages.length) {
      return (
        <div className="c-sidebar-identify-tab">
          <GenerateSequences imagesWithoutSequence={noSequencedIdImages} />
        </div>
      );
    }
  }

  return (
    <div className="c-sidebar-identify-tab">
      {
        state === 'loaded'
        && !hasIdentifications
        && <NoIdentificationState key={jsxKey} images={images} />
      }
      {
        state === 'loaded'
        && hasIdentifications
        && <StaticState key={jsxKey} images={images} isLastImageGroup={isLastImageGroup} />
      }
      {
        state === 'editing'
        && <EditState key={jsxKey} images={images} />
      }
      {state === 'history' && <HistoryState key={jsxKey} />}
    </div>
  );
}

SidebarIdentifyTab.propTypes = {
  data: PropTypes.shape({
    getIdentificationOutputs: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.object,
  }),
  state: PropTypes.string.isRequired,
  hasIdentifications: PropTypes.bool.isRequired,
  images: PropTypes.arrayOf(ImagePropType),
  imageGroupIndex: PropTypes.number,
  fetchIdentifications: PropTypes.func.isRequired,
  displayError: PropTypes.func.isRequired,
  isLastImageGroup: PropTypes.bool.isRequired,
  isSequenceProject: PropTypes.bool.isRequired
};

SidebarIdentifyTab.defaultProps = {
  data: { getIdentificationOutputs: null, loading: false, error: null },
  imageGroupIndex: null,
  images: [],
};

export default SidebarIdentifyTab;
