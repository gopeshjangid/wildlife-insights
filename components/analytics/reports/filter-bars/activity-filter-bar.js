import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import differenceWith from 'lodash/differenceWith';
import { getFormattedDate, translateText } from 'utils/functions';
import { TaxonomyFilter, Filter } from 'components/filters';
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

const FilterBars = ({
  selectedProject,
  speciesList,
  onChange,
  additionalFilters,
  ...props
}) => {
  const [subProjects, setSubProjects] = useState([]);
  const [subProject, setSubProject] = useState('All');
  const [subProjectsSearch, setSubProjectsSearch] = useState('');
  const [interval, setInterval] = useState(2);
  const [species, setSpecies] = useState([]);
  const [sunTime, setSunTime] = useState(false);
  const [error, setError] = useState('');

  const start_date = props?.filters?.timespans?.length
    ? getFormattedDate(
        new Date(props?.filters?.timespans[0]?.start),
        'yyyy-MM-dd'
      )
    : getFormattedDate(new Date(), 'yyyy-MM-dd');
  const end_date = props?.filters?.timespans?.length
    ? getFormattedDate(
        new Date(props?.filters?.timespans[0]?.end),
        'yyyy-MM-dd'
      )
    : getFormattedDate(new Date(), 'yyyy-MM-dd');

  const [dateFilter, setDateFilter] = useState({
    start_date,
    end_date
  });

  const subProjectsResult = useQuery(subProjectsQuery, {
    variables: {
      projectId: Number(selectedProject?.id)
    }
  });

  React.useEffect(() => {
    onChange({
      dateFilter,
      subProject: Number(subProject),
      interval,
      species,
      sunTime
    });
  }, [subProject, interval, species, sunTime]);

  React.useEffect(() => {
    onChange({
      dateFilter,
      subProject: Number(subProject),
      interval,
      species,
      sunTime
    });
  }, [dateFilter?.start_date || dateFilter?.end_date]);

  React.useEffect(() => {
    if (subProjectsResult?.data?.getSubProjectsByProject?.data)
      setSubProjects(
        subProjectsResult?.data?.getSubProjectsByProject?.data?.map(
          subProject => {
            return { label: subProject?.name, value: subProject?.id };
          }
        ) || []
      );
  }, [subProjectsResult?.data]);

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
        options: selectedOptions || []
      },
      {
        label: translateText('Suggestions'),
        options: taxonomySpecies.length
          ? differenceList?.filter(
              option => taxonomySpecies.indexOf(option) > -1
            )
          : differenceList
      }
    ];
  };

  const taxonomyLabelRenderer = (label, selected) => {
    let str;
    if (!selected.length) {
      str = translateText(`Species: ${selected?.textLabel || ''}`);
    } else {
      str = translateText('Species:');
    }
    return <span className="label">{str}</span>;
  };

  const getSpeciesFilter = () => {
    return (
      <>
        <div className="filter-box">
          <TaxonomyFilter
            selected={species}
            async
            isMulti={false}
            label="Species"
            formatOptions={getFilterOptions}
            projectId={props?.selectedProjectId?.id || 2001496}
            onChange={value => setSpecies(value)}
            labelRenderer={taxonomyLabelRenderer}
          />
        </div>

        <div className="filter-box">
          <Filter
            async
            isMulti={false}
            label={translateText('Months')}
            options={[{ label: 'December', value: 'december' }]}
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
            options={[{ label: '2021', value: '2021' }]}
            selected={interval}
            pageSize={50}
            onChange={value => {
              setInterval(value);
            }}
          />
        </div>
      </>
    );
  };
  return (
    <>
      <div className="species-filter">
        <div className="filter-block">{getSpeciesFilter()}</div>
        <div className="filter-block">{getSpeciesFilter()}</div>
        <div className="filter-block subProjectFilter">
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
          <div className="filter-box">
            <Query
              query={subProjectsQuery}
              // @ts-ignore
              variables={{
                projectId: selectedProject || 2001397,
                name: subProjectsSearch
              }}
            >
              {({ loading: subProjectsLoading, data }) => {
                const selectedOptions = subProject || 0;
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
        </div>
      </div>
    </>
  );
};

FilterBars.propTypes = {
  selectedProject: PropTypes.objectOf(PropTypes.object),
  speciesList: PropTypes.objectOf(PropTypes.array)
};

export default FilterBars;
