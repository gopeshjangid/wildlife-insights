import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import { exists, getFormattedUTCDate } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import ImagePreview from './preview';
import ImageSelector from './selector';
import Sidebar from './sidebar';

import './style.scss';

class ImagePreviewModal extends PureComponent {
  static propTypes = {
    imageGroups: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
    ).isRequired,
    imagesLoading: PropTypes.bool.isRequired,
    selectedImageGroupIndex: PropTypes.number,
    // Is it the first group of the collection?
    isFirst: PropTypes.bool.isRequired,
    // Is it the last group of the collection?
    isLast: PropTypes.bool.isRequired,
    setSelectedImageGroupIndex: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    setSelectedImageIndex: PropTypes.func.isRequired,
    selectedImageIndex: PropTypes.number.isRequired,
    isFirstBurst: PropTypes.bool.isRequired,
    isLastBurst: PropTypes.bool.isRequired,
    firstBurstImage: PropTypes.shape({}).isRequired,
    identify: PropTypes.shape({}).isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isSequenceProject: PropTypes.bool.isRequired,
    setForceImageRefetch: PropTypes.func.isRequired,
    resetIdentifyState: PropTypes.func.isRequired,
    tab: PropTypes.string.isRequired
  };

  static defaultProps = { selectedImageGroupIndex: null };

  componentDidUpdate(prevProps) {
    const { selectedImageGroupIndex } = this.props;
    const isOpen = exists(selectedImageGroupIndex);

    if (isOpen) {
      document.body.classList.add('-modal-is-open');
    } else {
      document.body.classList.remove('-modal-is-open');
    }

    if (prevProps.selectedImageGroupIndex !== selectedImageGroupIndex && isOpen && this.el) {
      this.el.focus();
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  onClose = () => {
    const {
      reset,
      setSelectedImageGroupIndex,
      setSelectedImageIndex,
      setIsSingleBurstPreview,
      setForceImageRefetch,
      resetIdentifyState
    } = this.props;
    reset();
    setSelectedImageGroupIndex(null);
    setSelectedImageIndex(0);
    setIsSingleBurstPreview(false);
    setForceImageRefetch(true);
    resetIdentifyState();
  };

  onClickPrevious = () => {
    const {
      selectedImageGroupIndex,
      setSelectedImageGroupIndex,
      setSelectedImageIndex,
      selectedImageIndex,
      isSingleBurstPreview
    } = this.props;
    if (!isSingleBurstPreview) {
      setSelectedImageGroupIndex(selectedImageGroupIndex - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  onClickNext = () => {
    const {
      selectedImageGroupIndex,
      setSelectedImageGroupIndex,
      setSelectedImageIndex,
      selectedImageIndex,
      isSingleBurstPreview
    } = this.props;
    if (!isSingleBurstPreview) {
      setSelectedImageGroupIndex(selectedImageGroupIndex + 1);
    } else {
      setSelectedImageIndex(selectedImageIndex + 1);
    }

  };

  handleKeyDown = (e) => {
    const { isFirst, isLast } = this.props;
    if (!e.ctrlKey && !e.metaKey && e.keyCode === 39 && !isLast) { // Right arrow key
      e.preventDefault();
      this.onClickNext();
    } else if (!e.ctrlKey && !e.metaKey && e.keyCode === 37 && !isFirst) { // Left arrow key
      e.preventDefault();
      this.onClickPrevious();
    }
  };

  getDateInUTC = str => getFormattedUTCDate(str, 'MM/dd/yyyy HH:mm:ss');

  render() {
    const {
      selectedImageGroupIndex,
      imageGroups,
      imagesLoading,
      isFirst,
      isLast,
      isBurstModeActive,
      isFirstBurst,
      isLastBurst,
      firstBurstImage,
      identify,
      images,
      isSingleBurstPreview,
      isSequenceProject,
      tab
    } = this.props;
    const {
      identificationsPerPhoto,
      state: identifyState,
      seqIdsClassifiedByUser
    } = identify;
    const totalImagesInBurst = selectedImageGroupIndex ? imageGroups[selectedImageGroupIndex] : imageGroups[0];

    let isFirstFlag = isFirst;
    let isLastFlag = isLast;
    if (isSingleBurstPreview) {
      isFirstFlag = isFirstBurst;
      isLastFlag = isLastBurst;
    }
    let classifiedCount = 0;
    if (identifyState !== 'loading') {
      images.forEach((firstImage) => {
        const recordId = isSequenceProject ? +firstImage.sequenceId : +firstImage.id;
        const imgIdentifications = identificationsPerPhoto[recordId] || [{}];

        const cnfIdentification = imgIdentifications[0];
        let isIdentifiedByCV = cnfIdentification?.identificationMethod?.mlIdentification;

        if (isSequenceProject && tab === 'identify'
          && exists(cnfIdentification?.identificationMethod?.mlIdentification)
          && !cnfIdentification?.identificationMethod?.mlIdentification
          && seqIdsClassifiedByUser.indexOf(recordId) === -1) {
          isIdentifiedByCV = true;
        }

        if (exists(isIdentifiedByCV) && !isIdentifiedByCV) {
          classifiedCount += 1;
        }
      });
    }
    return (
      <ReactModal
        isOpen={selectedImageGroupIndex !== null && selectedImageGroupIndex !== undefined}
        onRequestClose={this.onClose}
        contentLabel="Image preview"
        className="c-image-preview-modal"
        contentRef={(node) => {
          this.el = node;
        }}
      >
        <div className="custom-container">
          <button
            type="button"
            className="btn btn-light close-button js-event-target"
            aria-label="Close"
            onClick={this.onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          {!isFirstFlag && (
            <button
              type="button"
              className="btn previous-button js-event-target"
              aria-label="Previous image"
              onClick={this.onClickPrevious}
            >
              <FontAwesomeIcon icon={faAngleLeft} size="lg" />
            </button>
          )}
          {!isLastFlag && (
            <button
              type="button"
              className="btn next-button js-event-target"
              aria-label="Next image"
              onClick={this.onClickNext}
            >
              <FontAwesomeIcon icon={faAngleRight} size="lg" />
            </button>
          )}
          <div className="main">
            {imagesLoading && (
              <div className="loading-section">
                <LoadingSpinner inline />
              </div>
            )}
            {!imagesLoading && (
              <div className="center-section" role="group" aria-roledescription="carousel">
                {(!isBurstModeActive || isSingleBurstPreview)
                  && (
                    <ImagePreview
                      imageGroups={imageGroups}
                      isSingleBurstPreview={isSingleBurstPreview}
                      firstBurstImage={firstBurstImage}
                      totalImagesInBurst={totalImagesInBurst}
                      classifiedCount={classifiedCount}
                    />
                  )
                }
                {isBurstModeActive && !isSingleBurstPreview
                  && (
                    <ImageSelector
                      imageGroups={imageGroups}
                    />)
                }
              </div>
            )}
          </div>
          {!imagesLoading && <Sidebar imageGroups={imageGroups} />}
        </div>
      </ReactModal>
    );
  }
}

export default ImagePreviewModal;
