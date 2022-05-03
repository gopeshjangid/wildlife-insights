import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Router } from 'lib/routes';
import MapNoSSR from 'components/map-no-ssr';

import './style.scss';

export const INITIAL_BOUNDS = [[-51.06, -49.04], [59.08, 77.51]];
const INITIAL_ZOOM = 2;

const DiscoverMap = ({ projects, project, bounds: extent }) => {
  const [map, setMap] = useState(null);
  useEffect(() => {
    if (map && project) {
      map.panTo({ lat: project.location.lat, lng: project.location.lng });
    }
  }, [project, map]);

  useEffect(() => {
    if (map && projects.length) {
      map.fitBounds({
        east: extent.ne.lng,
        north: extent.ne.lat,
        south: extent.sw.lat,
        west: extent.sw.lng
      });
    }
  }, [extent, projects, map]);

  const onClickMarker = useCallback(selectedProject => {
    Router.pushRoute('discover_project', {
      projectId: selectedProject.id,
      projectSlug: selectedProject.slug
    });
  }, []);

  const onRefChange = useCallback(node => {
    setMap(node);
  }, []);

  return (
    <div className="c-discover-map">
      <MapNoSSR
        ref={onRefChange}
        defaultZoom={INITIAL_ZOOM}
        zoom={project ? 5 : INITIAL_ZOOM}
        defaultOptions={{ gestureHandling: 'greedy', maxZoom: 15 }}
      >
        {({ HTMLMarker, Popup }) => {
          const markers = projects.map(p => {
            if (p.location) {
              return (
                <HTMLMarker
                  key={p.id}
                  position={{ lat: p.location.lat, lng: p.location.lng }}
                  active={!!project && project.id === p.id}
                  className="-discover"
                  iconSize={15}
                  onClick={() => onClickMarker(p)}
                  popupTrigger="mouseenter"
                >
                  <Popup>
                    <span>{p.shortName}</span>
                  </Popup>
                </HTMLMarker>
              );
            }
            return null;
          });

          return markers;
        }}
      </MapNoSSR>
    </div>
  );
};

DiscoverMap.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  project: PropTypes.shape({}),
  bounds: PropTypes.shape({
    ne: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired,
    sw: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
};

DiscoverMap.defaultProps = {
  project: undefined
};

export default DiscoverMap;
