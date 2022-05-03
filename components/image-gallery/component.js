import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { exists } from 'utils/functions';
import ImageGalleryModal from './modal';

import './style.scss';

class ImageGallery extends PureComponent {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired
    }))
  };

  static defaultProps = {
    images: []
  };

  state = {
    /**
     * Index of the selected photo
     * @type {number}
     */
    selectedIndex: null
  };

  onChooseNextImage() {
    const { images } = this.props;
    const { selectedIndex } = this.state;

    const isFirst = selectedIndex === 0;
    const isLast = images.length > 0 ? (selectedIndex === images.length - 1) : isFirst;

    if (isLast) {
      this.setState({ selectedIndex: 0 });
    } else {
      this.setState({ selectedIndex: selectedIndex + 1 });
    }
  }

  onChoosePreviousImage() {
    const { images } = this.props;
    const { selectedIndex } = this.state;

    const isFirst = selectedIndex === 0;

    if (isFirst) {
      this.setState({ selectedIndex: images.length - 1 });
    } else {
      this.setState({ selectedIndex: selectedIndex - 1 });
    }
  }

  render() {
    const { images } = this.props;
    const { selectedIndex } = this.state;

    const modalOpened = exists(selectedIndex) && exists(images[selectedIndex]);

    return (
      <div className="c-image-gallery">
        <ImageGalleryModal
          open={modalOpened}
          image={modalOpened ? images[selectedIndex] : null}
          onChooseNext={() => this.onChooseNextImage()}
          onChoosePrevious={() => this.onChoosePreviousImage()}
          onClose={() => this.setState({ selectedIndex: null })}
        />
        {images.slice(0, 5).map(({ url, alt }, i) => (
          <button
            key={url}
            type="button"
            className="item"
            aria-label={`Open ${alt}`}
            onClick={() => this.setState({ selectedIndex: i })}
          >
            {(i === 4 && images.length > 5) && (
              <div className="overlay lead font-weight-normal">
                +{images.length - 4} photos
              </div>
            )}
            <img src={url} alt={alt} />
          </button>
        ))}
      </div>
    );
  }
}

export default ImageGallery;
