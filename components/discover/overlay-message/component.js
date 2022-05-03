import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { useQuery } from 'react-apollo-hooks';

import { getPublicApolloClient } from 'lib/initApollo';
import { translateText, formatDate, parseUTCDateInLocalTimeZone } from 'utils/functions';
import { getCountryFromIso } from 'utils/country-codes';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import T from 'components/transifex/translate';
import { FORMAT } from 'components/form/datepicker';

import LoadingSpinner from 'components/loading-spinner';
import discoverFiltersQuery from './query.graphql';
import './style.scss';

const DiscoverOverlayMessage = ({ imagesCount, basicFilters, loading, onClickExpand }) => {
  const [timespans, setTimespans] = useState(null);
  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);
  const { data: filtersData, loading: filtersLoading } = useQuery(discoverFiltersQuery, {
    client: publicClient,
  });

  useEffect(() => {
    if (!filtersLoading && filtersData && filtersData.getDiscoverFilters) {
      const filterValues = filtersData.getDiscoverFilters;

      const currentStartDate = parseUTCDateInLocalTimeZone(
        basicFilters?.timespan?.start ? basicFilters.timespan.start : filterValues.timespan.start
      );
      const currentEndDate = parseUTCDateInLocalTimeZone(
        basicFilters?.timespan?.end ? basicFilters.timespan.end : filterValues.timespan.end
      );

      setTimespans({ currentStartDate, currentEndDate });
    }
  }, [basicFilters, filtersData, filtersLoading]);

  if (loading) {
    return (
      <div className="c-discover-overlay-message">
        <LoadingSpinner inline mini />
        <span className="ml-2">
          <T text="Loading..." />
        </span>
      </div>
    );
  }

  return (
    <div className="c-discover-overlay-message">
      <p className="mb-2">
        {translateText('Showing')}{' '}
        <strong>
          {translateText(`{imagesCount} camera trap record${imagesCount > 1 ? 's' : ''}`, {
            imagesCount: numeral(imagesCount).format('0,0'),
          })}
        </strong>{' '}
        {basicFilters.taxonomies?.length === 1
          && `${translateText('of')} ${basicFilters.taxonomies[0].label}`}
        {basicFilters.taxonomies?.length > 1
          && translateText('of {count} species', { count: basicFilters.taxonomies.length })}{' '}
        {translateText('taken in')}{' '}
        {`${basicFilters.country === null
          ? translateText('the whole world')
          : getCountryFromIso(basicFilters.country) || basicFilters.country
          }`}{' '}
        {translateText('between')}{' '}
        {timespans
          ? `${formatDate(new Date(timespans.currentStartDate), FORMAT)} ${translateText(
            'and'
          )} ${formatDate(new Date(timespans.currentEndDate), FORMAT)}`
          : translateText('any time and today')}
        {!!basicFilters.project?.value && ` ${translateText('and part of')} "${basicFilters.project.label}"`}
        .
      </p>
      <button className="btn btn-link p-0 font-weight-bold" type="button" onClick={onClickExpand}>
        {translateText('See filters and statistics')}
      </button>
    </div>
  );
};

DiscoverOverlayMessage.propTypes = {
  imagesCount: PropTypes.number.isRequired,
  basicFilters: PropTypes.shape({}).isRequired,
  loading: PropTypes.bool.isRequired,
  onClickExpand: PropTypes.func.isRequired,
};

export default DiscoverOverlayMessage;
