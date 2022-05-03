import React, { useState } from 'react';
import { getFormattedDate } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import { Link } from 'lib/routes';
import Map from './species-map';
import './style.scss';
import { getDetectionMap, getDetectionRates } from './helpers';
import FilterBar from './filter-bars';
import CommunityDetectionCharts from './charts/community-occupency';
import SpeciesDetectionCharts from './charts/species-detection-rate';
import { SPECIES_NAME_TYPE, TEMPORAL_RESOLUTION } from '../constant';
const DetectionRate = ({ type, speciesList, additionalFilters, ...props }) => {
  const [detectionRateGraph, setDetectionRateGraph] = useState(null);
  const [detectionMap, setDetectionMap] = useState(null);

  const [detectionMapData, setDetectionMapData] = useState(null);
  const authToken = props?.auth?.token;
  const dateFormate = 'MM-yyyy';

  const defaultDateFilter = {
    start_date: props?.filters?.timespans?.length
      ? getFormattedDate(
          new Date(props?.filters?.timespans[0]?.start),
          dateFormate
        )
      : getFormattedDate(new Date(), dateFormate),
    end_date: props?.filters?.timespans?.length
      ? getFormattedDate(
          new Date(props?.filters?.timespans[0]?.end),
          dateFormate
        )
      : getFormattedDate(new Date(), dateFormate)
  };

  const toMMYYYYDateFilter = date => {
    let [Y, M] = date ? date.split('-') : [0, 0];
    return `${M}-${Y}`;
  };

  const getQueryFromObject = filter => {
    let q = '';
    for (let [key, v] of Object.entries(filter)) {
      if (key === 'start' || key === 'end') {
        v = toMMYYYYDateFilter(filter[key]);
      }
      if (v && v !== '-') q += q ? `&${key}=${v}` : `${key}=${v}`;
    }
    return q;
  };

  const getFormattedFilter = filter => {
    return getQueryFromObject({
      species: filter?.species?.value,
      species_name_type: SPECIES_NAME_TYPE,
      project_id: Number(props?.selectedProjectId?.id),
      temporal_resolution: TEMPORAL_RESOLUTION.overall,
      independence_interval: filter?.interval,
      start: filter?.dateFilter?.start_date,
      end: filter?.dateFilter?.end_date,
      sub_project: filter?.subProject
    });
  };

  const getFormattedFilterForRate = filter => {
    return getQueryFromObject({
      project_id: Number(props?.selectedProjectId?.id),
      species: filter?.species?.value,
      independence_interval: filter?.interval,
      temporal_resolution: TEMPORAL_RESOLUTION.monthly,
      sub_project: filter?.subProject,
      start: filter?.dateFilter?.start_date,
      end: filter?.dateFilter?.end_date,
      species_name_type: SPECIES_NAME_TYPE,
    });
  };

  const getDetectionMapData = async (filter, responseType) => {
    try {
      const query = getFormattedFilter(filter);
      setDetectionMapData(true);
      const detectionMapResults = await getDetectionMap(
        query,
        authToken,
        responseType
      );
      setDetectionMapData(detectionMapResults?.data[1]);
    } catch (e) {
      setDetectionMapData('something went wrong. Please try again.');
    }
  };

  const getDetectionRateData = async (filter, responseType) => {
    try {
      const query = getFormattedFilterForRate(filter);
      setDetectionRateGraph(true);
      const response = await getDetectionRates(query, authToken, responseType);
      if (responseType === 'graph') {
        let image = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        const imgUrl = `data:${response.headers[
          'content-type'
        ].toLowerCase()};base64,${image}`;
        setDetectionRateGraph(imgUrl);
      } else {
        setDetectionRateGraph(response?.data?.det_rates);
      }
    } catch (e) {
      setDetectionRateGraph('something went wrong');
    }
  };

  const onMapFilterChange = filter => {
    getDetectionMapData(filter);
  };

  const onGraphFilterChange = filter => {
    getDetectionRateData(filter);
  };

  const renderGraphElement = data => {
    if (typeof data === 'boolean') {
      return (
        <div className="spanner-box">
          <LoadingSpinner inline />
        </div>
      );
    }

    if (data && data.includes('base64')) {
      return <img width="80%" src={data} alt="detection rate graph" />;
    }
    return (
      <div className="alert alert-danger" role="alert">
        {data}
      </div>
    );
  };

  const renderMapElement = data => {
    if (typeof data === 'boolean') {
      return (
        <div className="spanner-box">
          <LoadingSpinner inline />
        </div>
      );
    }

    if (data && typeof data === 'object') {
      return <Map mapDetails={{ title: 'Detection Rate' }} locations={data} />;
    }
    if(data){
      return (
        <div className="alert alert-danger" role="alert">
          {data}
        </div>
      );
    }
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

  if (type === 'community') {
    return (
      <div className="detection-container">
        {getTopBar(
          'Detection Rates (All Species)',
          'Overall detection rates for all species selected (number of independent events pooled across all deployments divided by the number of active trap-days) within the selected date range'
        )}
        <div className="map-box">
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
            <div className="detection-graph">
              <CommunityDetectionCharts data={[]} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detection-container">
      {getTopBar(
        'Detection Rate (Map view)',
        ' Detection rates are the number of independent observations for a species divided by the number of active trap-days in each month within the date range selected. Here, detection rates are calculated by deployment for a defined date range.'
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
          <div className="detection-graph">
            {renderMapElement(detectionMapData)}
          </div>
        </div>
      </div>
      <div className="map-box">
        {getTopBar(
          'Monthly Detection Rates (pooled across deployments)',
          'Detection rates are pooled across deployments to calculate the overall monthly detection rates for a defined date range.'
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
          <div className="detection-graph">
            {(typeof detectionRateGraph === 'boolean') && 
              <div className="spanner-box">
               <LoadingSpinner inline />
              </div>
            }
            {(detectionRateGraph && typeof detectionRateGraph === 'object' && detectionRateGraph.length > 0) && 
              <SpeciesDetectionCharts data={detectionRateGraph} />
            }
            {(detectionRateGraph && typeof detectionRateGraph === 'string') && 
              <div className="alert alert-danger" role="alert">
                {detectionRateGraph}
              </div>
            }
            {(detectionRateGraph && typeof detectionRateGraph === 'object' && detectionRateGraph.length== 0) && 
              <div className="alert alert-danger" role="alert">
                No Record Found
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DetectionRate);
