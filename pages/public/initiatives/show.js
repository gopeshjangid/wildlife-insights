import React, { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import Slider from 'react-slick';

import PublicPage from 'layout/public-page';
import Head from 'layout/head';
import Cover from 'components/cover';
import LoadingSpinner from 'components/loading-spinner';
import YoutubeVideo from 'components/youtube-video';
import ImageGallery from 'components/image-gallery';
import MapNoSSR from 'components/map-no-ssr';
import { smoothScroll, HEADER_HEIGHT } from 'utils/scroll';
import { Link } from 'lib/routes';
import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';

import { exists, getYouTubeId, getCoordinatesBounds } from 'utils/functions';

import initiativeQuery from './initiative.graphql';
import locationsQuery from './locations.graphql';

import './style.scss';

/**
 * Get the cover component for the initiative
 * @param {string} [title] Title of the initiative
 * @param {string} [description] Description of the initiative
 * @param {string} [image] URL of the background image
 */
const getCover = (title, description, image) => (
  <div id="initiative">
    <Cover image={image}>
      <div className="container">
        <div className="row">
          <div className="col">
            <h1 className="text-center">{title || 'Initiative not found'}</h1>
          </div>
        </div>
        {description && (
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <p className="text-center lead">{description}</p>
            </div>
          </div>
        )}
      </div>
    </Cover>
  </div>
);

/**
 * Get the slider component with the logos of the partners
 * @param {{ id: string|number, linkPublic: string, text: string }[]} images List of images
 */
const getPartnersSlider = (images) => {
  const sliderSettings = {
    autoplay: true,
    infinite: true,
    speed: 1000,
    slidesToShow: Math.min(images.length, 4),
    slidesToScroll: Math.min(images.length, 4),
    draggable: false,
  };

  return (
    <Slider {...sliderSettings}>
      {images.map(logo => (
        <div key={logo.id} className="logo-slide">
          <img src={logo.linkPublic} alt={logo.text} />
        </div>
      ))}
    </Slider>
  );
};

const PublicInitiativesShowPage = ({ initiativeId, authenticated }) => {
  const map = useRef(null);
  const [canDisplayMap, setCanDisplayMap] = useState(false);
  const [initiative, setInitiative] = useState(null);
  const [locations, setLocations] = useState([]);

  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);
  const bounds = useMemo(
    () => getCoordinatesBounds(locations.map(l => [l.latitude, l.longitude])),
    [locations]
  );

  const { data: initiativeData, loading: initiativeLoading, error: initiativeError } = useQuery(
    initiativeQuery,
    {
      variables: { id: initiativeId },
      client: publicClient,
    }
  );

  const { data: locationsData, loading: locationsLoading, error: locationsError } = useQuery(
    locationsQuery,
    {
      variables: { initiativeId },
      client: publicClient,
      skip: !canDisplayMap,
    }
  );

  useEffect(() => {
    if (!initiativeError && !initiativeLoading && initiativeData?.getInitiativePublic) {
      setInitiative(initiativeData.getInitiativePublic);
      setCanDisplayMap(initiativeData.getInitiativePublic.isLocationPublic);
    }
  }, [initiativeData, initiativeLoading, initiativeError, setInitiative, setCanDisplayMap]);

  useEffect(() => {
    if (!locationsError && !locationsLoading && locationsData?.getLocationsPublic?.data) {
      setLocations(
        locationsData.getLocationsPublic.data.filter(
          location => exists(location.latitude) && exists(location.longitude)
        )
      );
    }
  }, [locationsData, locationsLoading, locationsError, setLocations]);

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

  const onClickHeaderLink = (e) => {
    if (/** @type {HTMLElement} */(e.target).tagName !== 'A') return;

    const selector = /** @type {HTMLAnchorElement} */ (e.target).getAttribute('href');
    if (selector.slice(0, 1) !== '#') return;

    const el = document.querySelector(selector);
    if (el) {
      e.preventDefault();
      const clientRect = el.getBoundingClientRect();
      const scroll = clientRect.top + window.scrollY - HEADER_HEIGHT;
      smoothScroll(500, window.scrollY, scroll);
    }
  };

  return (
    <div className="p-public-initiative">
      <PublicPage>
        {initiativeError && (
          <Fragment>
            <Head title="Initiative" />
            {getCover()}
          </Fragment>
        )}
        {!initiativeError && !initiative && <LoadingSpinner />}
        {!initiativeError && !!initiative && (
          <Fragment>
            <Head title={initiative.name} />
            <header // eslint-disable-line
              className="l-header sticky-top"
              onClick={onClickHeaderLink}
            >
              <nav className="l-header-container navbar navbar-expand-md">
                {!!initiative.logo?.linkPublic && (
                  <div className="logo">
                    <img src={initiative.logo.linkPublic} alt={initiative.name} />
                  </div>
                )}
                {!initiative.logo?.linkPublic && (
                  <span className="lead font-weight-normal">{initiative.name}</span>
                )}
                <ul className="main-nav navbar-nav ml-auto">
                  <li className="nav-item">
                    <a href="#initiative">The initiative</a>
                  </li>
                  {!!initiative.photos.length && (
                    <li className="nav-item">
                      <a href="#photos">Photos</a>
                    </li>
                  )}
                  {canDisplayMap && !!locations.length && (
                    <li className="nav-item">
                      <a href="#map">Map</a>
                    </li>
                  )}
                  {initiative.contactEmail && (
                    <li className="nav-item">
                      <a href="#contact">Contact</a>
                    </li>
                  )}
                  <li className="nav-item">
                    <span>
                      <Link route="initiatives_show" params={{ initiativeId }}>
                        <a className="btn btn-primary btn-sm">
                          {authenticated ? 'Go to initiative' : 'Sign in'}
                        </a>
                      </Link>
                    </span>
                  </li>
                </ul>
              </nav>
            </header>
            {getCover(initiative.name, initiative.description, initiative.coverImage?.linkPublic)}
            <div className="container">
              <div className="row">
                <div className="col-md-8 offset-md-2">
                  {!!getYouTubeId(initiative.videoUrl) && (
                    <YoutubeVideo
                      id={getYouTubeId(initiative.videoUrl)}
                      title={`${initiative.name} introduction video`}
                    />
                  )}
                </div>
              </div>
              {initiative.introduction && (
                <div className="row">
                  <div
                    className="col-md-8 offset-md-2 mt-4 lead"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: initiative.introduction }}
                  />
                </div>
              )}
              {!!initiative.partnerLogos.length && (
                <div className="row mt-5">
                  <div className="col-md-8 offset-md-2">
                    {getPartnersSlider(initiative.partnerLogos)}
                  </div>
                </div>
              )}
              {!!initiative.photos.length && (
                <div className="row mt-5" id="photos">
                  <div className="col-12">
                    <ImageGallery
                      images={initiative.photos.map((photo, i) => ({
                        url: photo.linkPublic,
                        alt: `Initiative photo ${i}`,
                      }))}
                    />
                  </div>
                </div>
              )}
              {canDisplayMap && locationsError && (
                <div className="alert alert-danger mt-5" role="alert">
                  Unable to load the locations. Please try again in a few minutes.
                </div>
              )}
              {canDisplayMap && !!locations.length && (
                <div className="row" id="map">
                  <div className="col-12">
                    <MapNoSSR ref={map} defaultOptions={{ maxZoom: 10 }}>
                      {({ HTMLMarker, MarkerClusterer }) => {
                        const markers = locations.map(location => (
                          <HTMLMarker
                            key={location.id}
                            position={{ lat: location.latitude, lng: location.longitude }}
                          />
                        ));

                        return <MarkerClusterer>{markers}</MarkerClusterer>;
                      }}
                    </MapNoSSR>
                  </div>
                </div>
              )}
              <div className="row mt-5">
                <div className="col-md-8 offset-md-2 lead">
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: initiative.content }}
                  />
                </div>
              </div>
            </div>
            {initiative.contactEmail && (
              <div id="contact" className="mt-5">
                <Cover className="contact-section">
                  <div className="container">
                    <div className="row">
                      <div className="col-md-10 offset-md-1">
                        <h1 className="text-center">Contact {initiative.name}</h1>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-8 offset-md-2">
                        {initiative.contactContent && (
                          <p className="mt-2 text-center lead">{initiative.contactContent}</p>
                        )}
                      </div>
                      {!!initiative.partnerLogos.length && (
                        <div className="col-md-8 offset-md-2 mt-4">
                          {getPartnersSlider(initiative.partnerLogos)}
                        </div>
                      )}
                      <div className="col-md-8 offset-md-2 mt-5">
                        <p className="text-center">
                          <a className="btn btn-primary" href={`mailto:${initiative.contactEmail}`}>
                            Send us an email
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </Cover>
              </div>
            )}
            <div className={!initiative.contactEmail ? 'mt-5' : ''}>
              <Cover className="footer-section">
                <div className="container d-flex justify-content-between align-items-center">
                  <div className="flex-shrink-1">
                    <p className="mb-1">Powered by</p>
                    <img
                      srcSet="/static/logo-white.png, /static/logo-white@2x.png 2x"
                      src="/static/logo-white.png"
                      alt="Wildlife Insights beta"
                      className="logo-icon"
                    />
                  </div>
                  <div className="flex-shrink-1 mx-5">
                    <img src="/static/footer-icons.png" alt="" className="wi-icons" />
                  </div>
                  <Link route="initiatives_show" params={{ initiativeId }}>
                    <a className="btn btn-primary btn-alt">
                      {authenticated ? 'Go to initiative' : 'Sign in'}
                    </a>
                  </Link>
                </div>
              </Cover>
            </div>
          </Fragment>
        )}
      </PublicPage>
    </div>
  );
};

PublicInitiativesShowPage.getInitialProps = ({ query }) => {
  const { initiativeId } = query;

  return {
    initiativeId: exists(initiativeId) ? +initiativeId : null,
  };
};

PublicInitiativesShowPage.propTypes = {
  initiativeId: PropTypes.number.isRequired,
  authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ auth: { authenticated } }) => ({
  authenticated,
});

export default connect(mapStateToProps)(PublicInitiativesShowPage);
