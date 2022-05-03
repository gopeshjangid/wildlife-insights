import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useQuery } from 'react-apollo-hooks';
import { omit, keys } from 'lodash';
import classnames from 'classnames';
import NProgress from 'nprogress';

import { exists, translateText } from 'utils/functions';
import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import PublicPage from 'layout/public-page';
import Head from 'layout/head';
import Header from 'layout/header';
import DiscoverSidebar from 'components/discover/sidebar';
import DiscoverMap, { INITIAL_BOUNDS } from 'components/discover/map';
import DiscoverOverlayMessage from 'components/discover/overlay-message';
import { reset } from 'components/discover/actions';
import { setFilters } from 'components/discover/sidebar/filters/modal/advanced-filters/actions';
import discoverDataQuery from './query.graphql';
import './style.scss';

const DiscoverPage = ({
  projectId,
  shouldExpandSidebar,
  basicFilters,
  resetBasicFilters,
  resetAdvFilters
}) => {
  let shouldBeExpandedInitially = false;
  const nProgressTimeoutRef = useRef(null);

  useEffect(() => {
    if (shouldExpandSidebar) {
      shouldBeExpandedInitially = true;
    }

    if (NProgress.isStarted()) {
      const delay = NProgress.settings.speed + 100;
      NProgress.done();
      nProgressTimeoutRef.current = setTimeout(() => {
        NProgress.start();
      }, delay);
    }
    return () => {
      clearTimeout(nProgressTimeoutRef.current);
      resetBasicFilters();
      resetAdvFilters({});
    };
  }, []);

  const [bounds, setBounds] = useState({
    sw: { lat: INITIAL_BOUNDS[0][0], lng: INITIAL_BOUNDS[0][1] },
    ne: { lat: INITIAL_BOUNDS[1][0], lng: INITIAL_BOUNDS[1][1] },
  });

  const [advFilters, setAdvFilters] = useState({});
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({ dataFiles: 0 });
  const [collapsed, setCollapse] = useState(true);

  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);
  const basicFilterQryVars = {
    ...omit(basicFilters, ['country', 'project']),
    countries: basicFilters.country ? [basicFilters.country] : null,
    taxonomies: basicFilters.taxonomies?.length
      ? basicFilters.taxonomies.map(option => option.value)
      : null,
    projects: basicFilters.project?.value ? basicFilters.project.value : null,
  };
  const qryVars = keys(advFilters).length > 0 ? advFilters : basicFilterQryVars;
  const { data, loading, error } = useQuery(discoverDataQuery, {
    variables: qryVars,
    client: publicClient,
  });

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      clearTimeout(nProgressTimeoutRef.current);
      NProgress.done();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && data && data.getDiscoverData) {
      setProjects(data.getDiscoverData.data.projects);
      setBounds(data.getDiscoverData.data.extent);
      setCounts(data.getDiscoverData.data.counts);
    }
  }, [data, loading]);

  const project = useMemo(
    () => (
      exists(projectId) && !!projects.length ? projects.find(p => p.id === projectId) : undefined
    ),
    [projectId, projects]
  );

  useEffect(() => {
    if (project || shouldBeExpandedInitially) {
      // We want to automatically expand the sidebar when the user clicks on a marker
      setCollapse(false);
    }
  }, [project, shouldBeExpandedInitially, setCollapse]);

  const onClickCollapseBtn = useCallback(() => setCollapse(!collapsed), [collapsed, setCollapse]);
  return (
    <div className="p-public-discover">
      <PublicPage>
        <Header />
        <Head title={project ? project.name : 'Explore Data'} />
        {error && (
          <div className="alert alert-danger mt-5 mx-5" role="alert">
            Unable to load the data. Please try again in a few minutes.
          </div>
        )}
        {!error && (
          <div className="page-container">
            {collapsed && (
              <DiscoverOverlayMessage
                imagesCount={counts.dataFiles}
                loading={loading}
                onClickExpand={onClickCollapseBtn}
              />
            )}
            {!collapsed && (
              <div className="sidebar">
                {!project && (
                  <button
                    className="btn btn-sm btn-primary btn-alt pl-3 pr-2 sidebar-collapse-btn"
                    type="button"
                    onClick={onClickCollapseBtn}
                  >
                    {translateText('Hide bar')}
                  </button>
                )}
                <DiscoverSidebar
                  dataLoading={loading}
                  counts={counts}
                  project={project}
                  onChangeAdvFilters={setAdvFilters}
                  filters={qryVars}
                />
              </div>
            )}
            <div className={classnames('map', { 'is-collapsed': collapsed })}>
              <DiscoverMap
                projects={projects}
                project={project}
                bounds={bounds}
              />
            </div>
          </div>
        )}
      </PublicPage>
    </div>
  );
};

DiscoverPage.propTypes = {
  projectId: PropTypes.number,
};

DiscoverPage.defaultProps = {
  projectId: undefined,
};

const mapStateToProps = ({ routes: { query }, explore }) => ({
  projectId: exists(query.projectId) ? +query.projectId : undefined,
  shouldExpandSidebar: explore.shouldExpandSidebar,
  basicFilters: explore.basicFilters
});

const mapDispatchToProps = (dispatch) => ({
  resetBasicFilters: () => dispatch(reset()),
  resetAdvFilters: filters => dispatch(setFilters(filters)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverPage);
