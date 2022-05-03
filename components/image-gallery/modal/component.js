import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import './style.scss';

class ImageGalleryModal extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    image: PropTypes.shape({
      url: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired
    }),
    onChooseNext: PropTypes.func.isRequired,
    onChoosePrevious: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
  };

  static defaultProps = {
    image: null
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      ReactModal.setAppElement('body');
    }
  }

  componentDidUpdate(prevProps) {
    const { open, image } = this.props;

    if (prevProps.image !== image && open && this.el) {
      this.el.focus();
    }
  }

  componentWillUnmount() {
    if (this.el) {
      this.el.removeEventListener('keyup', this.onKeyUp);
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  onKeyUp = (e) => {
    const { onChooseNext, onChoosePrevious } = this.props;

    const acceptEvent = e.target === e.currentTarget
      || /** @type {HTMLElement} */(e.target).classList.contains('js-event-target');

    if (acceptEvent) {
      const right = [39, 40];
      const left = [37, 38];

      if (right.indexOf(e.keyCode) !== -1) {
        e.preventDefault();
        onChooseNext();
      } else if (left.indexOf(e.keyCode) !== -1) {
        e.preventDefault();
        onChoosePrevious();
      }
    }
  };

  render() {
    const { open, image, onClose, onChooseNext, onChoosePrevious } = this.props;

    return (
      <ReactModal
        isOpen={open}
        onRequestClose={onClose}
        contentLabel="Image"
        className="c-image-gallery-modal"
        contentRef={(node) => {
          this.el = node;
        }}
        onAfterOpen={() => this.el && this.el.addEventListener('keyup', this.onKeyUp)}
      >
        <div className="custom-container">
          <button
            type="button"
            className="btn btn-light close-button js-event-target"
            aria-label="Close"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <button
            type="button"
            className="btn previous-button js-event-target"
            aria-label="Previous image"
            onClick={onChoosePrevious}
          >
            <FontAwesomeIcon icon={faAngleLeft} size="lg" />
          </button>
          <button
            type="button"
            className="btn next-button js-event-target"
            aria-label="Next image"
            onClick={onChooseNext}
          >
            <FontAwesomeIcon icon={faAngleRight} size="lg" />
          </button>
          {open && (
            <img src={image.url} alt={image.alt} />
          )}
        </div>
      </ReactModal>
    );
  }
}

export default ImageGalleryModal;
