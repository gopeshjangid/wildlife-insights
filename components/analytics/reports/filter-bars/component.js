import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import differenceWith from 'lodash/differenceWith';
import { getFormattedDate, translateText, formatDate } from 'utils/functions';
import {
  SelectableDateRangeFilter,
  TaxonomyFilter,
  Filter
} from 'components/filters';
import { Query } from 'react-apollo';
import '../style.scss';
import subProjectsQuery from 'components/actions-bar/project-subprojects.graphql';

const INTERVAL_LIST = [
  { label: '1 min', value: 1 },
  {
    label: '2 min',
    value: 2
  },
  {
    label: '30 min',
    value: 30
  },
  { label: '60 min', value: 60 }
];

const SELECTION_BY_OPTIONS = [
  {
    label: 'None',
    value: ''
  },
  {
    label: 'Class',
    value: 'taxonomyClass'
  },
  {
    label: 'Family',
    value: 'taxonomyFamily'
  },
  {
    label: 'IUCN Red list status',
    value: 'iucn_status'
  },
  {
    label: 'Taxonomy sub type',
    value: 'taxonomy_sub_type'
  }
];

const FilterBars = ({
  selectedProjectId,
  speciesList,
  onChange,
  additionalFilters,
  ...props
}) => {
  const [subProject, setSubProject] = useState('All');
  const [subProjectsSearch, setSubProjectsSearch] = useState('');
  const [interval, setInterval] = useState({ label: '30 min', value: 30 });
  const [species, setSpecies] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [dateRangeList, setDateRangeList] = useState([]);
  const [sunTime, setSunTime] = useState(false);
  const start_date = getFormattedDate(new Date(), 'yyyy-MM-dd');
  const end_date = getFormattedDate(new Date(), 'yyyy-MM-dd');
  const [selectBy, setSelectBy] = useState('');
  const [selectFilter, setSelectFilter] = useState('');
  const [selectFiltersList, setSelectFiltersList] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    start_date,
    end_date
  });

  const monthsOrder = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const getFormatDate = date => {
    return getFormattedDate(new Date(date), 'yyyy-MM-dd');
  };

  const dateRangeFormatter = dateRangeArray => {
    return dateRangeArray?.map(date => {
      const start = getFormattedDate(new Date(date?.start), 'MM/dd/yyyy');
      const end = getFormattedDate(new Date(date?.end), 'MM/dd/yyyy');
      return {
        label: `${start}${' '}-${' '}${end}`,
        value: `${start}-${end}`
      };
    });
  };

  React.useEffect(() => {
    if (
      props?.filters?.timespans[0]?.start &&
      props?.filters?.timespans[0]?.end
    ) {
      const firstSelectDateRange = {
        start_date: getFormatDate(props?.filters?.timespans[0]?.start),
        end_date: getFormatDate(props?.filters?.timespans[0]?.end)
      };

      const formattedDateRangeValue = dateRangeFormatter(
        props?.filters?.timespans
      );
      setDateFilter(firstSelectDateRange);
      setDateRangeList(formattedDateRangeValue);
      setDateRange(formattedDateRangeValue[0]);
    }
  }, [props?.filters?.timespans]);

  React.useEffect(() => {
    if (onChange) {
      onChange({
        dateFilter,
        subProject: Number(subProject?.value),
        interval: Number(interval?.value),
        species,
        sunTime
      });
    }
  }, [subProject, interval, species, sunTime, dateFilter]);

  const getDateRangeData = useMemo(
    () => type => {
      let list = props?.filters?.timespans.map(range => {
        const format = type === 'MONTH' ? 'MMMM' : 'yyyy';
        const startValue = formatDate(new Date(range.start), format);
        const endValue = formatDate(new Date(range.end), format);
        return [startValue, endValue];
      });
      list = [].concat.apply([], list);
      list = [...new Set(list)];
      list =
        type === 'MONTH'
          ? monthsOrder.filter(m => list.indexOf(m) !== -1)
          : list.sort((a, b) => a - b);
      return list.map(m => ({ label: m, value: m }));
    },
    [props?.filters?.timespans]
  );

  const changeSelectBy = param => {
    setSelectFiltersList(
      props?.filters[param]?.map(m => ({
        label: m,
        value: m
      })) || []
    );
  };

  const getFilterOptions = (selectedOptions, suggestedOptions) => {
    const differenceList = differenceWith(
      suggestedOptions,
      selectedOptions,
      (a, b) => a.value === b.value
    );
    const taxonomySpecies = props?.filters?.taxonomySpecies || [];

    return [
      {
        label: translateText('Selected'),
        options: [selectedOptions] || []
      },
      {
        label: translateText('Suggestions'),
        options: differenceList
      }
    ];
  };

  const taxonomyLabelRenderer = (label, selected) => {
    let str;
    if (!selected?.length) {
      str = translateText(`Species: ${selected?.textLabel || ''}`);
    } else {
      str = translateText('Species:');
    }
    return <span className="label">{str}</span>;
  };

  const selectlabelRenderer = (label, selected) => {
    let str;
    if (!selected.length) {
      str = translateText(`${label}: ${selected?.textLabel || ''}`);
    } else {
      str = translateText(`${label}:`);
    }
    return <span className="label">{str}</span>;
  };

  const dateRangeLabelRenderer = (label, selected) => {
    return <span className="label">{translateText(`${selected?.label}`)}</span>;
  };

  const isShowFilter = key => {
    return (
      !additionalFilters ||
      (additionalFilters && additionalFilters.length === 0) ||
      (additionalFilters && additionalFilters.indexOf(key) > -1)
    );
  };

  return (
    <>
      <div className="map-filter">
        {props?.children}
        {isShowFilter('species') && (
          <div className="filter-box">
            <TaxonomyFilter
              selected={species}
              async
              isMulti={false}
              label="Species"
              formatOptions={getFilterOptions}
              projectId={
                selectedProjectId?.id ? Number(selectedProjectId?.id) : 0
              }
              onChange={value => setSpecies(value)}
              labelRenderer={taxonomyLabelRenderer}
            />
          </div>
        )}
        {isShowFilter('interval') && (
          <div className="filter-box interval-filter">
            <Filter
              async
              isMulti={false}
              label={translateText('Independence interval')}
              options={INTERVAL_LIST}
              selected={interval}
              pageSize={50}
              onChange={value => {
                setInterval(value);
              }}
            />
          </div>
        )}
        <div className="filter-box">
          <Query
            query={subProjectsQuery}
            // @ts-ignore
            variables={{
              projectId: selectedProjectId?.id
                ? Number(selectedProjectId?.id)
                : 0,
              name: subProjectsSearch
            }}
          >
            {({ loading: subProjectsLoading, data }) => {
              const { data: d } = (data &&
                (data.getSubProjects ||
                  data.getSubProjectsByOrganization ||
                  data.getSubProjectsByProject)) || { data: [] };
              const suggestedOptions = d.map(({ id, name }) => ({
                label: name,
                value: id
              }));

              return (
                <div className="flex-shrink-1 mr-2">
                  <Filter
                    async
                    isMulti={false}
                    label={translateText('Subprojects')}
                    isLoading={subProjectsLoading}
                    options={suggestedOptions}
                    selected={subProject}
                    pageSize={50}
                    onChange={value => {
                      setSubProject(value);
                    }}
                    onInputChange={search => setSubProjectsSearch(search)}
                  />
                </div>
              );
            }}
          </Query>
        </div>
        {isShowFilter('monthYear') && (
          <>
            <div className="filter-box">
              <Filter
                async
                isMulti={false}
                label={translateText('Months')}
                options={getDateRangeData('MONTH')}
                selected={interval}
                pageSize={50}
                onChange={value => {
                  setInterval(value);
                }}
              />
            </div>
            <div className="filter-box">
              <Filter
                async
                isMulti={false}
                label={translateText('Years')}
                options={getDateRangeData('YEAR')}
                selected={interval}
                pageSize={50}
                onChange={value => {
                  setInterval(value);
                }}
              />
            </div>
          </>
        )}
        {isShowFilter('selectDateRange') && (
          <div className="filter-box">
            <div className="date-row">
              <SelectableDateRangeFilter
                defaultFromDate={new Date()}
                defaultToDate={new Date()}
                filterRange={{
                  from: new Date(dateFilter?.start_date),
                  to: new Date(dateFilter?.end_date)
                }}
                hideDateLabel
                onChange={(startDate, endDate) =>
                  setDateFilter({
                    start_date: getFormatDate(startDate),
                    end_date: getFormatDate(endDate)
                  })
                }
              />
            </div>
          </div>
        )}
        {additionalFilters && additionalFilters.indexOf('suntime') > -1 && (
          <div className="filter-box toggle-container">
            <label> Sun time</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={sunTime}
                onChange={({ target }) => setSunTime(target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>
        )}
        {isShowFilter('dateRange') && (
          <div className="filter-box">
            <Filter
              async
              isMulti={false}
              label={translateText('Date range')}
              options={dateRangeList}
              labelRenderer={dateRangeLabelRenderer}
              selected={dateRange}
              pageSize={50}
              onChange={value => {
                const splitted = value?.value?.split('-');
                setDateRange(value);
                setDateFilter({
                  start_date: splitted[0],
                  end_date: splitted[1]
                });
              }}
            />
          </div>
        )}
        {isShowFilter('selectBy') && (
          <>
            <div className="filter-box">
              <Filter
                async
                isMulti={false}
                label={translateText('Selection by')}
                options={SELECTION_BY_OPTIONS}
                selected={selectBy}
                pageSize={50}
                labelRenderer={selectlabelRenderer}
                onChange={value => {
                  setSelectBy(value || '');
                  changeSelectBy(value?.value);
                }}
              />
            </div>
            <div className="filter-box">
              <Filter
                async
                isMulti={false}
                labelRenderer={selectlabelRenderer}
                label={translateText('Selection')}
                options={selectFiltersList}
                selected={selectFilter}
                pageSize={50}
                onChange={value => {
                  setSelectFilter(value);
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

FilterBars.propTypes = {
  selectedProjectId: PropTypes.string
};

export default React.memo(FilterBars);
