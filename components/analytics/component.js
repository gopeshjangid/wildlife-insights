import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Summary from './project-table/summary';
import IdentifiedSpecies from './indentified-species';
import { translateText } from 'utils/functions';
import Tooltip from 'components/tooltip';
import Stepper from 'components/stepper';
import ProjectTable from './project-table';
import Accordion from 'components/analytics/accordion';
import Filters from './filters';
import Analyses from './analyses';
import Report from './reports';
import './style.scss';

const Analytics = ({ selectedProjectId, ...props }) => {
  const [step, setStep] = useState(1);
  const [generateAnalyses, setGenerateAnalyses] = useState(false);
  const [selectedProject, setSelectedProject] = useState(
    selectedProjectId || null
  );
  const submitHandler = () => {
    setStep(step => step + 1);
  };

  return (
    <div className="project-container">
      {step < 4 ? (
        <Stepper
          activeStep={step}
          stepList={[
            { label: 'Select Project(s)' },
            { label: 'Apply Filters' },
            { label: 'Choose analyses' },
            { label: 'Generate analytics' }
          ]}
        />
      ) : (
        ''
      )}

      <div className="main-wrapper">
        {step === 1 ? (
          <ProjectTable setSelectedProject={setSelectedProject} />
        ) : step === 2 ? (
          <Filters />
        ) : step === 3 ? (
          <Analyses
            setGenerateAnalyses={setGenerateAnalyses}
            open={generateAnalyses}
            setStep={setStep}
          />
        ) : (
          <Report
            organizationId={selectedProject?.organizationId}
            projectId={selectedProject?.id}
          />
        )}
        {step < 4 ? (
          <div className="tab-container">
            {selectedProject ? (
              <Tabs>
                <div className="tabs-container">
                  <TabList>
                    <Tab>
                      Summary &nbsp;
                      <Tooltip
                        placement="top"
                        content={
                          <div>
                            Images that have been Catalogued are available for
                            analyses and summarized here. All images in the
                            Identify tab will be excluded from these analyses.
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label={translateText(
                            `More information about the summary catalogued images`
                          )}
                          className="btn btn-link m-0 p-0"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                        </button>
                      </Tooltip>
                    </Tab>
                    <Tab>Analytics requirements</Tab>
                  </TabList>
                </div>
                <TabPanel>
                  <Summary
                    organizationId={Number(selectedProject?.organizationId)}
                    projectId={Number(selectedProject?.id)}
                    step={step}
                  />
                  {step === 2 && (
                    <IdentifiedSpecies
                      organizationId={Number(selectedProject?.organizationId)}
                      projectId={Number(selectedProject?.id)}
                    />
                  )}
                </TabPanel>
                <TabPanel>
                  <div className="anaytics-container">
                    <div className="anaytics-item">
                      <span className="heading">Species Analytics</span>
                      <Accordion
                        list={[
                          {
                            title: 'Detection rate',
                            content: (
                              <ul className="analytics-content-list">
                                <li>None</li>
                              </ul>
                            )
                          },
                          {
                            title: 'Occupancy',
                            content: (
                              <ul className="analytics-content-list">
                                <li>Minimum of 20 deployments</li>
                                <li>
                                  Minimum of 5 locations with detections of the
                                  target species
                                </li>
                                <li>Minimum of 7 active sampling days</li>
                                <li>No more than 120 sampling days</li>
                              </ul>
                            )
                          },
                          {
                            title: 'Activity',
                            content: (
                              <ul className="analytics-content-list">
                                <li>
                                  Minimum of 24 independent events per species
                                </li>
                              </ul>
                            )
                          }
                        ]}
                      />
                    </div>
                    <div className="anaytics-item">
                      <span className="heading">Community Analytics</span>
                      <Accordion
                        list={[
                          {
                            title: 'Detection rate',
                            content: (
                              <ul className="analytics-content-list">
                                <li>None</li>
                              </ul>
                            )
                          },
                          {
                            title: 'Occupancy',
                            content: (
                              <ul className="analytics-content-list">
                                <li>Minimum of 6 species</li>
                                <li>Minimum of 20 deployments</li>
                                <li>
                                  Minimum of 5 locations with detections per
                                  species
                                </li>
                                <li>Minimum of 7 active sampling days</li>
                                <li>No more than 120 sampling days</li>
                              </ul>
                            )
                          },
                          {
                            title: 'Species Richness',
                            content: (
                              <ul className="analytics-content-list">
                                <li>Minimum of 6 species</li>
                                <li>Minimum of 20 deployments</li>
                                <li>
                                  Minimum of 5 locations with detections per
                                  species
                                </li>
                                <li>Minimum of 7 active sampling days</li>
                                <li>No more than 120 sampling days</li>
                              </ul>
                            )
                          },
                          {
                            title: 'Wildlife Picture Index (WPI)',
                            content: (
                              <ul className="analytics-content-list">
                                <li>
                                  Minimum of 2 sampling seasons that meet the
                                  requirements of an occupancy analysis
                                </li>
                              </ul>
                            )
                          }
                        ]}
                      />
                    </div>
                  </div>
                </TabPanel>
              </Tabs>
            ) : (
              <span className="text">Summary</span>
            )}
          </div>
        ) : (
          ''
        )}
      </div>
      {step < 4 ? (
        <div className="table-footer">
          <button
            className="back"
            onClick={() => setStep(step => (step === 1 ? 1 : step - 1))}
          >
            Back
          </button>
          <button
            disabled={!selectedProject?.id}
            onClick={e =>
              step === 3 ? setGenerateAnalyses(true) : submitHandler(e)
            }
            className="next"
          >
            {step === 3 ? 'Generate Analysis' : 'Next'}
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

Analytics.propTypes = {
  selectedProjectId: PropTypes.objectOf(PropTypes.any)
};

export default Analytics;
