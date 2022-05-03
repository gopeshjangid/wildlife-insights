import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import { MAP } from 'react-google-maps/lib/constants';

import './style.scss';

const MapMarkerClusterer = ({ children, ...props }, context) => {
  const map = context[MAP];
  const [flagMaxZoom, setFlagMaxZoom] = useState(true);

  useEffect(() => {
    const onZoomChanged = () => {
      setFlagMaxZoom(map.maxZoom > map.getZoom());
    };
    const listener = google.maps.event.addListener(map, 'zoom_changed', onZoomChanged);
    return () => listener.remove();
  }, [map]);

  const popup = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(0, -20 / 2),
  });

  const onClick = (cluster) => {
    const markers = cluster.getMarkers();
    const popupContent = markers[0].clusterPopupContent;
    const markerClusters = cluster.getMarkerClusterer();
    if (popupContent && (markerClusters.getClusters().length === 1 || !flagMaxZoom)) {
      popup.setPosition(cluster.getCenter());
      popup.setContent(popupContent);
      popup.open(cluster.getMap());
    }
    
  }

  return (
    // @ts-ignore
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <MarkerClusterer
      averageCenter
      gridSize={40}
      styles={[
        {
          width: 30,
          height: 30,
        },
      ]}
      onClick={onClick}
      {...props}
    >
      {children}
    </MarkerClusterer>
  );
};

MapMarkerClusterer.contextTypes = {
  [MAP]: PropTypes.shape({}),
};

export default MapMarkerClusterer;
