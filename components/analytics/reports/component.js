import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import DetectionRate from './detection-rate';
import Activity from './activity';
import Occupancy from './occupancy';
import WPI from './wildlife-picture-index';
import SpeciesRichNess from './species-richness';
import Summary from '../project-table/summary';
import IdentifiedSpecies from '../indentified-species';
import './style.scss';

const Reports = ({
  organizationId,
  projectId,
  setGeneratereport,
  analyses,
  open,
  ...props
}) => {
  const [openSummary, setOpenSummary] = useState(false);
  const [mainTab, setMainTab] = useState('SPECIES');

  return (
    <div className="report-container">
      <div className="report-heading">
        <h4>{analyses}</h4>
      </div>
      <div className="report-summary-tab">
        <button
          onClick={() => setOpenSummary(!openSummary)}
          className="summary-button"
        >
          Summary&nbsp;{'   '}
          <FontAwesomeIcon icon={openSummary ? faChevronUp : faChevronDown} />
        </button>
        {openSummary ? (
          <div className="report-summary-list">
            <div className="summary">
              <Summary
                organizationId={+organizationId}
                projectId={+projectId}
              />
            </div>

            <div className="species">
              <IdentifiedSpecies
                organizationId={+organizationId}
                projectId={+projectId}
              />
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className="report-content-box">
        <div className="tabs-wrapper">
          <div className="closed-tab">
            <button
              onClick={() => setMainTab('SPECIES')}
              className={`species ${mainTab === 'SPECIES' && 'active'}`}
            >
              Species
            </button>
            <button
              onClick={() => setMainTab('COMMUNITY')}
              className={`community ${mainTab === 'COMMUNITY' && 'active'}`}
            >
              Community
            </button>
          </div>
          {mainTab === 'SPECIES' ? (
            <div className="react-tabs-box">
              <Tabs>
                <TabList>
                  <Tab>Detection Rate</Tab>
                  <Tab>Occupancy</Tab>
                  <Tab>Activity</Tab>
                </TabList>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <DetectionRate
                      type="species"
                      speciesList={props?.species || {}}
                      additionalFilters={[
                        'selectDateRange',
                        'interval',
                        'species'
                      ]}
                      {...props}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <Occupancy
                      type="species"
                      additionalFilters={['dateRange', 'species']}
                      speciesList={props?.species || []}
                      {...props}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <Activity
                      additionalFilters={[
                        'subProjects',
                        'species',
                        'suntime',
                        'monthYear',
                        'interval'
                      ]}
                      speciesList={props?.species || []}
                      {...props}
                    />
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          ) : (
            <div className="react-tabs-box">
              <Tabs>
                <TabList>
                  <Tab>Detection Rate</Tab>
                  <Tab>Occupancy</Tab>
                  <Tab>Species Richness</Tab>
                  <Tab>WPI</Tab>
                </TabList>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <DetectionRate
                      type="community"
                      speciesList={props?.species || {}}
                      additionalFilters={['subProjects', 'interval']}
                      {...props}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <Occupancy
                      type="community"
                      additionalFilters={['dateRange']}
                      speciesList={props?.species || []}
                      {...props}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <SpeciesRichNess
                      additionalFilters={[
                        'subProjects',
                        'dateRange',
                        'selectBy'
                      ]}
                      {...props}
                    />
                  </div>
                </TabPanel>
                <TabPanel className="tab-panel-container">
                  <div className="tab-panel-box">
                    <WPI additionalFilters={['subProjects']} {...props} />
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
