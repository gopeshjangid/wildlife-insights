import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from 'react-apollo-hooks';
import { SelectableDateRangeFilter } from 'components/filters';

import Advancedfilters from './advanced-filters';
import { getFormattedDate } from 'utils/functions';
import { getAuthApolloClient } from 'lib/initApollo';
import { GQL_DEFAULT } from 'utils/app-constants';
import Preset from '../preset';
import * as actions from '../actions';
import ViewDeployment from './view-deployments';
import getDeploymentsQuery from './get-deployments-by-date.graphql';
import DeploymentQuery from '../../deployments/list/deployments.graphql';
import './style.scss';

const Filters = ({ saveFilter, selectedProjectId }) => {
  const client = getAuthApolloClient(GQL_DEFAULT);
  const [deploymentLoading, setDeploymentLoading] = useState(false);
  const [openPreset, setOpenPreset] = useState(false);
  const [openDeployment, setOpenDeployments] = useState(false);
  const [deploymentCount, setDeploymentCount] = useState([]);
  const [dateFilterList, setDateFilterList] = useState([
    {
      from: getFormattedDate(new Date(), 'yyyy-MM-dd'),
      to: getFormattedDate(new Date(), 'yyyy-MM-dd')
    }
  ]);
  const addDateRange = e => {
    e.preventDefault();
    let _filters = [...dateFilterList];
    _filters.push({ from: new Date(), to: new Date() });
    setDateFilterList(_filters);
    return;
  };

  const { data } = useQuery(DeploymentQuery, {
    variables: {
      projectId: Number(selectedProjectId?.id),
      pageNumber: 1,
      pageSize: 1,
      sort: { column: 'startDatetime', order: 'ASC' }
    }
  });

  useEffect(() => {
    if (data?.getDeploymentsByProject?.data.length) {
      let _filters = [...dateFilterList];
      _filters = _filters.map(date => ({
        ...date,
        from: data?.getDeploymentsByProject?.data[0]?.startDatetime
      }));

      setDateFilterList(_filters);

      saveFilter({
        timespans: _filters?.map(date => {
          let start = date?.from ? date?.from + 'T00:00:00Z' : '';
          let end = date?.to ? date?.to + 'T00:00:00Z' : '';
          return { start, end };
        })
      });
    }
  }, [data]);

  const endDateResult = useQuery(DeploymentQuery, {
    variables: {
      projectId: Number(selectedProjectId?.id),
      pageNumber: 1,
      pageSize: 1,
      sort: { column: 'endDatetime', order: 'DESC' }
    }
  });

  useEffect(() => {
    let { data } = endDateResult;
    if (data?.getDeploymentsByProject?.data.length) {
      let _filters = [...dateFilterList];
      _filters = _filters.map(date => ({
        ...date,
        to: data?.getDeploymentsByProject?.data[0]?.endDatetime
      }));
      setDateFilterList(_filters);
      saveFilter({
        timespans: _filters?.map(date => {
          let start = date?.from ? date?.from + 'T00:00:00Z' : '';
          let end = date?.to ? date?.to + 'T00:00:00Z' : '';
          return { start, end };
        })
      });
    }
  }, [endDateResult?.data]);

  const updateDateRange = (date, index) => {
    let _filters = [...dateFilterList];
    _filters = _filters.map((filter, key) => {
      if (key === index) {
        filter = date;
      }

      return filter;
    });
    setDateFilterList(_filters);
    saveFilter({
      timespans: _filters?.map(date => {
        let start = date?.from ? date?.from + 'T00:00:00Z' : '';
        let end = date?.to ? date?.to + 'T00:00:00Z' : '';
        return { start, end };
      })
    });
  };

  const removeDateRange = (e, index) => {
    e.preventDefault();
    let _filters = [...dateFilterList];
    if (index > -1) {
      _filters.splice(index, 1);
    }
    setDateFilterList(_filters);
    saveFilter({
      timespans: _filters?.map(date => {
        let start = date?.from ? date?.from + 'T00:00:00Z' : '';
        let end = date?.to ? date?.to + 'T00:00:00Z' : '';
        return { start, end };
      })
    });
  };

  const checkBoxHandler = e => {
    setOpenPreset(e.target.checked);
  };

  const fetchDeployments = (start, end) => {
    setDeploymentLoading(true);
    let variables = {
      deploymentCountByDateRequest: {
        requestedStartDate: getFormattedDate(new Date(start), 'yyyy-MM-dd'),
        requestedEndDate: getFormattedDate(new Date(end), 'yyyy-MM-dd')
      },
      projectId: 2000323
    };

    client
      .query({
        query: getDeploymentsQuery,
        variables
      })
      .then(({ data: { getDeploymentsCountByDate } }) => {
        setDeploymentLoading(false);
        setDeploymentCount(getDeploymentsCountByDate?.data || []);
      })
      .catch(() => {
        setDeploymentLoading(false);
      });
  };

  return (
    <div className="analytics-filter-container">
      <ViewDeployment open={openDeployment} setOpen={setOpenDeployments} />
      <div className="table-container">
        <div className="filter-wrapper">
          <div className="preset-row">
            <Preset open={openPreset} setOpenPreset={setOpenPreset} />
          </div>
          <div className="row">
            <div className="date-row-box">
              {dateFilterList?.map((filter, index) => (
                <div className="date-row" key={'filter-' + index}>
                  <SelectableDateRangeFilter
                    defaultFromDate={new Date(filter?.from)}
                    defaultToDate={new Date(filter?.to)}
                    filterRange={{
                      from: new Date(filter?.from),
                      to: new Date(filter?.to)
                    }}
                    fetchDeployments={fetchDeployments}
                    isLoading={deploymentLoading}
                    deploymentsData={deploymentCount || []}
                    onChange={(startDate, endDate) =>
                      updateDateRange({ from: startDate, to: endDate }, index)
                    }
                  />
                  {index > 0 && (
                    <div className="icon icon-box">
                      <a
                        className="close-icon"
                        onClick={e => removeDateRange(e, index)}
                      >
                        <img
                          className="close-image"
                          alt=""
                          src="/static/ic_close_14px.png"
                        />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="deployment-btn-space">&nbsp;</div>
            <div className="view-deployment-box">
              <button
                onClick={() => setOpenDeployments(open => !open)}
                className="primary-button btn view-deployment-btn"
              >
                <FontAwesomeIcon size="sm" icon={faChartBar} />
                &nbsp;View deployments by year
              </button>
            </div>
          </div>

          <div className="add-btn-container">
            <button
              onClick={addDateRange}
              className="btn btn-link m-0 p-0 mt-3 add-date-btn"
            >
              Add date range
            </button>
          </div>

          <div className="advacned-filter-container row">
            <div className="filter-column">
              <Tabs>
                <div className="tabs-container">
                  <TabList>
                    <Tab>Basic</Tab>
                    <Tab>Advanced</Tab>
                  </TabList>
                </div>
                <TabPanel>
                  <Advancedfilters isBasic={true} />
                </TabPanel>
                <TabPanel>
                  {' '}
                  <Advancedfilters />
                </TabPanel>
              </Tabs>
            </div>
            <div className="save-filter-checkbox">
              <input
                type="checkbox"
                checked={openPreset}
                onChange={checkBoxHandler}
                className={'grid-checkbox'}
              />
              <label>
                I want to save this filter as a preset for the next time.
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  saveFilter: data => {
    dispatch(actions.setFilters(data));
  }
});

const mapStateToProps = state => ({
  ...state?.analytics
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);
