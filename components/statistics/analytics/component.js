import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import classNames from 'classnames';
import { useQuery } from 'react-apollo-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import { exists, getFormattedUTCDate, translateText } from 'utils/functions';
import Tooltip from 'components/tooltip';
import AnalyticsCard from './card';
import analyticsPublicQuery from './analytics-public.graphql';

import './style.scss';

const STAT_DICT = {
  sequence: {
    label: translateText('Total sequences'),
    property: 'numSequences',
    type: 'number',
    description: translateText(
      'The number of sequences containing animals and other identified objects as well as images with no object, or blank images.'
    ),
  },
  wildlifeSequences: {
    label: translateText('Wildlife sequences'),
    property: 'wildlifeSequencesCount',
    type: 'number',
    description: translateText('The number of sequences containing animals.'),
  },
  sequencesPerDeployment: {
    label: translateText('Sequences per deployment (average)'),
    property: 'avgNumberOfSequencesPerDeployment',
    type: 'number',
  },
  images: {
    label: translateText('Total images'),
    property: 'numImages',
    type: 'number',
    description: translateText(
      'The number of images containing animals and other identified objects as well as images with no object, or blank images.'
    ),
  },
  species: {
    label: translateText('Species'),
    property: 'numSpecies',
    type: 'number',
    description: translateText(
      'The number of unique wild and domesticated species in a set (humans not included).'
    ),
  },
  identifications: {
    label: translateText('Identified objects'),
    property: 'numIdentifications',
    type: 'number',
    description: translateText(
      'An identified object is any item that can be identified in an image. This includes animal species and non-animal objects such as automobiles, bicycles etc.'
    ),
  },
  devices: {
    label: translateText('Cameras'),
    property: 'numDevices',
    type: 'number',
    description: translateText(
      'An autonomous camera trap device that is triggered by changes in motion and/or heat. The same camera may be used to sample different locations at different times.'
    ),
  },
  deployments: {
    label: translateText('Camera deployments'),
    property: 'numDeployments',
    type: 'number',
    description: translateText(
      ' A unique spatial and temporal placement of a camera trap device to sample wildlife. For example a camera trap placed at location x,y between January 1-15, 2019 is a different camera deployment than the same (or different) camera device placed at the same location but between January 1-15, 2018.'
    ),
  },
  imagesPerDeployment: {
    label: translateText('Images per deployment (average)'),
    property: 'averageNumberOfImagesPerDeployment',
    type: 'number',
  },
  locations: {
    label: translateText('Locations'),
    property: 'uniqueLocations',
    type: 'number',
    description: translateText(
      'A camera location is the physical position in space (latitude and longitude) of a camera trap device.'
    ),
  },
  samplingDays: {
    label: translateText('Sampling days'),
    property: 'samplingDaysCount',
    type: 'number',
    description: translateText('The number of days a camera trap is set out to sample wildlife.'),
  },
  projects: {
    label: translateText('Projects'),
    property: 'projectCount',
    type: 'number',
    description: translateText(
      'A project is a set of camera deployments within a limited spatial and temporal boundary. Each project has defined objectives and methods.'
    ),
  },
  initiatives: {
    label: translateText('Initiatives'),
    property: 'initiativeCount',
    type: 'number',
    description: translateText(
      'An initiative is a group of projects that share similar objectives, data and analytics. Initiatives can include projects from one or more organizations.'
    ),
  },
  organizations: {
    label: translateText('Organizations'),
    property: 'organizationCount',
    type: 'number',
    description: translateText(
      'Entities comprising one or more people that share a particular purpose and objectives.'
    ),
  },
  wildlifeImages: {
    label: translateText('Wildlife images'),
    property: 'wildlifeImagesCount',
    type: 'number',
    description: translateText('The number of images containing animals.'),
  },
  countries: {
    label: translateText('Countries'),
    property: 'numCountries',
    type: 'number',
    description: translateText(
      'The number of countries that have records of camera trap images stored in Wildlife Insights.'
    ),
  },
  firstSurveyDate: {
    label: translateText('First survey date'),
    property: 'firstSurveyDate',
    type: 'date',
    description: translateText(
      'The start date of the earliest deployment in the project.'
    ),
  },
  lastSurveyDate: {
    label: translateText('Last survey date'),
    property: 'lastSurveyDate',
    type: 'date',
    description: translateText(
      'The end date of the most recent deployment in the project.'
    ),
  },
};

const Analytics = ({ authenticated, organizationId, initiativeId, projectId, stats, narrow }) => {
  // For public(explore) page analytics, a single getAnalyticsPublic api call is used 
  // that returns data for all the cards. For private (authenticated) analytics, 
  // "getAnalyticsByParameter" api call(with respective key) is used for each individual 
  // card and is handled in the <AnalyticsCard/> component.

  // WARN: the analyticsPublicQuery only support analytics for projects
  const { data, error } = useQuery(analyticsPublicQuery, {
    skip: !Array.isArray(stats) || authenticated,
    variables: { organizationId, initiativeId, projectId },
    // An instance of the public client is generated for non-authenticated users
    client: getPublicApolloClient(GQL_PUBLIC_DEFAULT),
  });

  const getCard = (label, key, description, type, value) => {
    let metric;
    if (exists(value)) {
      metric = value;
    } else if (!error && exists(data?.getAnalyticsPublic)) {
      metric = data.getAnalyticsPublic[key];
    }

    const canDisplayData = exists(metric);

    return (
      <div className="card">
        <div className="card-body">
          {!canDisplayData && <div className="number">–</div>}
          {canDisplayData && (
            <div className="number">
              {
                type === 'date'
                  ? getFormattedUTCDate(metric, 'yyyy-MM-dd')
                  : numeral(metric).format('0,0')
              }
            </div>
          )}
          <div className="title d-flex justify-content-between">
            {label}
            {description && (
              <Tooltip placement="top" content={<div>{description}</div>}>
                <button
                  type="button"
                  aria-label={translateText(`More information about the ${label}`)}
                  className="btn btn-link m-0 p-0"
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (Array.isArray(stats)) {
    return (
      <div className="c-analytics row">
        {stats.map((stat, index) => (
          <div
            key={stat}
            className={classNames({
              'col-md-6': narrow,
              'col-md-4': !narrow,
              'mt-3': index > (narrow ? 1 : 2),
            })}
          >
            {authenticated
              ? <AnalyticsCard
                label={STAT_DICT[stat].label}
                parameterKey={STAT_DICT[stat].property}
                description={STAT_DICT[stat].description}
                type={STAT_DICT[stat].type}
                organizationId={organizationId}
                initiativeId={initiativeId}
                projectId={projectId} />
              : getCard(
                STAT_DICT[stat].label,
                STAT_DICT[stat].property,
                STAT_DICT[stat].description,
                STAT_DICT[stat].type,
                stats[stat]
              )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="c-analytics row">
      {Object.keys(stats).map((key, index) => (
        <div
          key={key}
          className={classNames({
            'col-md-6': narrow,
            'col-md-4': !narrow,
            'mt-3': index > (narrow ? 1 : 2),
          })}
        >
          {getCard(
            STAT_DICT[key].label,
            STAT_DICT[key].property,
            STAT_DICT[key].description,
            STAT_DICT[key].type,
            stats[key]
          )}
        </div>
      ))}
    </div>
  );
};

Analytics.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  stats: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOf([
        'images',
        'species',
        'identifications',
        'devices',
        'deployments',
        'locations',
        'projects',
        'initiatives',
        'organizations',
        'samplingDays',
        'imagesPerDeployment',
        'countries',
        'wildlifeImages',
        'firstSurveyDate',
        'lastSurveyDate',
      ])
    ),
    PropTypes.shape({}),
  ]),
  // Display in several rows for narrow containers
  narrow: PropTypes.bool,
  // Prop used in index.js file, not here
  // eslint-disable-next-line react/no-unused-prop-types
  usePublicEndpoint: PropTypes.bool,
};

Analytics.defaultProps = {
  organizationId: null,
  initiativeId: null,
  projectId: null,
  stats: [
    'species',
    'devices',
    'deployments',
    'locations',
    'projects',
    'initiatives',
    'organizations',
    'countries',
    'images',
    'identifications',
    'imagesPerDeployment',
    'samplingDays',
    'wildlifeImages',
  ],
  narrow: false,
  usePublicEndpoint: false,
};

export default Analytics;
