// @ts-nocheck
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';

import { Link } from 'lib/routes';
import Tooltip from 'components/tooltip';
import projectsQuery from './projects.graphql';

import './style.scss';

const Tutorial = ({ openSelectFileDialog }) => (
  <div className="c-tutorial">
    <div className="row">
      <div className="step col-6 col-md-3 text-center">
        <div className="h5">Create</div>
        <p>
          All of your photos are part of a project, which in turn is part of an organization.
          Get started by creating them.
        </p>
        <Tooltip
          distance={20}
          content={
            (
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link route="projects_new">
                    <a className="nav-link">
                      New project
                    </a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link route="organizations_new">
                    <a className="nav-link">
                      New organization
                    </a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link route="initiatives_new">
                    <a className="nav-link">
                      New initiative
                    </a>
                  </Link>
                </li>
              </ul>
            )
          }
        >
          <button type="button" className="btn btn-primary">Create...</button>
        </Tooltip>
      </div>
      <div className="step col-6 col-md-3 text-center">
        <div className="h5">Upload</div>
        <p>
          By uploading your photos, {'you\'ll'} get suggestions from the Computer Vision
          and {'you\'ll'} get help from your collaborators.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openSelectFileDialog}
        >
          Upload photos
        </button>
      </div>
      {
        //prevent <Query> component execution at server-side
      }
      {process.browser && (
        <Query query={projectsQuery}>
          {({ loading, error, data }) => {
            if (error || (loading && !data.getProjects)) {
              return (
                <Fragment>
                  <div className="step col-6 col-md-3 text-center">
                    <div className="h5">Identify</div>
                    <p>
                      Accept suggestions or manually tag the animals in the photos.
                      You can search by family, genus or species.
                    </p>
                    <button type="button" className="btn btn-primary" disabled>Identify images</button>
                  </div>
                  <div className="step col-6 col-md-3 text-center">
                    <div className="h5">Analyze</div>
                    <p>
                      Get insights about where species are located, when are they seen
                      and how much this changes over time.
                    </p>
                    <button type="button" className="btn btn-primary" disabled>Analyze</button>
                  </div>
                </Fragment>
              );
            }

            return (
              <Fragment>
                <div className="step col-6 col-md-3 text-center">
                  <div className="h5">Identify</div>
                  <p>
                    Accept suggestions or manually tag the animals in the photos.
                    You can search by family, genus or species.
                  </p>
                  <Tooltip
                    distance={20}
                    content={(
                      <div className="c-tutorial-projects-list">
                        <ul className="flex-column">
                          {data.getProjects.data.map(project => (
                            <li key={project.id}>
                              <Link
                                route="projects_show"
                                params={{
                                  organizationId: project.organization.id,
                                  projectId: project.id,
                                  tab: 'identify'
                                }}
                              >
                                <a>
                                  {project.name}
                                </a>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  >
                    <button type="button" className="btn btn-primary">Identify images</button>
                  </Tooltip>
                </div>

                <div className="step col-6 col-md-3 text-center">
                  <div className="h5">Analyze</div>
                  <p>
                    Get insights about where species are located, when are they seen
                    and how much this changes over time.
                  </p>
                  <Tooltip
                    distance={20}
                    content={(
                      <div className="c-tutorial-projects-list">
                        <ul className="flex-column">
                          {data.getProjects.data.map(project => (
                            <li key={project.id}>
                              <Link
                                route="projects_show"
                                params={{
                                  organizationId: project.organization.id,
                                  projectId: project.id,
                                  tab: 'details'
                                }}
                              >
                                <a>
                                  {project.name}
                                </a>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  >
                    <button type="button" className="btn btn-primary">Analyze</button>
                  </Tooltip>
                </div>
              </Fragment>
            );
          }}
        </Query>
      )}
    </div>
  </div>
);

Tutorial.propTypes = {
  openSelectFileDialog: PropTypes.func.isRequired
};

export default Tutorial;
