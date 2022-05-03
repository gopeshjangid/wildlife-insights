import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from 'react-apollo-hooks';
import isEmpty from 'lodash/isEmpty';
import LoadingSpinner from 'components/loading-spinner';
import { copyToClipboard, getGraphQLErrorMessage } from 'utils/functions';
import { getCountryFromIso } from 'utils/country-codes';
import T from 'components/transifex/translate';
import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import Analytics from 'components/statistics/analytics';
import AnalyticsWidgets from 'components/statistics/analytics-widgets';
import { Router } from 'lib/routes';
import HighlightedImageModal from './modal/highlighted-image';
import UserActions from './user-actions';
import projectDataQuery from './project-query.graphql';
import highlightedPhotosQuery from './highlighted-photos.graphql';
import './style.scss';

const SLIDER_SETTINGS = {
  autoplay: false,
  infinite: true,
  speed: 1000,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: false,
  accessibility: false,
  prevArrow: (
    <button type="button" aria-label="Previous photo">
      <FontAwesomeIcon icon={faAngleLeft} />
    </button>
  ),
  nextArrow: (
    <button type="button" aria-label="Next photo">
      <FontAwesomeIcon icon={faAngleRight} />
    </button>
  ),
};

const PublicProject = ({
  authenticated,
  projectId,
  projectSlug,
  fromExplore,
  setSidebarExpanded,
  setBasicFilters,
  user,
}) => {
  const [photos, setPhotos] = useState([]);
  const [project, setProject] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(-1);
  const [isFromExplore] = useState(fromExplore);
  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);

  useEffect(() => {
    Router.replaceRoute('public_project_show', {
      projectId,
      projectSlug
    });
  }, []);

  const {
    data: projectData,
    loading: projectLoading,
    error: projectError
  } = useQuery(projectDataQuery, {
    variables: {
      projectId
    },
    skip: !projectId,
    client: publicClient,
  });

  const {
    data: photosData,
    loading: photosLoading,
    error: photosError
  } = useQuery(highlightedPhotosQuery, {
    variables: {
      projectId,
      isARK: true
    },
    skip: !projectId,
    client: publicClient,
  });

  useEffect(() => {
    if (!projectLoading && projectData && projectData?.getProjectPublic) {
      setProject(projectData.getProjectPublic);
    }
  }, [projectData, projectLoading]);

  useEffect(() => {
    if (photosLoading || photosError) {
      setPhotos([]);
    } else if (photosData && photosData.getProjectHighlightedPhotos.highlightedPhotos.length) {
      setPhotos(photosData.getProjectHighlightedPhotos.highlightedPhotos);
    }
  }, [photosData, photosLoading, photosError, setPhotos]);

  if (!projectId) {
    return null;
  }

  const goBack = () => {
    Router.back();
  };

  const onClickFilterProject = () => {
    setSidebarExpanded(true);
    setBasicFilters({
      project: {
        value: projectId,
        label: project.shortName
      },
    });

    Router.pushRoute('discover');
  };

  const onCloseHighlightedImageModal = () => {
    setSelectedImgIndex(-1);
  };

  const anyLoading = projectLoading || photosLoading;
  const anyError = projectError || photosError;
  const noData = isEmpty(project);

  if (anyError) {
    return (
      <div className="public-page-content">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {projectError && getGraphQLErrorMessage(projectError)}
            {photosError && getGraphQLErrorMessage(photosError)}
          </div>
        </div>
      </div>
    );
  }

  if (anyLoading || !project) {
    return (
      <div className="public-page-content">
        <div className="container">
          <div className="align-center">
            <LoadingSpinner inline />
          </div>
        </div>
      </div>
    );
  }

  if (noData) {
    return (
      <div className="public-page-content">
        <div className="container">
          <div className="align-center">
            <T text="Data unavailable" />
          </div>
        </div>
      </div>
    );
  }

  const getCitationInfo = (format) => {
    const {
      project_owners: projectOwners,
      project_start_year: projectStartYear,
      last_modified_month: lastModifiedMonth,
      last_modified_year: lastModifiedYear,
      data_citation: dataCitation,
      last_download_date: lastDownloadDate
    } = project.dataCitationARK[0];

    if (format === 'jsx') {
      return (
        <Fragment>
          <span>
            {
              `${projectOwners} ${projectStartYear}. Last updated ${lastModifiedMonth.trim()} ${lastModifiedYear}. ${project.name}. `
            }
          </span>
          <span>
            {
              dataCitation ? (
                <a target="_blank"
                  href={dataCitation}
                  rel="noopener noreferrer"
                >
                  {dataCitation}
                </a>
              ) : ''
            }
          </span>
          <span>{`. Accessed via wildlifeinsights.org on ${lastDownloadDate}.`}</span>
        </Fragment>
      );
    }

    // citation info in plain text format
    return `${projectOwners} ${projectStartYear}. Last updated ${lastModifiedMonth.trim()} ${lastModifiedYear}. ${project.name}. ${dataCitation}. Accessed via wildlifeinsights.org on ${lastDownloadDate}.`;
  };

  let flagEmbargo = false;
  if (project?.embargo && project?.embargo > 0) {
    const currentDate = new Date();
    const embargoDate = new Date(`${project.embargoDate} 23:59:59`);
    if (currentDate <= embargoDate) {
      flagEmbargo = true;
    }
  }

  return (
    <div className="public-page-content">
      <div className="container">
        {
          isFromExplore && (
            <div className="row mb-4">
              <div className="col">
                <a className="back-link" onClick={goBack}>
                  <div className="btn btn-primary mr-2">
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </div>
                  <span>Back to explore page</span>
                </a>
              </div>
            </div>
          )
        }

        <div className="row">
          <div className={!!photos.length ? "col-md-6" : "col-md-7"}>
            <div>
              <h1>{project.name}</h1>
              <span className="h2">{project.organization.name}</span>
              {flagEmbargo
                && <span className="label embargo-msg">This project is currently embargoed and will not be available for public download.</span>
              }
            </div>

            <div className="mt-5">
              <div className="form-group row">
                <div className="col-4 label">Project website:</div>
                <div className="col-8 text-break">
                  <p>{project.projectUrl || 'N/A'}</p>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-4 label">Citation:</div>
                <div className="col-8">
                  <p>
                    {getCitationInfo('jsx')}
                    <button type="button" className="copy-content" onClick={() => {
                      copyToClipboard(getCitationInfo());
                    }}
                    >
                      <img alt="" src="/static/ic_content_copy_24px.png" />
                    </button>
                  </p>
                </div>
              </div>
              <div className="form-group row">
                <div className="col-4 label">Project objectives:</div>
                <div className="col-8">
                  <p>{project.objectives || 'N/A'}</p>
                </div>
              </div>

              <UserActions
                authenticated={authenticated}
                flagEmbargo={flagEmbargo}
                onClickFilterProject={onClickFilterProject}
                projectId={projectId}
                hasSensitiveSpecies={project.sensitiveSpecies}
                user={user}
              />
            </div>
          </div>

          {!!photos.length && (
            <div className="slider col-md-6">
              <Slider {...SLIDER_SETTINGS}>
                {
                  photos.map((photo, id) => {
                    return (
                      <div key={photo.thumbnailUrl} className="photo-container">
                        <div className="photo">
                          <img alt="" src={photo.thumbnailUrl} onClick={() => {
                            setSelectedImgIndex(id);
                          }} />
                        </div>
                        {
                          photo.imageSpecies && photo.imageSpecies.length > 0 &&
                          <p className="img-species">{photo.imageSpecies.join(', ')}</p>
                        }
                      </div>
                    )
                  })}
              </Slider>
            </div>
          )}
          {selectedImgIndex > -1
            && (
              <HighlightedImageModal
                selectedImgIndex={selectedImgIndex}
                highlightedPhotos={photos}
                onClose={onCloseHighlightedImageModal}
              />
            )
          }
        </div>
        <br />
        <div className="card">
          <div className="card-body mb-0">
            <h2 className="card-title mb-0">Project metadata</h2>
          </div>
          <div className="card-body mb-0 mt-0 pb-0 pt-0">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group row">
                  <div className="col-4 label">Metadata license:</div>
                  <div className="col-8">
                    <p>{project.metadataLicense || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Image license:</div>
                  <div className="col-8">
                    <p>{project.dataFilesLicense || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Date coverage:</div>
                  <div className="col-8">
                    <p>{project.startDate || 'N/A'} - {project.endDate || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Country:</div>
                  <div className="col-8">
                    <p>{getCountryFromIso(project?.metadata?.country_code) || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Species focus:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_species || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Bait use:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_bait_use || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group row">
                  <div className="col-4 label">Bait type:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_bait_type || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Camera layout:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_sensor_layout || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Paired cameras:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_sensor_cluster || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Stratification:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_stratification || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Stratification type:</div>
                  <div className="col-8">
                    <p>{project?.metadata?.project_stratification_type || 'N/A'}</p>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-4 label">Acknowledgements:</div>
                  <div className="col-8">
                    <p>{project.acknowledgements || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <Analytics
              narrow
              usePublicEndpoint
              stats={[
                'species',
                'images',
                'wildlifeImages',
                'devices',
                'deployments'
              ]}
            />
          </div>
          <div className="col-md-6">
            <AnalyticsWidgets
              narrow
              usePublicEndpoint
              widgets={[
                'publicIdentifiedSpecies',
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

PublicProject.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  projectId: PropTypes.number.isRequired,
  projectSlug: PropTypes.string.isRequired,
  fromExplore: PropTypes.bool,
  setSidebarExpanded: PropTypes.func.isRequired,
  setBasicFilters: PropTypes.func.isRequired
};

PublicProject.defaultProps = {
  fromExplore: false,
};

export default PublicProject;
