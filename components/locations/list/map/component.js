import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';

import { exists, getCoordinatesBounds } from 'utils/functions';
import MapNoSSR from 'components/map-no-ssr';

import locationsQuery from './locations.graphql';
import './style.scss';

const LocationsMap = ({ projectId }) => {
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const bounds = useMemo(
    () => getCoordinatesBounds(locations.map(l => [l.latitude, l.longitude])),
    [locations]
  );

  const { data, loading, error } = useQuery(locationsQuery, {
    variables: { projectId },
    skip: !exists(projectId),
  });

  useEffect(() => {
    if (!error && !loading && data?.getLocations?.data) {
      setLocations(
        data.getLocations.data.filter(
          location => exists(location.latitude) && exists(location.longitude)
        )
      );
    }
  }, [error, loading, data, setLocations]);

  useEffect(() => {
    if (map?.current && locations.length) {
      map.current.fitBounds({
        east: bounds.ne.lng,
        north: bounds.ne.lat,
        south: bounds.sw.lat,
        west: bounds.sw.lng,
      });
    }
  });

  return (
    <div className="c-locations-list-map">
      <div className="card-img-top">
        <MapNoSSR ref={map}>
          {({ HTMLMarker, MarkerClusterer, Popup }) => {
            const markers = locations.map(location => (
              <HTMLMarker
                key={location.id}
                position={{ lat: location.latitude, lng: location.longitude }}
              >
                <Popup>
                  <span>{location.placename}</span>
                </Popup>
              </HTMLMarker>
            ));

            return <MarkerClusterer>{markers}</MarkerClusterer>;
          }}
        </MapNoSSR>
      </div>
    </div>
  );
};

LocationsMap.propTypes = {
  projectId: PropTypes.number,
};

LocationsMap.defaultProps = {
  projectId: null,
};

export default LocationsMap;
