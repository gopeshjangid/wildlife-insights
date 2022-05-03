import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import './style.scss';

const SLIDER_SETTINGS = {
  autoplay: false,
  infinite: true,
  speed: 1000,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: false,
  accessibility: false,
  prevArrow: (
    <button type="button" aria-label="Previous photo">
      <FontAwesomeIcon icon={faAngleLeft} />
    </button>
  ),
  nextArrow: (
    <button type="button" aria-label="Next photo">
      <FontAwesomeIcon icon={faAngleRight} />
    </button>
  ),
};

const HighlightedImageModal = ({
  selectedImgIndex,
  highlightedPhotos,
  onClose
}) => {
  const [modalRef, setModalRef] = useState(null);
  const [sliderRef, setSliderRef] = useState(null);

  const onKeyUpHandler = (e) => {
    if (sliderRef) {
      if (e.keyCode === 37) {
        e.preventDefault();
        sliderRef.slickPrev();
      } else if (e.keyCode === 39) {
        e.preventDefault();
        sliderRef.slickNext();
      }
    }
  };

  useEffect(() => {
    if (modalRef) {
      modalRef.addEventListener('keyup', onKeyUpHandler);
      return () => {
        modalRef.removeEventListener('keyup', onKeyUpHandler);
      }
    }
  }, [modalRef]);

  const onModalRefChange = (modal) => {
    setModalRef(modal);
  };

  const onSliderRefChange = (slider) => {
    if (!sliderRef && slider) {
      slider.slickGoTo(selectedImgIndex, true);
      setSliderRef(slider);
    }
  };

  return (
    <ReactModal
      isOpen={selectedImgIndex > -1}
      onRequestClose={onClose}
      className="c-highlighted-photos-modal"
      contentLabel="Highlighted photos"
      contentRef={onModalRefChange}
    >
      <div className="content-panel">
        <div className="header-class d-flex justify-content-end">
          <button type="button" className="close-btn" onClick={onClose}>
            <img alt="" src="/static/ic_cancel_white_24px.png" />
          </button>
        </div>

        {!!highlightedPhotos.length && (
          <div className="slider">
            <Slider ref={onSliderRefChange} {...SLIDER_SETTINGS}>
              {highlightedPhotos.map((photo) => {
                return (
                  <div key={photo.thumbnailUrl} className="photo-container">
                    <div className="photo">
                      <img alt="" src={photo.thumbnailUrl} />
                    </div>
                    {
                      photo.imageSpecies && photo.imageSpecies.length > 0 &&
                      <p className="img-species">{photo.imageSpecies.join(', ')}</p>
                    }
                  </div>
                )
              })}
            </Slider>
          </div>
        )}
      </div>
    </ReactModal>
  );
};

HighlightedImageModal.propTypes = {
  selectedImgIndex: PropTypes.number.isRequired,
  highlightedPhotos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HighlightedImageModal;
