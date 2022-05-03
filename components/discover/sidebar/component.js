import React, { useCallback, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faArrowLeft, faRedo } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from 'react-apollo-hooks';
import classnames from 'classnames';

import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import { Link, Router } from 'lib/routes';
import Analytics from 'components/statistics/analytics';
import AnalyticsWidgets from 'components/statistics/analytics-widgets';
import DiscoverFilters from './filters';
import DiscoverDownload from './discover-download';
import { isFiltering } from './filters/helpers';
import highlightedPhotosQuery from './highlighted-photos.graphql';
import './style.scss';

const SLIDER_SETTINGS = {
  autoplay: true,
  infinite: true,
  speed: 1000,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: false,
  prevArrow: (
    <button type="button" aria-label="Previous photo">
      <FontAwesomeIcon icon={faAngleLeft} />
    </button>
  ),
  nextArrow: (
    <button type="button" aria-label="Next photo">
      <FontAwesomeIcon icon={faAngleRight} />
    </button>
  ),
};

const DiscoverSidebar = ({
  counts,
  project,
  basicFilters,
  onChangeBasicFilters: onChange,
  onChangeAdvFilters,
  filters,
  dataLoading
}) => {

  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);
  const { data, loading, error } = useQuery(highlightedPhotosQuery, {
    skip: !project,
    variables: {
      projectId: project ? project.id : null,
    },
    client: publicClient,
  });

  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (loading || error) {
      setPhotos([]);
    } else if (data && data.getProjectHighlightedPhotos.highlightedPhotos.length) {
      setPhotos(data.getProjectHighlightedPhotos.highlightedPhotos);
    }
  }, [data, loading, error, setPhotos]);

  const onResetFilters = useCallback(() => {
    const newFilters = Object.keys(basicFilters)
      .map(key => ({ [key]: null }))
      .reduce((res, o) => ({ ...res, ...o }), {})

    onChange(newFilters);
  }, [basicFilters, onChange]);

  const isUserFiltering = useMemo(() => isFiltering(basicFilters), [basicFilters]);

  const onClickDetails = () => {
    Router.pushRoute('public_project_show', {
      projectId: project.id,
      projectSlug: project.slug,
      fromExplore: true
    });
  }

  if (project) {
    return (
      <div className="c-discover-sidebar">
        <div className="container py-5 pr-5">
          <div className="row">
            <div className="col d-flex justify-content-between">
              <Link route="discover">
                <a className="back-link">
                  <div className="btn btn-primary mr-2">
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </div>
                  Back to search results
                </a>
              </Link>
              <div>
                <button type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onClickDetails}>
                  See details
                </button>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col">
              <h1>{project.shortName}</h1>
              <div className="h2">{project.name}</div>
              <span className="h2">{project.organization}</span>
            </div>
          </div>

          {!!photos.length && (
            <div className="slider row mt-4">
              <div className="col">
                <Slider {...SLIDER_SETTINGS}>
                  {photos.map(photo => (
                    <div key={photo.thumbnailUrl} className="photo">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={photo.thumbnailUrl} />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}

          <div className="row mt-4">
            <div className="col">
              <Analytics
                narrow
                usePublicEndpoint
                stats={[
                  'species',
                  'images',
                  'wildlifeImages',
                  'devices',
                  'deployments'
                ]}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col">
              <AnalyticsWidgets
                narrow
                usePublicEndpoint
                widgets={[
                  'publicIdentifiedSpecies',
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="c-discover-sidebar">
      <div className="container py-5 pr-5">
        <div className="row">
          {isUserFiltering && (
            <div className="col-sm-12 col-lg-6">
              <button type="button" className="back-link btn btn-link p-0" onClick={onResetFilters}>
                <div className="btn btn-primary mr-2">
                  <FontAwesomeIcon icon={faRedo} />
                </div>
                All camera trap records
              </button>
            </div>
          )}

          <div
            className={classnames({
              'col-sm-12': true,
              'col-lg-6': isUserFiltering,
              'text-right': true,
            })}
          >
            <DiscoverDownload
              dataLoading={dataLoading}
              filters={filters}
              imagesCount={counts.dataFiles} />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col">
            <DiscoverFilters
              imagesCount={counts.dataFiles}
              onChangeAdvFilters={onChangeAdvFilters}
            />
          </div>
        </div>
        <br />
        <p className="txt-result">
          Results may include identifications assigned by computer vision that have not been
          <a
            href="https://www.wildlifeinsights.org/get-started/data-download/public#verify-data"
            target="_blank"
            rel="noopener noreferrer"
          >
            &nbsp;verified&nbsp;
          </a>
          by the data provider.
        </p>
        <div className="row mt-5">
          <div className="col">
            <Analytics
              narrow
              stats={{
                species: counts.species,
                images: counts.dataFiles,
                devices: counts.devices,
                deployments: counts.deployments,
                wildlifeImages: counts.wildlifeImages,
                projects: counts.projects,
                organizations: counts.organizations,
                countries: counts.countries,
                initiatives: counts.initiatives,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

DiscoverSidebar.propTypes = {
  counts: PropTypes.shape({}).isRequired,
  project: PropTypes.shape({}),
  basicFilters: PropTypes.shape({}).isRequired,
  onChangeBasicFilters: PropTypes.func.isRequired,
  filters: PropTypes.shape({}).isRequired,
  dataLoading: PropTypes.bool
};

DiscoverSidebar.defaultProps = {
  project: undefined,
  dataLoading: false
};

export default DiscoverSidebar;
