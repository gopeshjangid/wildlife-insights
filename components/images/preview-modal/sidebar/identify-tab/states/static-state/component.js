import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Identification from '../../identification';
import BBoxSettings from './bounding-box';

const burstIdentificationAttr = ['class', 'order', 'family', 'genus', 'species',
  'blank', 'identifiedObjCount'];
const allowKeysCode = [69, 66, 65];

const StaticState = ({
  image,
  isBurst,
  isSingleBurstPreview,
  isSequenceProject,
  confirmedIdentifications,
  tab,
  canIdentify,
  onClickAccept,
  onClickAcceptInBurst,
  onClickApplyToAllInBurst,
  onClickMarkAsBlank,
  onClickMarkAsBlankInBurst,
  onClickEditIdentification,
  onClickEditIdentificationInBurst,
  onClickAddIdentification,
  projectsPermissions,
  selectedBurstImageGroups,
  closePreviewAndSidebar,
  isLastImageGroup,
  moveToNextImageGroup,
  onCancelBulkSelection
}) => {
  if (!confirmedIdentifications?.length) {
    return null;
  }
  let disableEditIdentification = false;
  if (tab === 'catalogued'
    && projectsPermissions[image?.deployment?.project?.id]?.role === 'PROJECT_TAGGER') {
    disableEditIdentification = true;
  }

  const disableCount = image?.deployment?.project?.disableCount || false;
  const burstImgGroupsLen = selectedBurstImageGroups.length;
  const shouldDisplayBurstView = isBurst && (isSequenceProject || !isSingleBurstPreview);
  const shouldDisplayBBoxSettings = (tab === 'identify')
    && (!isBurst || isSingleBurstPreview);
  const shouldDisplayIdActionsPerCard = canIdentify && tab === 'identify'
    && !burstImgGroupsLen;

  const handleKeyDown = (e) => {
    console.log('handleKeyDown Key function called ----------------');
    if ((e.ctrlKey || e.metaKey) && !shouldDisplayBurstView) {
      if (allowKeysCode.includes(e.keyCode)) {
        e.preventDefault();
        if (!disableEditIdentification && canIdentify) {
          if (e.keyCode === 66) {
            // Ctrl + B Mark as Blank
            onClickMarkAsBlank();
          } else if (confirmedIdentifications.length === 1 && e.keyCode === 69) {
            // Ctrl + E Edit Identification
            onClickEditIdentification();
          }
        }
        // Ctrl + A Accept ID
        if (e.keyCode === 65 && canIdentify
          && (confirmedIdentifications[0].identificationMethod?.mlIdentification)) {
          onClickAccept();
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('Unmount called ----------------');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBurst, isSingleBurstPreview]);

  const renderFixedActionsInBurst = () => {
    return (
      <div className="d-flex mt-4 justify-content-between">
        <button type="button"
          className="btn btn-primary action-btn-3"
          onClick={closePreviewAndSidebar}
        >
          Cancel
        </button>
        <button type="button"
          className="btn btn-primary action-btn-4"
          disabled={isLastImageGroup}
          onClick={moveToNextImageGroup}
        >
          Save and next
        </button>
      </div>
    );
  }

  return (
    <Fragment>
      {
        shouldDisplayBurstView ? (
          <Fragment>
            {
              burstImgGroupsLen ? (
                <Fragment>
                  <div className="d-flex">
                    <span className="label-text">
                      {`${burstImgGroupsLen} IMAGES SELECTED`}
                    </span>
                    <button
                      type="button"
                      className="close-btn ml-2"
                      onClick={onCancelBulkSelection}
                    >
                      <img alt="" src="/static/ic_clear_24px.png" />
                    </button>
                  </div>
                  <p className="label-text">ANIMALS IN THIS SELECTION</p>
                </Fragment>
              ) : (
                <p className="label-text">
                  {`ANIMALS IN THIS ${isSequenceProject ? 'SEQUENCE' : 'BURST'}`}
                </p>
              )
            }
            <div className={classNames(
              'burst-container',
              isSequenceProject && isSingleBurstPreview ? 'full' : 'short'
            )}
            >
              <div className="scroll-container">
                {confirmedIdentifications.map(confirmedIdentification => (
                  <Fragment key={confirmedIdentification.id}>
                    <Identification
                      disableCount={disableCount}
                      key={confirmedIdentification.id}
                      identification={confirmedIdentification}
                      canRemove={false}
                      attributes={
                        tab !== 'catalogued'
                          ? [...burstIdentificationAttr, 'confidence', 'appliedTo']
                          : [...burstIdentificationAttr, 'author', 'date', 'age', 'sex',
                            'markings', 'behavior', 'remarks']
                      }
                      readOnly
                    />
                    {
                      shouldDisplayIdActionsPerCard && (
                        <div className={classNames(
                          'd-flex justify-content-end id-actions-panel',
                          isSequenceProject ? 'adjust-width-2'
                            : `adjust-width-${(confirmedIdentification.dataFileCount + '').length}`
                        )}
                        >
                          {
                            confirmedIdentification.identificationMethod?.mlIdentification
                            && (
                              <Fragment>
                                <button type="button"
                                  className="btn btn-primary action-btn-2"
                                  disabled={disableEditIdentification}
                                  onClick={() => onClickAcceptInBurst(confirmedIdentification)}
                                >
                                  {
                                    `Apply to ${isSequenceProject ? 'sequence'
                                      : confirmedIdentification.dataFileCount + ' images'}`
                                  }
                                </button>
                                {
                                  !isSequenceProject && (
                                    <button
                                      type="button"
                                      className="btn btn-primary action-btn-3"
                                      onClick={() => onClickApplyToAllInBurst(confirmedIdentification)}
                                      disabled={disableEditIdentification}
                                    >
                                      Apply to all
                                    </button>
                                  )
                                }
                              </Fragment>
                            )
                          }
                          <button
                            type="button"
                            className="btn btn-primary action-btn-3"
                            disabled={disableEditIdentification}
                            onClick={() => {
                              onClickEditIdentificationInBurst([confirmedIdentification])
                            }}
                          >
                            <img alt="" src="/static/ic_edit_24px.png" />
                            <span>Edit</span>
                          </button>
                          {
                            isSequenceProject && (
                              <button
                                type="button"
                                className="btn btn-primary action-btn-3"
                                onClick={() => onClickMarkAsBlankInBurst(confirmedIdentification)}
                                disabled={disableEditIdentification}
                              >
                                <img alt="" src="/static/ic_cancel_24px.png" />
                                <span>Blank</span>
                              </button>
                            )
                          }
                        </div>
                      )}
                  </Fragment>
                ))}
              </div>

              {!shouldDisplayIdActionsPerCard && (
                <div className='d-flex justify-content-end mb-2 mt-4'>
                  <button
                    type="button"
                    className="btn btn-primary action-btn-3"
                    disabled={disableEditIdentification}
                    onClick={() => onClickEditIdentificationInBurst(confirmedIdentifications)}
                  >
                    <img alt="" src="/static/ic_edit_24px.png" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary action-btn-3 ml-2"
                    onClick={() => {
                      let entityIds = [];
                      confirmedIdentifications.forEach(identification => {
                        entityIds = [...entityIds, ...identification.entityIds];
                      });

                      onClickMarkAsBlankInBurst({
                        ...confirmedIdentifications[0],
                        identifiedObjects: [],
                        entityIds
                      });
                    }}
                    disabled={disableEditIdentification}
                  >
                    <img alt="" src="/static/ic_cancel_24px.png" />
                    <span>Blank</span>
                  </button>
                </div>
              )}

              {isSingleBurstPreview && renderFixedActionsInBurst()}
              {shouldDisplayBBoxSettings && <BBoxSettings image={image} />}
            </div>

            {!isSingleBurstPreview && renderFixedActionsInBurst()}
          </Fragment>
        ) : (
          <Fragment>
            <p className="label-text">ANIMALS IN THIS IMAGE</p>
            <div className="scroll-container">
              <Identification identification={confirmedIdentifications[0]} canRemove={false} readOnly />
            </div>
            {
              canIdentify && (
                <div className="fixed-container mt-3 text-center">
                  <div className='d-flex'>
                    {/* 
                        1. We want to show the following button only when the identification 
                           is from the computer vision
                        2. For 'single image view' (non-burst mode), three buttons (Edit, 
                           Accept, Mark as blank) are in one row below the main ID box.
                    */}
                    {
                      confirmedIdentifications[0].identificationMethod?.mlIdentification
                      && (
                        <button type="button"
                          className="btn btn-primary action-btn-1 mb-3"
                          disabled={disableEditIdentification}
                          onClick={onClickAccept}>
                          Accept
                        </button>
                      )
                    }
                    <button
                      type="button"
                      className="btn btn-primary action-btn-1 mb-3"
                      disabled={disableEditIdentification}
                      onClick={
                        confirmedIdentifications.length === 1
                          ? onClickEditIdentification
                          : onClickAddIdentification
                      }
                    >
                      {
                        confirmedIdentifications.length === 1
                          ? (
                            <Fragment>
                              <img alt="" src="/static/ic_edit_24px.png" />
                              <span>Edit</span>
                            </Fragment>
                          ) : 'Add'
                      }
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary action-btn-1 mb-3"
                      onClick={onClickMarkAsBlank}
                      disabled={disableEditIdentification}
                    >
                      <img alt="" src="/static/ic_cancel_24px.png" />
                      <span>Blank</span>
                    </button>
                  </div>
                  {shouldDisplayBBoxSettings && <BBoxSettings image={image} />}
                </div>
              )
            }
          </Fragment>
        )
      }
    </Fragment >
  );
};

StaticState.propTypes = {
  image: PropTypes.shape({}),
  isBurst: PropTypes.bool.isRequired,
  isSingleBurstPreview: PropTypes.bool.isRequired,
  isSequenceProject: PropTypes.bool.isRequired,
  isLastImageGroup: PropTypes.bool.isRequired,
  confirmedIdentifications: PropTypes.arrayOf(
    PropTypes.shape({
      blankYn: PropTypes.bool.isRequired,
      identifiedObjects: PropTypes.array.isRequired,
    })
  ),
  tab: PropTypes.string.isRequired,
  canIdentify: PropTypes.bool.isRequired,
  onClickAccept: PropTypes.func.isRequired,
  onClickAcceptInBurst: PropTypes.func.isRequired,
  onClickApplyToAllInBurst: PropTypes.func.isRequired,
  onClickMarkAsBlank: PropTypes.func.isRequired,
  onClickMarkAsBlankInBurst: PropTypes.func.isRequired,
  onClickEditIdentification: PropTypes.func.isRequired,
  onClickEditIdentificationInBurst: PropTypes.func.isRequired,
  onClickAddIdentification: PropTypes.func.isRequired,
  closePreviewAndSidebar: PropTypes.func.isRequired,
  moveToNextImageGroup: PropTypes.func.isRequired,
  onCancelBulkSelection: PropTypes.func.isRequired,
  projectsPermissions: PropTypes.shape({}).isRequired,
  selectedBurstImageGroups: PropTypes.arrayOf(PropTypes.number)
};

StaticState.defaultProps = {
  confirmedIdentifications: [],
  image: null,
  selectedBurstImageGroups: []
};

export default StaticState;
