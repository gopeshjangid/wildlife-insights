import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';

import { exists } from 'utils/functions';
import IdentifyQuery from './identify.graphql';
import IdentifyProjectQuery from './identify-project.graphql';

const IdentifyPhotosBadge = ({ projectId, title }) => {
  let query = IdentifyQuery;
  if (exists(projectId)) {
    query = IdentifyProjectQuery;
  }

  // prevent <Query> component execution at server-side
  if (!process.browser) {
    return null;
  }

  return (
    <Query query={query} variables={{ projectId }}>
      {({ data }) => {
        if (!data || !Object.keys(data).length) {
          return null;
        }

        const key = Object.keys(data)[0];
        if (!data[key]) {
          // This case happens for the demo of the analytics (the project doesn't exist in the
          // database, but the analytics endpoints have data for it)
          return null;
        }

        const count = data[key].meta.totalItems;
        if (count === 0) {
          return null;
        }

        return (
          <div className="c-identify-photos-badge d-inline-block" title={title}>
            <span className="badge badge-pill badge-danger d-block">
              {count > 999 ? '999+' : count}
            </span>
          </div>
        );
      }}
    </Query>
  );
};

IdentifyPhotosBadge.propTypes = {
  projectId: PropTypes.number,
  title: PropTypes.string,
  // eslint-disable-next-line react/no-unused-prop-types
  ignoreQuery: PropTypes.bool,
};

IdentifyPhotosBadge.defaultProps = {
  projectId: undefined,
  title: undefined,
  ignoreQuery: false,
};

export default IdentifyPhotosBadge;
