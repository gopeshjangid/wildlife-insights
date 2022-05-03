import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

import LoadingSpinner from 'components/loading-spinner';
import MapHTMLMarker from './map-html-marker';
import MapMarkerClusterer from './map-marker-clusterer';
import MapPopup from './map-popup';
import { getMap } from './helpers';

import './style.scss';

const MIN_ZOOM = 2;
const MAX_ZOOM = 20;

const LoadingComponent = () => (
  <div className="c-map-no-ssr d-flex justify-content-center align-items-center">
    <LoadingSpinner inline />
  </div>
);

const Component = (
  { children, forwardedRef, ...props },
  { ReactGoogleMaps: { withGoogleMap, withScriptjs, GoogleMap, GroundOverlay, ...rest } }
) => {
  const Map = getMap(GoogleMap, withScriptjs, withGoogleMap);

  return (
    <Map
      ref={forwardedRef}
      googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}`}
      containerElement={<div className="c-map-no-ssr" />}
      mapElement={<div className="map" />}
      loadingElement={<LoadingComponent />}
      mapProps={props}
    >
      {children
        && children({
          ...rest,
          MarkerClusterer: MapMarkerClusterer,
          HTMLMarker: MapHTMLMarker,
          Popup: MapPopup,
          ImageOverlay: GroundOverlay,
        })}
    </Map>
  );
};

Component.propTypes = {
  children: PropTypes.func,
  forwardedRef: PropTypes.shape({}).isRequired,
};

Component.defaultProps = {
  children: null,
};

const DynamicComponent = dynamic(
  {
    // @ts-ignore
    modules: () => ({
      ReactGoogleMaps: () => import('react-google-maps'),
    }),
    render: Component,
  },
  {
    ssr: false,
    loading: LoadingComponent,
  }
);

export default /** @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{ [x: string]: any; }>
  & React.RefAttributes<any>>} */ (forwardRef(
  (props, ref) => <DynamicComponent {...props} forwardedRef={ref} />
));

export { MIN_ZOOM, MAX_ZOOM };
