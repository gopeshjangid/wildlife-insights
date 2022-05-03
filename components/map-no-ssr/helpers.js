import React, { Fragment, forwardRef } from 'react';
import omit from 'lodash/omit';

import { exists } from 'utils/functions';
import MapZoomControl from './map-zoom-control';
import { MIN_ZOOM, MAX_ZOOM } from './index';

/**
 * Return a MapType object that represents an empty basemap
 */
const getEmptyMapType = () => {
  // @ts-ignore
  if (typeof window === 'undefined' || !exists(window.google)) {
    return null;
  }

  // @ts-ignore
  return new google.maps.ImageMapType({
    name: 'empty',
    getTileUrl: () => null,
    // @ts-ignore
    tileSize: new google.maps.Size(256, 256),
    minZoom: 1,
    maxZoom: MAX_ZOOM,
  });
};

const getMap = (() => {
  const cache = {};
  let Map;

  return (GoogleMap, withScriptjs, withGoogleMap) => {
    // We cache the parameters so the component is not regenerated on each render, which reloads the
    // map
    if (
      GoogleMap !== cache.GoogleMap
      || withScriptjs !== cache.withScriptjs
      || withGoogleMap !== cache.withGoogleMap
    ) {
      cache.GoogleMap = GoogleMap;
      cache.withScriptjs = withScriptjs;
      cache.withGoogleMap = withGoogleMap;

      const Component = withScriptjs(
        withGoogleMap(({ forwardedRef, mapProps, children }) => {
          const emptyMapType = getEmptyMapType();
          const cleanedMapProps = omit(mapProps, ['defaultOptions']);

          return (
            <GoogleMap
              ref={forwardedRef}
              defaultExtraMapTypes={[
                [emptyMapType.name, emptyMapType],
              ]}
              defaultZoom={1}
              defaultCenter={{ lat: 20, lng: 0 }}
              defaultOptions={{
                disableDefaultUI: true,
                gestureHandling: 'cooperative',
                // We hide all the POIs and other interactive elements from the map
                styles: [
                  {
                    featureType: 'poi',
                    stylers: [
                      {
                        visibility: 'off'
                      }
                    ]
                  },
                  {
                    featureType: 'transit',
                    elementType: 'labels',
                    stylers: [
                      {
                        visibility: 'off'
                      }
                    ]
                  }
                ],
                ...(mapProps?.defaultOptions || {}),
              }}
              {...cleanedMapProps}
            >
              <Fragment>
                <MapZoomControl
                  node={document.createElement('div')}
                  minZoom={mapProps?.defaultOptions?.minZoom || MIN_ZOOM}
                  maxZoom={mapProps?.defaultOptions?.maxZoom || MAX_ZOOM}
                  enableKeyboardZoom={mapProps?.enableKeyboardZoom}
                  toggleImageControl={mapProps?.toggleImageControl}
                />
                {children}
              </Fragment>
            </GoogleMap>
          );
        })
      );

      Map = /** @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{ [x: string]: any; }> & React.RefAttributes<any>>} */ (forwardRef(
        (props, ref) => <Component {...props} forwardedRef={ref} />
      ));
    }

    return Map;
  };
})();

export { getMap };
export default getMap;
