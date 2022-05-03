import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';

import { exists, translateText } from 'utils/functions';
import { parseImage } from 'lib/imageFiles';
import T from 'components/transifex/translate';
import config from './contants';
import './style.scss';

class ImagesDropzone extends PureComponent {
  static propTypes = {
    /**
     * Initial images to display in the dropzone
     */
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        /** File object */
        instance: PropTypes.object,
        /** URL of the image */
        url: PropTypes.string,
      })
    ),
    /**
     * Number of images displayed in the component
     * This is not a limit of the number of images
     */
    max: PropTypes.number,
    /**
     * Callback executed when the images changes
     * The definition is the following:
     * function({ id: number, instance: File, name: string, type: string }[]) => any
     */
    onChange: PropTypes.func,
    /**
     * Props to pass to React-Dropzone
     */
    options: PropTypes.shape({}),
  }

  static defaultProps = {
    images: [],
    max: 16,
    onChange: () => null,
    options: {},
  }

  static getImages = (images, imageName) => images.filter(img => imageName !== img.name)

  constructor(props) {
    super(props);
    this.state = { images: props.images || [] };
  }

  onChangeAltText(imageId, text) {
    const { onChange } = this.props;
    const { images } = this.state;
    const imageIndex = images.findIndex(image => image.id === imageId);

    if (imageIndex !== -1) {
      const newImages = [
        ...images.slice(0, imageIndex),
        {
          ...images[imageIndex],
          alt: text,
        },
        ...images.slice(imageIndex + 1, images.length),
      ];

      this.setState({ images: newImages });
      onChange(newImages);
    }
  }

  onDropImages = (nextImages) => {
    const { onChange } = this.props;
    const { images } = this.state;
    const result = images.slice(0);

    nextImages.forEach((nextImg) => {
      const image = new File([nextImg], nextImg.name, { type: nextImg.type });
      const existingImage = images.find(img => img.name === image.name);
      if (!existingImage) {
        // eslint-disable-next-line dot-notation
        image['id'] = Date.now();
        result.push(parseImage(image));
      }
    });

    this.setState({ images: result });

    onChange(result);
  }

  onDropRejected = () => {
    const { displayError } = this.props;

    displayError({
      title: translateText('Unable to process the files'),
      message: translateText('Some of selected files are not supported or bigger than 20MB.'),
    });
  }

  onRemoveImage(e, imageName) {
    if (e) e.stopPropagation();
    const { onChange } = this.props;
    const { images } = this.state;
    const nextImages = ImagesDropzone.getImages(images, imageName);

    this.setState({ images: nextImages });
    onChange(nextImages);
  }

  render() {
    const { images } = this.state;
    const { length: imagesLength } = images;
    const { max, askAlternativeText, options } = this.props;
    const opts = { ...config, ...options };

    let totalImages = images;

    if (imagesLength === max) {
      totalImages = images.slice(0, max);
    } else if (imagesLength > max) {
      totalImages = images.slice(0, max - 1);
    }

    const { length: totalImagesLength } = totalImages;

    const multiple = !exists(options.multiple) || options.multiple;
    const canUpload = multiple || (!multiple && images.length === 0);
    const askAltText = exists(askAlternativeText) && askAlternativeText;

    return (
      <div
        className={classNames('c-upload-image', opts.disabled ? '-disabled' : null)}
      >
        {totalImages && totalImagesLength > 0 && (
          <div
            className={classNames(
              'preview-panel',
              !multiple && !askAltText ? '-single-image' : null,
              askAltText ? '-two-columns' : null
            )}
          >
            {totalImages.map(({ id, name, instance, url, alt }) => (
              <div key={id} className="image-container d-flex d-align-items-center">
                <div
                  className="thumbnail"
                  style={{
                    backgroundImage: url ? `url(${url})` : `url(${URL.createObjectURL(instance)})`,
                  }}
                >
                  {!opts.disabled && (
                    <button
                      type="button"
                      className="close"
                      aria-label={translateText('Close')}
                      onClick={e => this.onRemoveImage(e, name)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  )}
                </div>
                {askAltText && (
                  <label htmlFor={`images-dropzone-text-${id}`} className="ml-3">
                    <T text="Alternative text" />
                    <input
                      type="text"
                      id={`images-dropzone-text-${id}`}
                      className="form-control form-control-sm d-block mt-1"
                      name="alternative-text"
                      placeholder="Describe with a few words"
                      value={alt}
                      onChange={({ target }) => this.onChangeAltText(id, target.value)}
                      disabled={!!opts.disabled}
                    />
                  </label>
                )}
              </div>
            ))}
            {imagesLength > max && totalImages !== max && (
              <div className="more">
                <T text="+{images}" params={{ images: imagesLength - totalImagesLength }} />
              </div>
            )}
          </div>
        )}
        {canUpload && (
          <Dropzone
            {...opts}
            onDrop={this.onDropImages}
            onDropRejected={this.onDropRejected}
            className="dropzone-panel"
          >
            {opts.disabled && (
              <p>
                <T text="Upload has been disabled in edition mode." />
              </p>
            )}
            {!opts.disabled && multiple && (
              <p>
                <T text="Drop some images here, or click to select images to upload." />
              </p>
            )}
            {!opts.disabled && !multiple && (
              <p>
                <T text="Drop an image here, or click to select an image to upload." />
              </p>
            )}
          </Dropzone>
        )}
      </div>
    );
  }
}

export default ImagesDropzone;
