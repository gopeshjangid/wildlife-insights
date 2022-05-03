import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import MapNoSSR from 'components/map-no-ssr';
import { getCoordinatesBounds } from 'utils/functions';
import './style.scss';

export const INITIAL_BOUNDS = [[-51.06, -49.04], [59.08, 77.51]];
const INITIAL_ZOOM = 2;

const DiscoverMap = ({ locations, mapDetails = { title: 'No title' } }) => {
  const [map, setMap] = useState(null);
  const locations1 = locations.map(val => {
    return {
      ...val,
      rate: (Math.random() * (0.12 - 0.02) + 0.02).toFixed(2)
    }

  });
  const bounds = useMemo(
    () => getCoordinatesBounds(locations.map(l => [l.latitude, l.longitude])),
    [locations]
  );
  useEffect(() => {
    if (map) {
      map.fitBounds({
        east: bounds.ne.lng,
        north: bounds.ne.lat,
        south: bounds.sw.lat,
        west: bounds.sw.lng
      });
    }
  }, [map]);

  const onClickMarker = useCallback(selectedProject => {}, []);

  const onRefChange = useCallback(node => {
    setMap(node);
  }, []);

  const getTileRanges = useMemo(
    () => () => {
      const classes = ['greyed', 'primary100', 'primary200', 'primary300'];
      let tileLists = locations?.length
        ? [...new Set(locations?.map(item => item.rate).sort((a, b) => a - b))]
        : [];
      const len = tileLists.length;
      const noOfRange = len ? Math.ceil(len / 3) : 1;
      const ranges = [];

      for (let i = 0; i < tileLists.length; i++) {
        const subList = tileLists.splice(0, noOfRange);
        ranges.push({
          start: Math.min.apply(null, subList),
          end: Math.max.apply(null, subList),
          class: classes[i]
        });
      }
      return { range: ranges };
    },
    [locations]
  );

  const { range } = getTileRanges();
  const getColorClass = useMemo(
    () => value => {
      const checkRange = rng => rng.start <= value && rng.end >= value;
      const matchedValue = range.find(checkRange);
      return matchedValue?.class || '-discover';
    },
    [range]
  );

  return (
    <div className="c-discover-map detection-map-box">
      <MapNoSSR
        ref={onRefChange}
        defaultZoom={INITIAL_ZOOM}
        zoom={5}
        defaultOptions={{ gestureHandling: 'greedy', maxZoom: 15 }}
      >
        {({ HTMLMarker, Popup }) => {
          const markers = locations.map((p, key) => {
            const className = getColorClass(p?.rate || 0);
            return (
              <HTMLMarker
                key={'marker-' + key}
                position={{
                  lat: p.latitude,
                  lng: p.longitude
                }}
                active={true}
                className={className}
                iconSize={15}
                onClick={() => onClickMarker(p)}
                // popupTrigger="mouseenter"
              >
                <Popup>
                  <div className="map-marker-container">
                    <div className="deployment-label">
                      <span className="title">Deployment Location:</span>
                      <span> {` ${p.deployment_location_id}`}</span>
                    </div>
                    <div className="deployment-label">
                      <span className="title">Detection Rate:</span>
                      <span>{` ${p.period_det_rates}`}</span>
                    </div>
                  </div>
                </Popup>
              </HTMLMarker>
            );
          });

          return <div>{markers}</div>;
        }}
      </MapNoSSR>
      <div className="legend">
        <div className="deployment-label">
          <span>{mapDetails?.title}</span>
        </div>
        {range.map((rng, key) => (
          <div key={`tile-${key}`} className="bar">
            <div className={`tile ${rng.class}`}></div>
            <span>
              {rng.start}&nbsp;-&nbsp;{rng.end}
            </span>
          </div>
        ))}
      </div>
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

export default React.memo(DiscoverMap);
