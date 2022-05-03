import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import { useInView } from 'react-intersection-observer';

import { Link } from 'lib/routes';
import { exists } from 'utils/functions';
//import IdentifyPhotosBadge from 'components/identify-photos-badge';
import RestrictedAccessIcon from 'components/restricted-access-icon';

import ProjectImageQuery from './project-image.graphql';

const Project = ({ project }) => {
  const { error, data } = useQuery(ProjectImageQuery, {
    variables: {
      projectId: +project.id,
    },
  });

  const thumbnailUrl = !error
    ? data?.getDataFilesForProject?.data?.[0]?.data?.[0].thumbnailUrl
    : null;

  return (
    <Fragment>
      <Link
        route='projects_show'
        params={{
          organizationId: project.organization.id,
          projectId: project.id
        }}
      >
        <a>
          <div
            className="thumbnail"
            style={
              thumbnailUrl && {
                backgroundImage: `url(${thumbnailUrl})`,
              }
            }
            aria-label={`Project ${project.shortName}`}
          />
        </a>
      </Link>
      <Link
        route='projects_show'
        params={{
          organizationId: project.organization.id,
          projectId: project.id
        }}
      >
        <a className="item-title">
          {project.shortName}
          <RestrictedAccessIcon ignoreQuery projectId={project.id} />
        </a>
      </Link>
      {/* <IdentifyPhotosBadge projectId={project.id} title="Non-identified photos" /> */}
    </Fragment>
  );
};

Project.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

// This wrapper lazy-loads the cards by using the Intersection Observer API
// The Project component is conditionally rendered and by doing that, we avoid a lot of requests for
// the initial load
const Wrapper = (props) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '100px 0px',
  });

  return (
    <div className="item col-6 col-md-3" ref={ref}>
      {inView ? <Project {...props} /> : <div className="thumbnail" />}
    </div>
  );
};

export default Wrapper;
