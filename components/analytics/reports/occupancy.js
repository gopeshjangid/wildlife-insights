import React, { useState } from 'react';
import { getFormattedDate } from 'utils/functions';
import { Link } from 'lib/routes';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import FilterBar from './filter-bars';
import SpeciesOccupency from './charts/species-occupency';
import CommunityOccupencyCharts from './charts/community-occupency';
import './style.scss';

const species_occupency_data = [
  {
    date: new Date('2012-01-01T00:00:00Z'),
    rate: { v1: 0.1, v2: 0.4, v3: 0.7 }
  },
  {
    date: new Date('2012-02-01T00:00:00Z'),
    rate: { v1: 0.2, v2: 0.5, v3: 0.8 }
  },
  {
    date: new Date('2012-03-01T00:00:00Z'),
    rate: { v1: 0.5, v2: 0.7, v3: 0.9 }
  },
  {
    date: new Date('2012-04-01T00:00:00Z'),
    rate: { v1: 0.3, v2: 0.6, v3: 0.9 }
  },
  {
    date: new Date('2012-05-01T00:00:00Z'),
    rate: { v1: 0.4, v2: 0.7, v3: 1 }
  }
];

const Occupancy = ({
  type,
  selectedProject,
  speciesList,
  additionalFilters,
  ...props
}) => {
  const [mapFilter, setMapFilter] = useState({
    dateFilter: {
      start_date: getFormattedDate(new Date(), 'yyyy-MM-dd'),
      end_date: getFormattedDate(new Date(), 'yyyy-MM-dd')
    },
    subProject: 0,
    interval: 0,
    species: ''
  });

  const onMapFilterChange = filter => {
    setMapFilter(filter);
  };

  const getTopBar = (title, content) => {
    return (
      <div className="detection-topbar">
        <div className="detection-heading">
          <h4>{title}</h4>
          <div className="sub-title">
            <p>{content}</p>
            <Link route="/join">
              <a target="_signup">Learn more about this map</a>
            </Link>
          </div>
        </div>
        <div className="download-btn">
          <button>
            <FontAwesomeIcon icon={faDownload} />
            &nbsp; <span>Download</span>
          </button>
        </div>
      </div>
    );
  };

  const text =
    type === 'species'
      ? 'For a given species, occupancy estimates the proportion of deployments that are occupied by that species (plus/minus error estimates) while accounting for imperfect detection.'
      : 'For a given species, occupancy estimates the proportion of deployments that are occupied by that species (plus/minus error estimates) while accounting for imperfect detection.';

  return (
    <div className="detection-container">
      {getTopBar('Occupancy Rates', text)}
      <div className="map-box">
        <div className="map-filter">
          <FilterBar
            selectedProjectId={null}
            onChange={onMapFilterChange}
            additionalFilters={additionalFilters}
            speciesList={speciesList}
            {...props}
          />
        </div>
        <div className="mapper">
          {type === 'species' ? (
            <SpeciesOccupency data={species_occupency_data} />
          ) : (
            <CommunityOccupencyCharts data={[]} />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Occupancy);
