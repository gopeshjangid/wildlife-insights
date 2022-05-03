import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { refetchGetDataFiles } from 'lib/initApollo';
import { translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import HighlightButton from 'components/highlight-button';
import IdentificationTooltip from './identification-tooltip';
import BulkDeleteAction from './delete-action';
import highlightQuery from './highlight.graphql';
import './style.scss';

const imageGroupPropTypes = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)));

const BulkActionsPanel = ({
  isBurstModeActive,
  canIdentify,
  canHighlight,
  imageGroups,
  selectedImageGroups,
  setSelectedImageGroups,
  displayError,
  tab,
  isProjectTagger
}) => {
  const [highlighted, setHighlighted] = useState(false);

  const selectedDataFileIds = useMemo(
    () => selectedImageGroups.reduce((res, group) => [...res, ...group], []).map(({ id }) => +id),
    [selectedImageGroups]
  );

  useEffect(() => {
    setHighlighted(false);
  }, [selectedImageGroups]);

  const onClickClose = () => {
    setSelectedImageGroups([]);
  };

  const onClickHighlight = (mutate) => {
    mutate({
      variables: {
        body: {
          dataFileIdList: selectedDataFileIds,
          highlighted: true,
          tab,
        },
      },
    }).then(({ data }) => {
      const mutationFailed = data?.highlightDataFileList.length !== selectedDataFileIds.length;

      if (mutationFailed) {
        displayError({
          uid: 'bulk-highlight-error',
          title: translateText('Unable to highlight all the photos'),
          message: translateText(
            'Only {highlighted} photo(s) out of the {total} have been highlighted.',
            {
              highlighted: data?.highlightDataFileList.length,
              total: selectedDataFileIds.length,
            }
          ),
        });
      } else {
        setHighlighted(true);
      }
    }).catch(() => {
      displayError({
        uid: 'bulk-highlight-error',
        title: translateText('Unable to highlight the photos'),
        message: translateText('Please try again in a few minutes.'),
      });
    });
  };

  if (!selectedImageGroups.length) {
    return null;
  }

  return (
    <div className="c-bulk-actions-panel">
      <div>
        <button
          type="button"
          className="close-button"
          aria-label={translateText('Deselect all')}
          onClick={onClickClose}
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        {isBurstModeActive && (
          <span className="font-weight-bold">
            <T
              text="{selected} burst(s) selected ({total} photo(s))"
              params={{
                selected: selectedImageGroups.length,
                total: selectedDataFileIds.length,
              }}
            />
          </span>
        )}
        {!isBurstModeActive && (
          <span className="font-weight-bold">
            <T
              text="{selected} photo(s) selected"
              params={{ selected: selectedImageGroups.length }}
            />
          </span>
        )}
      </div>
      <div>
        {canIdentify && (
          <IdentificationTooltip imageGroups={imageGroups}>
            <button type="button" className="btn btn-primary btn-alt">
              <T text="Identify" />
            </button>
          </IdentificationTooltip>
        )}
        <Mutation mutation={highlightQuery}
          // @ts-ignore
          refetchQueries={refetchGetDataFiles}>
          {mutate => (
            <HighlightButton
              className="btn btn-secondary btn-alt ml-2 highlight-button"
              highlighted={highlighted}
              onClick={() => !highlighted && onClickHighlight(mutate)}
              disabled={!canHighlight || (isProjectTagger && tab === 'catalogued')}
            />
          )}
        </Mutation>
        <BulkDeleteAction className="ml-2" selectedImageGroups={selectedImageGroups} />
      </div>
    </div>
  );
};

BulkActionsPanel.propTypes = {
  isBurstModeActive: PropTypes.bool.isRequired,
  imageGroups: imageGroupPropTypes.isRequired,
  selectedImageGroups: imageGroupPropTypes.isRequired,
  canIdentify: PropTypes.bool.isRequired,
  canHighlight: PropTypes.bool.isRequired,
  setSelectedImageGroups: PropTypes.func.isRequired,
  displayError: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
  isProjectTagger: PropTypes.bool.isRequired
};

export default BulkActionsPanel;
