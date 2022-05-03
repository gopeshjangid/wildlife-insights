import React, { Fragment, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'lib/routes';
import { formatDate as format, getFormattedUTCDate, exists } from 'utils/functions';
import MapNoSSR from 'components/map-no-ssr';
import { getRelevantExif } from './helpers';
import MetadataItem from './item';

import deploymentQuery from './deployment.graphql';
import imageExifQuery from './image-exif.graphql';
import UpdateDateTimeModal from './modal/update-date-time';
import './style.scss';

const formatDate = (str) => {
  const arrTimeVal = str.split('T')[1].split('.')[0].split(':');
  return `${format(new Date(str), 'MM/dd/yyyy')} ${arrTimeVal.join(':')}`;
};

const getDateInUTC = str => getFormattedUTCDate(str, 'MM/dd/yyyy HH:mm:ss');

const SidebarMetadataTab = ({ image, projectId, deploymentId }) => {
  const map = useRef(null);
  const [deployment, setDeployment] = useState(null);
  const [imageExif, setImageExif] = useState(null);
  const [editDateTimeModal, setEditDateTimeModal] = useState(false);

  const { data: deploymentData, loading: deploymentLoading, error: deploymentError } = useQuery(
    deploymentQuery,
    {
      variables: {
        projectId,
        id: deploymentId,
      },
      skip: !exists(projectId) || !exists(deploymentId),
    }
  );

  const { data: imageExifData, loading: imageExifLoading, error: imageExifError } = useQuery(
    imageExifQuery,
    {
      variables: {
        projectId,
        deploymentId,
        id: image?.id,
      },
      skip: !exists(projectId) || !exists(deploymentId) || !exists(image),
    }
  );

  useEffect(() => {
    if (!deploymentError && !deploymentLoading && deploymentData?.getDeployment) {
      setDeployment(deploymentData.getDeployment);
    }
  }, [deploymentData, deploymentLoading, deploymentError, setDeployment]);

  useEffect(() => {
    if (!imageExifError && !imageExifLoading && imageExifData?.getDataFile?.exifDataFiles) {
      setImageExif(imageExifData.getDataFile.exifDataFiles);
    }
  }, [imageExifData, imageExifLoading, imageExifError, setImageExif]);

  useEffect(() => {
    if (map?.current && deployment?.location?.latitude && deployment?.location?.longitude) {
      map.current.panTo({ lat: deployment.location.latitude, lng: deployment.location.longitude });
    }
  });

  if (!image) {
    return null;
  }

  const openEditDateTimeModal = () => {
    setEditDateTimeModal(true);
  };

  const onCloseEditDateTimeModal = () => {
    setEditDateTimeModal(false);
  };

  return (
    <div className="c-sidebar-metadata-tab">
      {(deploymentError || imageExifError) && (
        <div className="alert alert-warning" role="alert">
          {"Some metadata information couldn't be loaded."}
        </div>
      )}
      <MapNoSSR ref={map} defaultZoom={5}>
        {({ HTMLMarker }) => {
          if (deployment?.location?.latitude && deployment?.location?.longitude) {
            return (
              <HTMLMarker
                position={{ lat: deployment.location.latitude, lng: deployment.location.longitude }}
              />
            );
          }

          return null;
        }}
      </MapNoSSR>
      <div className="mt-md-5">
        {!!image.timestamp && (
          <div className="mb-3">
            {editDateTimeModal
              && (
                <UpdateDateTimeModal
                  open={editDateTimeModal}
                  onClose={onCloseEditDateTimeModal}
                  originalDateTaken={getDateInUTC(image.timestamp)}
                  id={image?.id}
                  deploymentId={deploymentId}
                  projectId={projectId}
                />
              )
            }
            <div className="d-flex">
              <p className="h5 font-weight-normal">
                Date taken
              </p>
              {image?.timestampUpdated
                && (
                  <span className="flag">
                    <FontAwesomeIcon icon={faFlag} size="sm" />
                  </span>
                )
              }
              <button type="button" onClick={openEditDateTimeModal} className="btn btn-secondary btn-sm btn-edit-date-time">Edit</button>
            </div>
            <p>
              {getDateInUTC(image.timestamp)}
            </p>
          </div>
        )}
        {image.createdAt && (
          <div className="mb-3">
            <p className="h5 font-weight-normal">Upload date</p>
            <p>{formatDate(image.createdAt)}</p>
          </div>
        )}
        {!!image.lastModified && (
          <div className="mb-3">
            <p className="h5 font-weight-normal">Last modified</p>
            <p>{formatDate(image.lastModified)}</p>
          </div>
        )}
        <p className="h5 font-weight-normal">Details</p>
        {!!deployment && (
          <Fragment>
            <MetadataItem label="Organization">
              <Link
                route="organizations_show"
                params={{
                  organizationId: deployment.project.organization.id,
                  tab: 'summary',
                }}
              >
                <a>{deployment.project.organization.name}</a>
              </Link>
            </MetadataItem>
            <MetadataItem label="Project">
              <Link
                route="projects_show"
                params={{
                  organizationId: deployment.project.organization.id,
                  projectId,
                  tab: 'summary',
                }}
              >
                <a>{deployment.project.shortName}</a>
              </Link>
            </MetadataItem>
          </Fragment>
        )}
        <div className="row mt-1">
          <div className="col-5 font-weight-bold">Camera deployment</div>
          <div className="col-7">
            <span>{image.deployment.deploymentName}</span>
          </div>
        </div>
        {!!deployment && (
          <Fragment>
            {exists(deployment.location.placename) && (
              <MetadataItem label="Location">{deployment.location.placename}</MetadataItem>
            )}
            {exists(deployment.location.latitude) && (
              <MetadataItem label="Latitude">{deployment.location.latitude}</MetadataItem>
            )}
            {exists(deployment.location.longitude) && (
              <MetadataItem label="Longitude">{deployment.location.longitude}</MetadataItem>
            )}
            {!!deployment.device && (
              <MetadataItem label="Device">{deployment.device.name}</MetadataItem>
            )}
            {!!deployment.device && (
              <MetadataItem label="Device model">{deployment.device.model}</MetadataItem>
            )}
          </Fragment>
        )}
        <MetadataItem label="File">{image.filename}</MetadataItem>
        {!!imageExif && !!getRelevantExif(imageExif).length && (
          <Fragment>
            <div className="mt-md-3">
              <p className="h5 font-weight-normal">Exif</p>
              {getRelevantExif(imageExif)}
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

SidebarMetadataTab.propTypes = {
  image: PropTypes.shape({ thumbnailUrl: PropTypes.string.isRequired }),
  projectId: PropTypes.number,
  deploymentId: PropTypes.number,
};

SidebarMetadataTab.defaultProps = {
  image: null,
  projectId: null,
  deploymentId: null,
};

export default SidebarMetadataTab;
