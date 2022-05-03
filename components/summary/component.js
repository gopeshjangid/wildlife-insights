import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';

import { getCoordinatesBounds, exists } from 'utils/functions';
import MapNoSSR from 'components/map-no-ssr';
import ProjectsGrid from 'components/projects/grid';
import Analytics from 'components/statistics/analytics';
import AnalyticsWidgets from 'components/statistics/analytics-widgets';
import Dropdown from 'components/dropdown';
import getLocationsQuery from './locations.graphql';
import './style.scss';

const Summary = ({ organizationId, initiativeId, projectId, routeName, projectType, organizationData, orgAnalyticType, setOrgAnalyticType }) => {
  const [initialRouteName] = useState(routeName);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const bounds = useMemo(
    () => getCoordinatesBounds(locations.map(l => [l.latitude, l.longitude])),
    [locations]
  );

  const { data, loading } = useQuery(getLocationsQuery, {
    variables: { organizationId, projectId, initiativeId },
    skip: initialRouteName !== routeName
  });

  useEffect(() => {
    if (!loading && data && data.getLocations) {
      setLocations(data.getLocations.data.filter(l => l.latitude !== null && l.longitude !== null));
    }
  }, [data, loading]);

  useEffect(() => {
    if (organizationData?.projectType === 'both') {
      setOrgAnalyticType('All');
    } else if (organizationData?.projectType === 'sequence') {
      setOrgAnalyticType('Sequence');
    } else if (organizationData?.projectType === 'image') {
      setOrgAnalyticType('Image');
    }
  }, [organizationData]);

  useEffect(() => {
    return () => {
      setOrgAnalyticType('');
    };
  }, []);

  useEffect(() => {
    if (map && map.current && locations.length) {
      map.current.fitBounds({
        east: bounds.ne.lng,
        north: bounds.ne.lat,
        south: bounds.sw.lat,
        west: bounds.sw.lng,
      });
    }
  }, [map, locations, bounds]);

  if (initialRouteName !== routeName) {
    // to avoid unnecessary rerendering and api calls on route change
    return null;
  }

  const buildClusterPopupContent = (location) => {
    let clusterPopupContent = '';
    if (!projectId) {
      clusterPopupContent += `${location.project?.shortName}<br />`;
      if (location?.project?.initiatives?.length > 0) {
        clusterPopupContent += `${
            location?.project?.initiatives.map(({ name }) => name).join(',')
        }<br />`;
      }
      clusterPopupContent += `${location.project?.metadata?.project_admin_email}<br />`;
    }
    clusterPopupContent += `${location?.placename}`;
    return clusterPopupContent;
  };

  let orgAnalyticOptions = [
    'species',
    'images',
    'wildlifeImages',
    'locations',
    'deployments',
    'devices',
    'firstSurveyDate',
    'lastSurveyDate',
    'samplingDays',
    'imagesPerDeployment',
    'projects'
  ];
  if (orgAnalyticType === 'All') {
    orgAnalyticOptions = [
      'locations',
      'deployments',
      'devices',
      'firstSurveyDate',
      'lastSurveyDate',
      'samplingDays',
      'projects'
    ];
  } else if (orgAnalyticType === 'Sequence') {
    orgAnalyticOptions = [
      'species',
      'sequence',
      'wildlifeSequences',
      'locations',
      'deployments',
      'devices',
      'firstSurveyDate',
      'lastSurveyDate',
      'samplingDays',
      'sequencesPerDeployment',
      'projects'
    ];
  }

  return (
    <div className="c-summary">
      <div className="row">
        <div className="col-12">
          <div className="card map">
            <div className="card-body">
              <span className="h2">Camera deployments</span>
            </div>
            <div className="card-img-bottom">
              <MapNoSSR ref={map} defaultOptions={{ maxZoom: 15 }}>
                {({ MarkerClusterer, HTMLMarker, Popup }) => {
                  const markers = locations.map(location => (
                    <HTMLMarker
                      key={location.id}
                      position={{ lat: location.latitude, lng: location.longitude }}
                      clusterPopupContent={buildClusterPopupContent(location)}
                    >
                      <Popup>
                        <div>
                          {!projectId
                          && (
                            <Fragment>
                              <div>{location?.project?.shortName}</div>
                              <div>
                                {location?.project?.initiatives?.length > 0
                                  && location?.project?.initiatives.map(({ name }) => name).join(',')
                                }
                              </div>
                              <div>{location?.project?.metadata?.project_admin_email}</div>
                            </Fragment>
                          )
                          }
                          <div>{location.placename}</div>
                        </div>
                      </Popup>
                    </HTMLMarker>
                  ));

                  return <MarkerClusterer>{markers}</MarkerClusterer>;
                }}
              </MapNoSSR>
            </div>
          </div>
        </div>
      </div>
      {(organizationId && projectId && !initiativeId) ? (
        <Analytics
          stats={[
            'species',
            projectType === 'sequence' ? 'sequence' : 'images',
            projectType === 'sequence' ? 'wildlifeSequences' : 'wildlifeImages',
            'locations',
            'deployments',
            'devices',
            'firstSurveyDate',
            'lastSurveyDate',
            'samplingDays',
            projectType === 'sequence' ? 'sequencesPerDeployment' : 'imagesPerDeployment',
          ]}
        />
      ) : (
        <Fragment>
          {organizationData?.projectType === 'both'
            && (
              <div className="mb-25">
                This organization contains {organizationData?.sequenceProjectCount} sequences and {organizationData?.imageProjectCount} image projects.<br />
                View summary statistics for&nbsp;
                <div className="d-inline-block cursor-pointer">
                  <Dropdown
                    isOpen={isOpenDropDown}
                    onClose={() => setIsOpenDropDown(false)}
                    target={(
                      <div onClick={() => setIsOpenDropDown(!isOpenDropDown)} className="selected-text">
                        {orgAnalyticType}&nbsp;
                      </div>)}
                  >
                    <ul>
                      <li role="presentation" onClick={() => { setOrgAnalyticType('All'); setIsOpenDropDown(false); }}>All</li>
                      <li role="presentation" onClick={() => { setOrgAnalyticType('Sequence'); setIsOpenDropDown(false); }}>Sequence</li>
                      <li role="presentation" onClick={() => { setOrgAnalyticType('Image'); setIsOpenDropDown(false); }}>Image</li>
                    </ul>
                  </Dropdown>
                </div>
                projects
              </div>
            )}
          <Analytics
            stats={orgAnalyticOptions}
          />
        </Fragment>
      )}
      {/* We don't display the widgets on the overview page */}
      {orgAnalyticType !== 'All' && (exists(organizationId) || exists(initiativeId) || exists(projectId)) && (
        <div className="row mt-3">
          <div className="col">
            <AnalyticsWidgets
              widgets={['identificationsByType', 'identifiedSpecies']} />
          </div>
        </div>
      )}
      <div className="row projects-list">
        <div className="col">
          <ProjectsGrid />
        </div>
      </div>
    </div>
  );
};

Summary.propTypes = {
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  routeName: PropTypes.string.isRequired,
  projectType: PropTypes.string.isRequired,
  organizationData: PropTypes.shape({}).isRequired,
  orgAnalyticType: PropTypes.string.isRequired,
  setOrgAnalyticType: PropTypes.func.isRequired,
};

Summary.defaultProps = {
  organizationId: null,
  initiativeId: null,
  projectId: null,
};

export default Summary;
