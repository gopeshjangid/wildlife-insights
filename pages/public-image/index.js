import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import Header from 'layout/header';
import Head from 'layout/head';
import { translateText, getGraphQLErrorMessage } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import imageQuery from './get-public-image-url.graphql';
import './style.scss';

const PublicImagePage = (props) => {
  const { id, uuid } = props;
  const { data, loading, error } = useQuery(imageQuery, {
    variables: {
      downloadId: +id,
      imageUUID: uuid,
    },
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <Fragment>
      <Header />
      <Head title="Public Image" />
      <div className="c-public-image">
        {loading && <LoadingSpinner inline /> }
        {error
          && (
            <div className="alert alert-danger" role="alert">
              {translateText(getGraphQLErrorMessage(error))}
            </div>
          )
        }
        {!loading
          && (
            <img
              src={data?.getDataFilePublicDownloadUrl?.url}
              alt=""
            />
          )
        }
      </div>
    </Fragment>
  );
};

PublicImagePage.getInitialProps = ({ query }) => {
  const { id, uuid } = query;
  return {
    id,
    uuid
  };
};

PublicImagePage.propTypes = {
  id: PropTypes.string.isRequired,
  uuid: PropTypes.string.isRequired,
};

export default PublicImagePage;
