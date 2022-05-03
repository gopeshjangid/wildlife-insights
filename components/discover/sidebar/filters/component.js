import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import numeral from 'numeral';
import { keys, omit } from 'lodash';
import { useQuery } from 'react-apollo-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import { getCountryFromIso } from 'utils/country-codes';
import {
  translateText,
  exists,
  parseUTCDateInLocalTimeZone,
  parseLocalTimeZoneDateInUTC,
} from 'utils/functions';
import { Filter } from 'components/filters';
import { Form, DatePicker } from 'components/form';

import discoverFiltersQuery from './query.graphql';
import taxonomiesQuery from './taxonomies.graphql';
import './style.scss';
import { getTaxonomyOptions, serializeFilter } from './helpers';
import AdvancedFilterModal from './modal/advanced-filters';

const DiscoverFilters = ({
  imagesCount,
  basicFilters,
  useCommonNames,
  onChangeBasicFilters,
  onChangeAdvFilters,
  advFilters,
  setAdvFilters
}) => {
  const advFiltersCount = keys(omit(advFilters, ['filterKey'])).length;
  const disableBasicFilter = advFiltersCount > 0;
  const [filterValues, setFilterValues] = useState(null);
  const [taxonomySearch, setTaxonomySearch] = useState(null);
  const [taxonomyOptions, setTaxonomyOptions] = useState([]);
  const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);

  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);
  const { data: filtersData, loading: filtersLoading, error: filtersError } = useQuery(
    discoverFiltersQuery,
    {
      client: publicClient,
    }
  );

  const { data: taxonomyData, loading: taxonomyLoading, error: taxonomyError } = useQuery(
    taxonomiesQuery,
    {
      client: publicClient,
      variables: {
        search: taxonomySearch,
        sort: [
          {
            column: useCommonNames ? 'commonNameEnglish' : 'scientificName',
            order: 'ASC',
          },
        ],
      },
    }
  );

  useEffect(() => {
    if (!filtersLoading && filtersData && filtersData.getDiscoverFilters) {
      setFilterValues(filtersData.getDiscoverFilters);
    }
  }, [filtersData, filtersLoading]);

  useEffect(() => {
    if (!taxonomyLoading && !taxonomyError) {
      const suggestedOptions = taxonomyData.getTaxonomiesPublic.data.map(d => ({
        label: (
          <Fragment>
            {useCommonNames ? d.commonNameEnglish : d.scientificName}
            <div className="font-italic">
              {useCommonNames ? d.scientificName : d.commonNameEnglish}
            </div>
          </Fragment>
        ),
        value: d.uniqueIdentifier,
      }));

      setTaxonomyOptions(getTaxonomyOptions(basicFilters.taxonomies || [], suggestedOptions));
    }
  }, [basicFilters, taxonomyData, taxonomyError, taxonomyLoading, useCommonNames]);

  if (!filterValues) {
    return null;
  }

  const countryFilterOptions = [
    { label: translateText('whole world'), value: null },
    ...(filterValues
      ? filterValues.countries.map(code => ({
        label: getCountryFromIso(code) || code,
        value: code,
      }))
      : []
    ).sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' })),
  ];

  const projectFilterOptions = [
    { label: translateText('any project'), value: null },
    ...(filterValues
      ? filterValues.projects.map(project => ({
        label: project.shortName,
        value: project.id
      }))
      : []
    ).sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' })),
  ];

  const minDate = parseUTCDateInLocalTimeZone(filterValues.timespan.start);
  const maxDate = parseUTCDateInLocalTimeZone(filterValues.timespan.end);

  const currentStartDate = basicFilters?.timespan?.start
    ? parseUTCDateInLocalTimeZone(basicFilters.timespan.start)
    : minDate;
  const currentEndDate = basicFilters?.timespan?.end
    ? parseUTCDateInLocalTimeZone(basicFilters.timespan.end)
    : maxDate;

  const onChange = (filterName, filterValue) => {
    const newFilters = { ...basicFilters };

    if (filterName === 'start' || filterName === 'end') {
      if (exists(filterValue)) {
        newFilters.timespan = newFilters.timespan || {
          start: parseLocalTimeZoneDateInUTC(currentStartDate),
          end: parseLocalTimeZoneDateInUTC(currentEndDate),
        };
        newFilters.timespan[filterName] = serializeFilter(filterName, filterValue);
      }
    } else {
      newFilters[filterName] = serializeFilter(filterName, filterValue);
    }
    onChangeBasicFilters(newFilters);
  };

  const taxonomyLabelRenderer = (label, selected) => {
    let str;
    if (!selected.length) {
      str = translateText('any species');
    } else if (selected.length === 1) {
      str = `${selected[0].label.slice(0, 30)}${selected[0].label.length > 30 ? '...' : ''}`;
    } else {
      str = translateText('{count} species', { count: selected.length });
    }

    return <span className="label">{str}</span>;
  };

  const clearAdvFilters = () => {
    onChangeAdvFilters({});
    setAdvFilters({});
  };

  return (
    <div className="c-discover-filters">
      <Form>
        {!!filtersError && (
          <div className="alert alert-danger mt-5 mx-5" role="alert">
            Unable to load the filters. Please try again in a few minutes.
          </div>
        )}
        {!filtersError && (
          <div>
            {translateText('Showing')}{' '}
            <span className="font-weight-bold">
              {translateText(`{imagesCount} camera trap record${imagesCount > 1 ? 's' : ''}`, {
                imagesCount: numeral(imagesCount).format('0,0'),
              })}
            </span>
            <br />
            {translateText('of')}
            <Filter
              disabled={disableBasicFilter}
              async
              label={translateText('Species')}
              labelRenderer={taxonomyLabelRenderer}
              isLoading={taxonomyLoading}
              pageSize={50}
              options={taxonomyOptions}
              selected={basicFilters.taxonomies || []}
              onChange={options => onChange('taxonomies', options)}
              onInputChange={setTaxonomySearch}
            />
            <br />
            {translateText(`in${basicFilters.country === null ? ' the' : ''}`)}
            <Filter
              disabled={disableBasicFilter}
              label={translateText('Country')}
              labelRenderer={(_, selected) => <span className="label">{selected.label}</span>}
              isMulti={false}
              isLoading={!filterValues}
              options={countryFilterOptions}
              selected={countryFilterOptions.find(o => o.value === basicFilters.country)}
              onChange={option => onChange('country', option)}
            />
            <br />
            {translateText('taken between')}
            {filterValues && (
              <div className={classnames('c-datepicker-filter', { disabled: disableBasicFilter })}>
                <DatePicker
                  disabled={disableBasicFilter}
                  wrapperClassName="c-datepicker-filter"
                  id="start-date"
                  field="start"
                  after={minDate}
                  before={maxDate}
                  value={currentStartDate}
                  onChange={value => onChange('start', value)}
                />
                <label htmlFor="start-date">
                  <span className="sr-only">Start date</span>
                  <FontAwesomeIcon className="ml-2" icon={faAngleDown} size="sm" />
                </label>
              </div>
            )}
            <br />
            {translateText('and')}
            {filterValues && (
              <div className={classnames('c-datepicker-filter', { disabled: disableBasicFilter })}>
                <DatePicker
                  disabled={disableBasicFilter}
                  wrapperClassName="c-datepicker-filter"
                  id="end-date"
                  field="end"
                  after={minDate}
                  before={maxDate}
                  value={currentEndDate}
                  onChange={value => onChange('end', value)}
                />
                <label htmlFor="end-date">
                  <span className="sr-only">End date</span>
                  <FontAwesomeIcon className="ml-2" icon={faAngleDown} size="sm" />
                </label>
              </div>
            )}
            <br />
            {translateText('and part of')}
            <Filter
              disabled={disableBasicFilter}
              label={translateText('Project')}
              labelRenderer={(_, selected) => <span className="label">{selected.label}</span>}
              isLoading={!filterValues}
              isMulti={false}
              options={projectFilterOptions}
              selected={projectFilterOptions.find(o => o.value === (basicFilters.project?.value || null))}
              onChange={option => onChange('project', option)}
            />
          </div>
        )}
      </Form>
      {showAdvancedFilterModal
        && (<AdvancedFilterModal
          onClose={() => setShowAdvancedFilterModal(false)}
          open={showAdvancedFilterModal}
          onChangeFilters={onChangeAdvFilters}
          basicSelection={basicFilters}
          minDate={minDate}
          maxDate={maxDate}
          disableBasicFilter={disableBasicFilter}
          currentStartDate={currentStartDate}
          currentEndDate={currentEndDate}
          advFilters={advFilters}
          setAdvFilters={setAdvFilters}
        />
        )
      }
      <button
        type="button"
        className="btn btn-secondary btn-sm btn-adv"
        onClick={() => setShowAdvancedFilterModal(true)}
      >
        {
          advFiltersCount === 0 ? 'Advanced filters' : `Advanced filters (${advFiltersCount})`
        }
      </button>
      {advFiltersCount > 0
        && (
          <button
            type="button"
            className="clear-adv-filters-btn"
            onClick={clearAdvFilters}
          >
            <img
              className="clear-adv-filters"
              alt=""
              src="/static/ic_cancel_green_24px.png"
            />
          </button>
        )
      }
    </div>
  );
};

DiscoverFilters.propTypes = {
  imagesCount: PropTypes.number.isRequired,
  basicFilters: PropTypes.shape({}).isRequired,
  useCommonNames: PropTypes.bool.isRequired,
  onChangeBasicFilters: PropTypes.func.isRequired,
  onChangeAdvFilters: PropTypes.func.isRequired,
  setAdvFilters: PropTypes.func.isRequired,
  advFilters: PropTypes.shape({}).isRequired,
};

export default DiscoverFilters;
