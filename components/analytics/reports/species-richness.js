import React, { useState } from 'react';

import { getFormattedDate } from 'utils/functions';
import { Link } from 'lib/routes';
import Map from './species-map';
import FilterBar from './filter-bars';
import RichnessCurveChart from './charts/species-richness-curve';
import RichnessNaiveExtrapolatedChart from './charts/species-richness-naive-extrapolated';

import './style.scss';

const SpeciesRichness = ({
  selectedProject,
  speciesList,
  additionalFilters,
  ...props
}) => {
  const [detectionRates, setDetectionRates] = useState([]);

  const [mapFilter, setMapFilter] = useState({
    dateFilter: {
      start_date: getFormattedDate(new Date(), 'yyyy-MM-dd'),
      end_date: getFormattedDate(new Date(), 'yyyy-MM-dd')
    },
    subProject: 0,
    interval: 0,
    species: ''
  });

  const [graphFilter, setGraphFilter] = useState({
    dateFilter: {
      start_date: getFormattedDate(new Date(), 'yyyy-MM-dd'),
      end_date: getFormattedDate(new Date(), 'yyyy-MM-dd')
    },
    subproject: 0,
    interval: 0,
    species: ''
  });

  const onMapFilterChange = filter => {
    setMapFilter(filter);
  };

  const onGraphFilterChange = filter => {
    setGraphFilter(filter);
  };

  const getTopBar = (title, content) => {
    return (
      <div className="detection-topbar">
        <div className="detection-heading">
          <h4>{title}</h4>
          <div className="sub-title">
            <p>
              {content}&nbsp;&nbsp;
              <Link route="/join">
                <a target="_signup">Learn more about this map</a>
              </Link>
            </p>
          </div>
        </div>
        <div className="download-btn">
          <button className="btn btn-secondary btn-sm">Download</button>
        </div>
      </div>
    );
  };
  return (
    <div className="detection-container">
      {getTopBar(
        'Naive Species Richness',
        'Naive species richness provides the community size, both at the location and study area level, based on observed species in the region.'
      )}
      <div className="map-box">
        <div className="map-filter">
          <FilterBar
            selectedProject={selectedProject}
            speciesList={speciesList}
            onChange={onMapFilterChange}
            {...props}
            additionalFilters={additionalFilters}
          ></FilterBar>
        </div>
        <div className="mapper">
          <Map detectionRates={detectionRates} />
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          'Extrapolated Species Richness',
          'Species richness provides the community size, both at the location and study area level, based on observed and unobserved species in the region derived from results from a community occupancy model (see Occupancy).'
        )}
        <div className="map-filter">
          <FilterBar
            selectedProject={selectedProject}
            speciesList={speciesList}
            onChange={onGraphFilterChange}
            additionalFilters={additionalFilters}
            {...props}
          />
        </div>
        <div className="mapper">
          <Map detectionRates={detectionRates} />
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          'Naive vs Extrapolated',
          'A comparison of naive species richness and extrapolated species richness by date.'
        )}
        <div className="map-filter">
          <FilterBar
            selectedProject={selectedProject}
            speciesList={speciesList}
            onChange={onGraphFilterChange}
            additionalFilters={additionalFilters}
            {...props}
          ></FilterBar>
        </div>
        <div className="mapper">
          <RichnessNaiveExtrapolatedChart data={[]} />
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          'Species Accumulation Curve',
          'The cumulative number of species recorded.'
        )}
        <div className="map-filter">
          <FilterBar
            selectedProject={selectedProject}
            speciesList={speciesList}
            onChange={onGraphFilterChange}
            additionalFilters={additionalFilters}
            {...props}
          ></FilterBar>
        </div>
        <div className="mapper">
          <RichnessCurveChart data={[]} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(SpeciesRichness);
