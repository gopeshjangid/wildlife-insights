import React, { useState } from 'react';
import { translateText, getFormattedDate } from 'utils/functions';
import { Filter } from 'components/filters';
import { Link } from 'lib/routes';

import FilterBar from './filter-bars';
import WildlifePictureChart from './charts/wildlife-picture-index/index';
import WildlifePictureSlopeChart from './charts/wildlife-occupency-slope';
import './style.scss';
const SELECTION_BY_OPTIONS = [
  {
    label: 'None',
    value: ''
  },
  {
    label: 'Class',
    value: 'class'
  },
  {
    label: 'Family',
    value: 'family'
  },
  {
    label: 'IUCN Red list status',
    value: 'iucn_status'
  },
  {
    label: 'Taxonomy sub type',
    value: 'taxonomy_sub_type'
  }
];

const WildlifePictureIndex = ({
  selectedProject,
  speciesList,
  additionalFilters,
  ...props
}) => {
  const [detectionRates, setDetectionRates] = useState([]);
  const [selectBy, setSelectBy] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [selectFilter, setSelectFilter] = useState('');
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

  const labelRenderer = (label, selected) => {
    let str;
    if (!selected.length) {
      str = translateText(`${label}: ${selected?.textLabel || ''}`);
    } else {
      str = translateText(`${label}:`);
    }
    return <span className="label">{str}</span>;
  };

  const getSelectByFilter = () => {
    return (
      <>
        <div className="filter-box">
          <Filter
            async
            isMulti={false}
            label={translateText('Selection by')}
            options={SELECTION_BY_OPTIONS}
            selected={selectBy}
            pageSize={50}
            labelRenderer={labelRenderer}
            onChange={value => {
              setSelectBy(value?.value || '');
            }}
          />
        </div>
        <div className="filter-box">
          <Filter
            async
            isMulti={false}
            labelRenderer={labelRenderer}
            label={translateText('Selection')}
            options={[{ label: '2021', value: '2021' }]}
            selected={selectFilter}
            pageSize={50}
            onChange={value => {
              setSelectFilter(value);
            }}
          />
        </div>
      </>
    );
  };

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
        'Wildlfie Picture Index',
        'The Wildlife Picture Index is the geometric mean of the occupancy of all species within a sampling period (date range) relative to the occupancy on the first sampling period.'
      )}
      <div className="map-box">
        <div className="map-filter">
          <FilterBar
            selectedProject={selectedProject}
            speciesList={speciesList}
            onChange={onMapFilterChange}
            {...props}
            additionalFilters={additionalFilters}
          >
            <div className="filter-box">{getSelectByFilter()}</div>
          </FilterBar>
          <div className="filter-box confidence-filter">
            <span>Confidence</span>
            <input
              onChange={e => setConfidence(e?.target.value)}
              value={confidence}
              className="e-range"
              min="0"
              max="100"
              type="range"
            />
            <span>{confidence + '%'}</span>
          </div>
        </div>
        <div className="mapper">
          <WildlifePictureChart data={[]} />
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          'Occupancy Slope (All Species)',
          'The Wildlife Picture Index is the geometric mean of the occupancy of all species within a sampling period (date range) relative to the occupancy on the first sampling period.'
        )}
        <div className="map-filter">
          <FilterBar
            selectedProject={selectedProject}
            speciesList={speciesList}
            onChange={onGraphFilterChange}
            additionalFilters={additionalFilters}
            {...props}
          >
            <div className="filter-box">{getSelectByFilter()}</div>
          </FilterBar>
          <div className="filter-box confidence-filter">
            <span>Confidence</span>
            <input
              onChange={e => setConfidence(e?.target.value)}
              value={confidence}
              className="e-range"
              min="0"
              max="100"
              type="range"
            />
            <span>{confidence + '%'}</span>
          </div>
        </div>
        <div className="mapper">
          <WildlifePictureSlopeChart data={[]} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(WildlifePictureIndex);
