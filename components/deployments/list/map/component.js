import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import { keys, forEach, includes } from 'lodash';
import { exists, getCoordinatesBounds } from 'utils/functions';
import MapNoSSR from 'components/map-no-ssr';

import deploymentsQuery from './deployments.graphql';
import locationsQuery from './locations.graphql';
import './style.scss';

const DeploymentsMap = ({ projectId }) => {
  const map = useRef(null);
  const [deployments, setDeployments] = useState([]);
  const [locations, setLocations] = useState([]);
  const { data, loading, error } = useQuery(deploymentsQuery, {
    variables: { projectId },
    skip: !exists(projectId),
  });

  const { data: dataLocation, loading: loadingLocation, error: errorLocation } = useQuery(locationsQuery, {
    variables: { projectId },
    skip: !exists(projectId),
  });

  const locationsById = useMemo(
    () => {
      const mapData = deployments.reduce((res, deployment) => {
        if (
          !deployment.location
          || !deployment.location.id
          || !exists(deployment.location.latitude)
          || !exists(deployment.location.longitude)
        ) {
          return res;
        }

        return {
          ...res,
          [deployment.location.id]: {
            name: deployment.location.placename,
            latitude: deployment.location.latitude,
            longitude: deployment.location.longitude,
            count: exists(res[deployment.location.id]) ? res[deployment.location.id].count + 1 : 1,
          },
        };
      }, {});
      const deploymentLocIds = keys(mapData) || [];
      forEach(locations, (row) => {
        if (!includes(deploymentLocIds, row.id)) {
          mapData[row.id] = {
            name: row.placename,
            latitude: row.latitude,
            longitude: row.longitude,
            count: 0,
          };
        }
      });
      return mapData;
    },
    [deployments, locations]
  );

  const markerSizeScale = useMemo(() => {
    const values = Object.keys(locationsById).map(locationId => locationsById[locationId].count);
    const extent = [Math.min(...values), Math.max(...values)];
    return (value) => {
      const min = 9;
      const max = 19;

      if (extent[0] === extent[1]) {
        return (min + max) / 2;
      }

      const ratio = (value - extent[0]) / (extent[1] - extent[0]);
      return (max - min) * ratio + min;
    };
  }, [locationsById]);

  const bounds = useMemo(
    () => getCoordinatesBounds(
      Object.keys(locationsById).map(locationId => [
        locationsById[locationId].latitude,
        locationsById[locationId].longitude,
      ])
    ),
    [locationsById]
  );

  useEffect(() => {
    if (!error && !loading && data?.getDeploymentsByProject?.data) {
      setDeployments(data.getDeploymentsByProject.data);
    }
  }, [data, loading, error, setDeployments]);

  useEffect(() => {
    if (!errorLocation && !loadingLocation && dataLocation?.getLocations?.data) {
      setLocations(
        dataLocation.getLocations.data.filter(
          location => exists(location.latitude) && exists(location.longitude)
        )
      );
    }
  }, [errorLocation, loadingLocation, dataLocation, setLocations]);

  useEffect(() => {
    if (map?.current && (deployments.length || locations.length)) {
      map.current.fitBounds({
        east: bounds.ne.lng,
        north: bounds.ne.lat,
        south: bounds.sw.lat,
        west: bounds.sw.lng,
      });
    }
  });

  return (
    <div className="c-deployments-list-map">
      <div className="card-img-top">
        <MapNoSSR ref={map}>
          {({ HTMLMarker, MarkerClusterer, Popup }) => {
            const markers = Object.keys(locationsById).map(locationId => (
              <HTMLMarker
                key={locationId}
                position={{
                  lat: locationsById[locationId].latitude,
                  lng: locationsById[locationId].longitude,
                }}
                // The "6" constant is for the border
                iconSize={markerSizeScale(locationsById[locationId].count) + 6}
              >
                <Popup>
                  <span>
                    {locationsById[locationId].name} ({locationsById[locationId].count}{' '}
                    {`camera deployment${locationsById[locationId].count > 1 ? 's' : ''}`})
                  </span>
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

DeploymentsMap.propTypes = {
  projectId: PropTypes.number,
};

DeploymentsMap.defaultProps = {
  projectId: null,
};

export default DeploymentsMap;
