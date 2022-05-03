import React, { Fragment, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useQuery } from 'react-apollo-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { getFormattedUTCDate } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import MapNoSSR from 'components/map-no-ssr';
import getOtimizedImageUrl from './image-otimized-url.graphql';
import getOriginalImageUrl from 'utils/shared-gql-queries/image-original-url.graphql';

import './style.scss';

const IMAGE_PREVIEW_WIDTH = 500;

const ImagePreview = ({
  images,
  selectedImageIndex,
  selectedImageGroups,
  selectedImageGroupIndex,
  setSelectedImageGroups,
  setSelectedImageIndex,
  brightness,
  contrast,
  saturation,
  tab,
  showBoundingBoxesOnImage,
  setShowBoundingBoxSettings,
  isSingleBurstPreview,
  firstBurstImage,
  totalImagesInBurst,
  classifiedCount,
  setIsSingleBurstPreview
}) => {
  const getDateInUTC = str => getFormattedUTCDate(str, 'MM/dd/yyyy HH:mm:ss');
  const map = useRef(null);
  const imageEl = useRef(null);
  const [imageBounds, setImageBounds] = useState(null);
  const [boundingBoxes, setBoundingBoxes] = useState(null);
  const [rectangleBounds, setRectangleBounds] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [stylesheet, setStylesheet] = useState(null);

  const image = images[selectedImageIndex];
  const imageCount = images.length;
  const dataFileId = image?.id;
  const imgBoundingBoxes = image?.boundingBoxes;
  const onLoadImage = () => setImageLoaded(true);
  const onIdleMap = () => setMapLoaded(true);

  const { data, loading, error } = useQuery(
    showOriginalImage ? getOriginalImageUrl : getOtimizedImageUrl,
    {
      variables: {
        projectId: +image?.deployment.projectId,
        deploymentId: +image?.deployment.id,
        id: +image?.id,
        ...(!showOriginalImage ? {
          size: IMAGE_PREVIEW_WIDTH
        } : {})
      },
      skip: !image,
    });

  useEffect(() => {
    // This code makes sure that if a user deletes the last photo of a burst,
    // the selected photo is moved to the last one remaining
    if (imageCount && selectedImageIndex > imageCount - 1) {
      setSelectedImageIndex(imageCount - 1);
    }
  }, [imageCount, selectedImageIndex, setSelectedImageIndex]);

  useEffect(() => {
    if (dataFileId) {
      setImageLoaded(false);
      setMapLoaded(false);
      setImageBounds(null);
      setRectangleBounds(null);

      let parsedDetectionBoxes;
      if (imgBoundingBoxes && tab === 'identify') {
        try {
          /*
          1. In api response, boundingBoxes for an image are returned as a string.
             Example - "boundingBoxes": "{\"{\\\"detectionBox\\\":[0.51344794,0.580174387,
               0.978692055,0.916662037]}\",\"{\\\"detectionBox\\\":[0.599341691,
               0.42663905,0.959205627,0.623996496]}\"}"
          2. To parse boundingBoxes string into js object, string replacement is 
             performed to substitute first occurrence of "{" and last occurrence of "}" 
             with "[" and "]".
          3. Then two level of parsing is executed to get the desired detectionBoxes.
          */
          const topLevelObj = JSON.parse(
            imgBoundingBoxes.replace(/\{/, "[").replace(/}(?=[^}]*$)/, ']')
          );
          parsedDetectionBoxes = topLevelObj.map(val => JSON.parse(val).detectionBox);
        } catch (e) { } // eslint-disable-line no-empty
      }

      if (Array.isArray(parsedDetectionBoxes) && parsedDetectionBoxes.length) {
        setBoundingBoxes(parsedDetectionBoxes);
        setShowBoundingBoxSettings(true);
      } else {
        setBoundingBoxes(null);
        setShowBoundingBoxSettings(false);
      }
    }
  }, [dataFileId, imgBoundingBoxes, showOriginalImage]);

  useEffect(() => {
    if (!error && !loading
      && (data?.getDataFilePreviewUrl || data?.getDataFileDownloadUrl)) {
      setImageUrl(data?.getDataFilePreviewUrl?.url || data?.getDataFileDownloadUrl?.url);
    }
  }, [data, loading, error, setImageUrl]);

  useEffect(() => {
    if (mapLoaded && imageLoaded) {
      const width = map.current.getDiv().offsetWidth;
      const height = map.current.getDiv().offsetHeight;

      // Ratio applied to the image so it perfectly fits in the container
      const ratio = Math.min(
        width / imageEl.current.naturalWidth,
        height / imageEl.current.naturalHeight
      );

      // Offset from the top left corner so the image is centered in the map
      const imageOffset = [
        (width - imageEl.current.naturalWidth * ratio) / 2,
        (height - imageEl.current.naturalHeight * ratio) / 2,
      ];

      const projection = map.current.getProjection();
      const mapScale = 2 ** map.current.getZoom();

      // Since all the map doesn't actually fit the container, we compute the offset in pixels
      const mapOffset = [
        projection.fromLatLngToPoint(map.current.getBounds().getSouthWest()).x,
        projection.fromLatLngToPoint(map.current.getBounds().getNorthEast()).y,
      ];

      // This part of the code is quite complex:
      // Everything that is divided by mapScale is actually the standard calculation to center the
      // image in the map container
      // The rest (mapScale and mapOffset) are needed by the map to position correctly the image
      // within it
      // For more details have a look here: https://stackoverflow.com/a/34567927
      const northEast = projection.fromPointToLatLng(
        new google.maps.Point(
          (imageEl.current.naturalWidth * ratio + imageOffset[0]) / mapScale + mapOffset[0],
          imageOffset[1] / mapScale + mapOffset[1]
        )
      );

      const southWest = projection.fromPointToLatLng(
        new google.maps.Point(
          imageOffset[0] / mapScale + mapOffset[0],
          (imageEl.current.naturalHeight * ratio + imageOffset[1]) / mapScale + mapOffset[1]
        )
      );

      const bounds = {
        north: northEast.lat(),
        south: southWest.lat(),
        east: northEast.lng(),
        west: southWest.lng(),
      };

      setImageBounds(bounds);
    }
  }, [mapLoaded, imageLoaded, setImageBounds]);

  useEffect(() => {
    if (mapLoaded && imageLoaded && boundingBoxes && imageBounds) {
      const width = map.current.getDiv().offsetWidth;
      const height = map.current.getDiv().offsetHeight;

      const projection = map.current.getProjection();
      const mapScale = 2 ** map.current.getZoom();
      const ratio = Math.min(
        width / imageEl.current.naturalWidth,
        height / imageEl.current.naturalHeight
      );

      const wc = projection.fromLatLngToPoint(
        new google.maps.LatLng(imageBounds.north, imageBounds.west)
      );

      let pointOne, pointTwo;
      const imgWidth = imageEl.current.naturalWidth;
      const imgHeight = imageEl.current.naturalHeight;
      const latLngPoints = [];

      for (let i = 0; i < boundingBoxes.length; i++) {
        pointOne = new google.maps.Point(((wc.x * mapScale) + (imgWidth * boundingBoxes[i][1] * ratio)) / mapScale,
          ((wc.y * mapScale) + (imgHeight * boundingBoxes[i][0] * ratio)) / mapScale
        );

        pointTwo = new google.maps.Point(((wc.x * mapScale) + (imgWidth * boundingBoxes[i][3] * ratio)) / mapScale,
          ((wc.y * mapScale) + (imgHeight * boundingBoxes[i][2] * ratio)) / mapScale
        );

        const ne = projection.fromPointToLatLng(pointOne);
        const sw = projection.fromPointToLatLng(pointTwo);
        latLngPoints.push({
          north: ne.lat(),
          south: sw.lat(),
          east: sw.lng(),
          west: ne.lng(),
        });
      }
      setRectangleBounds(latLngPoints);
    }
  }, [mapLoaded, imageLoaded, boundingBoxes, imageBounds, setRectangleBounds]);

  useEffect(() => {
    if (!stylesheet) {
      const style = document.createElement('style');
      document.head.appendChild(style);
      setStylesheet(style.sheet);
    } else {
      // First of all, we delete the rule, if it already exists
      try {
        stylesheet.deleteRule(0);
      } catch (e) { } // eslint-disable-line no-empty

      // Second, we (re)create it with the new values
      stylesheet.insertRule(
        `
        .gm-style > div:first-of-type img, .gm-style > div:first-of-type canvas {
          filter: brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%);
        }
        `,
        0
      );
    }
  }, [stylesheet, brightness, contrast, saturation]);

  if (!images.length || !image) {
    return null;
  }

  const renderDeploymentSection = () => {
    return (
      <div className="deployment-info">
        <div className="title-holder">
          <div className="title">{firstBurstImage?.deployment?.deploymentName}</div>
          <div className="subtitle">Date taken: {getDateInUTC(firstBurstImage?.timestamp)}</div>
        </div>

        <div className="separator"></div>

        <div>
          <div className="title">
            {classifiedCount}/{totalImagesInBurst?.length}
          </div>
          <div className="subtitle">Classified</div>
        </div>
      </div>
    );
  };

  const renderErrorComponent = () => {
    return (
      <div className="alert alert-warning" role="alert">
        {"It seems you don't have the permissions to access to this image."}
      </div>
    );
  };

  const renderCloseBtn = () => {
    if (!isSingleBurstPreview) {
      return null;
    }
    return (
      <button
        type="button"
        className="close-button"
        onClick={() => setIsSingleBurstPreview(false)}
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>
    );
  }

  return (
    <div className="c-image-preview">
      {error && !loading && (
        <Fragment>
          {!isSingleBurstPreview
            && renderErrorComponent()}
          {isSingleBurstPreview
            && (
              <Fragment>
                {renderDeploymentSection()}
                <div className="d-flex error-container">
                  {renderErrorComponent()}
                  {renderCloseBtn()}
                </div>
              </Fragment>
            )
          }
        </Fragment>
      )}
      {!error && loading && (
        <div className="text-center">
          <LoadingSpinner inline transparent />
        </div>
      )}
      {!error && !loading && (
        <Fragment>
          {isSingleBurstPreview
            && renderDeploymentSection()}
          <div className="checkbox">
            <input
              type="checkbox"
              name="card-view-checkbox"
              className="js-event-target"
              checked={selectedImageGroups.indexOf(selectedImageGroupIndex) !== -1}
              onChange={() => {
                if (selectedImageGroups.indexOf(selectedImageGroupIndex) !== -1) {
                  const newSelectedDataFileIds = [...selectedImageGroups];
                  newSelectedDataFileIds.splice(
                    selectedImageGroups.indexOf(selectedImageGroupIndex),
                    1
                  );
                  setSelectedImageGroups(newSelectedDataFileIds);
                } else {
                  setSelectedImageGroups([...selectedImageGroups, selectedImageGroupIndex]);
                }
              }}
              aria-label={
                images.length === 1
                  ? `Select photo ${image.filename}`
                  : `Select burst (${images.length} photos)`
              }
            />
            <div />
          </div>
          <div
            id="image-preview-panel"
            className={classnames('map', { 'single-view': isSingleBurstPreview })}
            role="tabpanel"
            aria-label={`Image ${image.filename}`}
          >
            {renderCloseBtn()}
            <MapNoSSR
              ref={map}
              defaultMapTypeId="empty"
              defaultCenter={{ lat: 0, lng: 0 }}
              defaultZoom={3}
              defaultOptions={{ minZoom: 2, maxZoom: 6, keyboardShortcuts: false }}
              onIdle={onIdleMap}
              enableKeyboardZoom
              toggleImageControl={{
                callBack: (arg) => {
                  setShowOriginalImage(!!arg);
                },
                showOriginalImage
              }}
            >
              {({ ImageOverlay, Rectangle }) => {
                if (imageBounds) {
                  return (
                    <Fragment>
                      {
                        showBoundingBoxesOnImage && rectangleBounds && (
                          <Fragment>
                            {
                              rectangleBounds.map((bounds, idx) => {
                                return (
                                  <Rectangle
                                    key={idx}
                                    options={{
                                      strokeColor: '#ff0000',
                                      fillOpacity: 0,
                                      strokeWeight: 2
                                    }}
                                    bounds={bounds} />
                                );
                              })
                            }
                          </Fragment>
                        )
                      }
                      <ImageOverlay defaultBounds={imageBounds} defaultUrl={imageUrl} />
                    </Fragment>
                  );
                }
                return null;
              }}
            </MapNoSSR>
          </div>
          <img
            src={imageUrl}
            alt="Preview"
            ref={imageEl}
            onLoad={onLoadImage}
            style={{ display: 'none' }}
          />
        </Fragment>
      )}
    </div>
  );
};

ImagePreview.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({ thumbnailUrl: PropTypes.string })),
  selectedImageGroupIndex: PropTypes.number,
  selectedImageIndex: PropTypes.number.isRequired,
  brightness: PropTypes.number.isRequired,
  contrast: PropTypes.number.isRequired,
  saturation: PropTypes.number.isRequired,
  showBoundingBoxesOnImage: PropTypes.bool.isRequired,
  tab: PropTypes.string.isRequired,
  selectedImageGroups: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelectedImageGroups: PropTypes.func.isRequired,
  setShowBoundingBoxSettings: PropTypes.func.isRequired,
  isSingleBurstPreview: PropTypes.bool.isRequired,
  firstBurstImage: PropTypes.shape({}).isRequired,
  totalImagesInBurst: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  classifiedCount: PropTypes.number.isRequired,
  setIsSingleBurstPreview: PropTypes.func.isRequired,
  setSelectedImageIndex: PropTypes.func.isRequired
};

ImagePreview.defaultProps = {
  images: [],
  selectedImageGroupIndex: null
};

export default ImagePreview;
