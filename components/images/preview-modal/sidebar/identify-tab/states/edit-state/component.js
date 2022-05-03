import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';

import Identification from '../../identification';

const EditState = ({
  identification,
  isBurst,
  isSingleBurstPreview,
  canIdentify,
  idForTaxonomyLookup,
  onClickAddAnimal,
  onChangeIdentifiedObject,
  onRemoveIdentifiedObject,
  onClickMarkAsBlank,
  onClickMarkAsBlankInBurst,
  onClickHistory,
  onClickSave,
  onClickCancelEdit,
  onClickRemoveAllIds,
  image
}) => {
  const disableCount = image?.deployment?.project?.disableCount || false;
  const handleKeyDown = (e) => {
    // Ctrl + S for Save Changes
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 83 &&
      canIdentify && (!isBurst || isSingleBurstPreview)) {
      e.preventDefault();
      onClickSave();
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBurst, isSingleBurstPreview]);

  return (
    <Fragment>
      <div className="d-flex edit-id-label justify-content-between mb-1">
        <span className="label-text mb-0">EDIT IDENTIFICATION</span>
        <button
          type="button"
          className="close-btn"
          onClick={onClickCancelEdit}
        >
          <img alt="" src="/static/ic_clear_24px.png" />
        </button>
      </div>

      <div style={{ height: '80%', display: 'flex', flexDirection: 'column' }}>
        <div className="scroll-container">
          {identification.blankYn && (
            <Fragment>
              {canIdentify && (
                <div className="text-center">
                  <button type="button" className="btn btn-secondary" onClick={onClickAddAnimal}>
                    Add animal
                  </button>
                </div>
              )}
              <div className="message">Marked as blank</div>
            </Fragment>
          )}
          {!identification.blankYn && (
            <Fragment>
              {identification.identifiedObjects.map((identifiedObject, index) => (
                <Identification
                  disableCount={disableCount}
                  key={identifiedObject.id}
                  identification={Object.assign({}, identification, {
                    identifiedObjects: [identifiedObject],
                  })}
                  readOnly={!canIdentify}
                  canRemove={index > 0 && canIdentify}
                  idForTaxonomyLookup={idForTaxonomyLookup}
                  onChange={ident => onChangeIdentifiedObject(index, ident)}
                  onRemove={() => onRemoveIdentifiedObject(index)}
                />
              ))}
              {canIdentify && (
                <div className="mt-md-4 text-center">
                  <button type="button" className="btn btn-secondary mb-2" onClick={onClickAddAnimal}>
                    Add animal
                  </button>
                </div>
              )}
            </Fragment>
          )}
        </div>
        <div className="fixed-container mt-3 text-center">
          {canIdentify && (
            <div className="row">
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mb-3"
                  onClick={() => {
                    isBurst && !isSingleBurstPreview ? onClickMarkAsBlankInBurst(identification)
                      : onClickMarkAsBlank();
                  }}
                >
                  Mark as blank
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mb-3"
                  onClick={onClickRemoveAllIds}
                >
                  Remove all IDs
                </button>
              </div>
            </div>
          )}
          {
            (!isBurst || isSingleBurstPreview) && (
              <div className="row">
                <div className="col-4">
                  <button type="button" className="btn btn-secondary" onClick={onClickHistory}>
                    History
                  </button>
                </div>
                {canIdentify && (
                  <div className='col-8'>
                    <button type="button" className="btn btn-primary" onClick={onClickSave}>
                      Save changes
                    </button>
                  </div>
                )}
              </div>
            )
          }
        </div>
      </div>
      {
        isBurst && !isSingleBurstPreview && (
          <div className="d-flex mt-4 justify-content-between">
            <button type="button"
              className="btn btn-primary action-btn-3"
              onClick={onClickCancelEdit}
            >
              Cancel
            </button>
            {canIdentify && (
              <button type="button"
                className="btn btn-primary action-btn-4"
                onClick={onClickSave}
              >
                Update images
              </button>
            )}
          </div>
        )
      }
    </Fragment>
  );
};

EditState.propTypes = {
  image: PropTypes.shape({}).isRequired,
  identification: PropTypes.shape({
    blankYn: PropTypes.bool.isRequired,
    identifiedObjects: PropTypes.array.isRequired,
  }).isRequired,
  isBurst: PropTypes.bool.isRequired,
  isSingleBurstPreview: PropTypes.bool.isRequired,
  canIdentify: PropTypes.bool.isRequired,
  onClickAddAnimal: PropTypes.func.isRequired,
  onChangeIdentifiedObject: PropTypes.func.isRequired,
  onRemoveIdentifiedObject: PropTypes.func.isRequired,
  onClickMarkAsBlank: PropTypes.func.isRequired,
  onClickMarkAsBlankInBurst: PropTypes.func.isRequired,
  onClickHistory: PropTypes.func.isRequired,
  onClickSave: PropTypes.func.isRequired,
  onClickCancelEdit: PropTypes.func.isRequired,
  onClickRemoveAllIds: PropTypes.func.isRequired,
  idForTaxonomyLookup: PropTypes.number
};

EditState.defaultProps = {
  idForTaxonomyLookup: null,
};

export default EditState;
