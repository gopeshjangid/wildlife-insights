import React, { useState } from 'react';
import { getFormattedDate } from 'utils/functions';
import { Link } from 'lib/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import FilterBar from './filter-bars';
import ActivityFilterBar from './filter-bars/activity-filter-bar';
import SingleActivityChart from './charts/activity/activity-chart';
import ActivityRadial from './charts/activity/activity-radial';
import DoubleActivity from './charts/activity/double-activity-chart';
import './style.scss';

const Activity = ({
  selectedProject,
  speciesList,
  additionalFilters,
  ...props
}) => {
  const [mapFilter, setMapFilter] = useState({
    dateFilter: {
      startDate: getFormattedDate(new Date(), 'yyyy-MM-dd'),
      endDate: getFormattedDate(new Date(), 'yyyy-MM-dd')
    },
    subProject: 0,
    interval: 0,
    species: ''
  });

  const [graphFilter, setGraphFilter] = useState({
    dateFilter: {
      startDate: getFormattedDate(new Date(), 'yyyy-MM-dd'),
      endDate: getFormattedDate(new Date(), 'yyyy-MM-dd')
    },
    subproject: 0,
    interval: 0,
    species: ''
  });

  const formatFilter = data => {
    return {
      ...data,
      dateFilter: {
        startDate: data.dateFilter.start_date,
        endDate: data.dateFilter.end_date
      }
    };
  };

  const onMapFilterChange = filter => {
    setMapFilter(formatFilter(filter));
  };

  const onGraphFilterChange = filter => {
    setGraphFilter(formatFilter(filter));
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
  return (
    <div className="detection-container">
      {getTopBar(
        'Single Species Activity',
        'An indicator of when the selected species is active. Activity is calculated by plotting the number of independent observations of that species (number of sequences of images separated 1, 2, 30 or 60 mins apart) as a function of time.'
      )}
      <div className="map-box">
        <div className="map-filter">
          <FilterBar
            selectedProjectId={null}
            speciesList={speciesList}
            onChange={onMapFilterChange}
            additionalFilters={additionalFilters}
            {...props}
          />
        </div>
        <div className="mapper">
          <SingleActivityChart />
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          'Single Species Activity (Radial)',
          'An indicator of when the selected species is active. Activity is calculated by plotting the number of independent observations of that species (number of sequences of images separated 1, 2, 30 or 60 mins apart) as a function of time.'
        )}
        <div className="map-filter">
          <FilterBar
            selectedProjectId={null}
            speciesList={speciesList}
            onChange={onGraphFilterChange}
            additionalFilters={additionalFilters}
            {...props}
          />
        </div>
        <div className="mapper">
          <ActivityRadial data={[]} />
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          '2 Species Activity Overlap',
          'An indicator of how the activity of two different species overlap. Activity is calculated by plotting the number of independent observations of that species (number of sequences of images separated 1, 2, 30 or 60 mins apart) as a function of time.'
        )}
        <div className="map-filter">
          <ActivityFilterBar
            speciesList={speciesList}
            onChange={onGraphFilterChange}
            additionalFilters={['monthYear']}
            selectedProject={selectedProject}
          />
        </div>
        <div className="mapper">
          <DoubleActivity />
        </div>
      </div>
    </div>
  );
};

export default Activity;
