import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { useQuery } from 'react-apollo-hooks';
import { keys, map, find, remove, includes, omit, filter } from 'lodash';
import { connect } from 'react-redux';
import { getCountryFromIso } from 'utils/country-codes';

import getAdvancedDiscoverFiltersQuery from './get-advanced-discover-filters.graphql';
import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import { translateText, getGraphQLErrorMessage } from 'utils/functions';
import { TextFilter } from 'components/filters';
import LoadingSpinner from 'components/loading-spinner';
import {
  convertObjectToAlphaGrp,
  convertArrayToAlphaGrp,
  parseFilters
} from 'components/discover/sidebar/filters/modal/advanced-filters/helpers';

import './style.scss';
import * as actions from '../../actions';

const AdvanceFiltersModal = ({
  advFilters,
  basicSelection,
  disableBasicFilter,
  currentStartDate,
  currentEndDate,
  saveFilter,
  isBasic
}) => {
  const defaultCategoryName = isBasic ? 'taxonomyClass' : 'iucnStatus';
  const singleSelectKeys = [
    'sensorMethod',
    'sensorCluster',
    'embargo',
    'blankImages'
  ];
  const taxonomiesKeys = [
    'taxonomyClass',
    'taxonomyOrder',
    'taxonomyFamily',
    'taxonomyGenus',
    'taxonomySpecies'
  ];
  const allExpandableKeys = [
    'imageLicense',
    'metadataLicense',
    'sensorLayout',
    'featureTypes',
    'baitUse',
    'baitType',
    'devices'
  ];
  const defaultExpandedKeys = [...Array(15).keys()];
  const labels = {
    taxonomyClass: { selected: 'Class', any: 'Any class' },
    taxonomyOrder: { selected: 'Order', any: 'Any order' },
    taxonomyFamily: { selected: 'Family', any: 'Any family' },
    taxonomyGenus: { selected: 'Genus', any: 'Any genus' },
    taxonomySpecies: { selected: 'Species', any: 'Any species' },
    taxonomyCommonName: { selected: 'Common Name', any: 'Any common name' },
    sensorMethod: { selected: 'Sensor Methods', any: 'All' },
    featureTypes: { selected: 'Feature Types', any: 'Any feature types' },
    projects: { selected: 'Project', any: 'Any project' },
    countries: { selected: 'Country', any: 'Any country' },
    sensorLayout: { selected: 'Sensor Layouts', any: 'Any sensor layout' },
    sensorCluster: { selected: 'Sensor Clusters', any: 'All' },
    metadataLicense: {
      selected: 'Metadata Licenses',
      any: 'Any metadata license'
    },
    embargo: { selected: 'Active Embargo', any: 'All' },
    blankImages: { selected: 'Include Blank Images', any: 'All' },
    continents: { selected: 'Continent', any: 'Any continent' },
    initiatives: { selected: 'Initiative', any: 'Any initiative' },
    organizations: { selected: 'Organization', any: 'Any organization' },
    baitUse: { selected: 'Bait use', any: 'Any bait use' },
    baitType: { selected: 'Bait type', any: 'Any bait type' },
    imageLicense: { selected: 'Image License', any: 'All' },
    deployments: { selected: 'Deployments', any: 'All' },
    cameras: { selected: 'Cameras', any: 'All' },
    locations: { selected: 'Locations', any: 'All' },
    iucnStatus: { selected: 'IUCN Red list status', any: 'All' },
    devices: { selected: 'Cameras', any: 'All' },
    subprojects: { selected: 'Subprojects', any: 'All' },
    sensorStatus: { selected: 'Camera Status', any: 'All' },
    sensorHeight: { selected: 'Camera Height', any: 'All' },
    sensorOrientation: { selected: 'Camera Angle', any: 'All' }
  };
  const arrayOptions = [
    'featureTypes',
    'sensorMethod',
    'sensorLayout',
    'sensorCluster',
    'metadataLicense',
    'embargo',
    'blankImages',
    'baitUse',
    'baitType',
    'imageLicense',
    'taxonomyCommonName',
    'continents',
    'iucnStatus',
    'sensorOrientation',
    'sensorStatus',
    'sensorHeight'
  ];

  let initialVars = {};

  if (!disableBasicFilter) {
    if (basicSelection?.project?.value) {
      initialVars.projects = [basicSelection?.project];
    }
    if (basicSelection?.timespan) {
      initialVars.timespan = {
        start: currentStartDate,
        end: currentEndDate
      };
    }

    if (basicSelection?.taxonomies && basicSelection?.taxonomies.length > 0) {
      const species = [];
      basicSelection?.taxonomies.forEach(element => {
        species.push({
          label: element.label,
          value: element.label
        });
      });
      initialVars.taxonomySpecies = species;
    }
  } else {
    initialVars = advFilters;
  }
  const publicClient = getPublicApolloClient(GQL_PUBLIC_DEFAULT);
  const [filters, setFilters] = useState(initialVars);
  const [filterOptions, setFilterOptions] = useState({});
  const [category, setCategory] = useState({
    type: defaultCategoryName,
    data: filters?.taxonomyOrder || [],
    valueField: 'value',
    labelField: 'label'
  });
  const [filtersVars, setFiltersVars] = useState(
    parseFilters(initialVars, defaultCategoryName)
  );
  const [expandCollapse, setExpandCollapse] = useState([]);
  const flagSingleSelect = includes(singleSelectKeys, category.type);
  const isArrayOptions = includes(arrayOptions, category.type);
  // @ts-ignore
  const { data: dataQry, loading: loadingQry, error: errorQry } = useQuery(
    getAdvancedDiscoverFiltersQuery,
    {
      variables: filtersVars,
      client: publicClient
    }
  );

  useEffect(() => {
    setExpandCollapse([0]);
    const tmpFilterVars = parseFilters(filters, defaultCategoryName);
    tmpFilterVars.filterKey = category.type;
    setFiltersVars(tmpFilterVars);
  }, [category.type]);

  useEffect(() => {
    if (disableBasicFilter) {
      setFilters(advFilters);
    }
  }, [advFilters]);

  const countryFilterOptions = paramCountries =>
    paramCountries.map(value => ({ label: getCountryFromIso(value), value }));

  const devicesFilterOptions = paramDevices =>
    paramDevices.map(value => ({ label: value?.name, value: value?.id }));

  const getTaxonomyOption = paramTaxData =>
    paramTaxData.map(value => ({ label: value, value }));

  useEffect(() => {
    const newCategory = { ...category };
    if (!loadingQry && !errorQry) {
      const { getAdvancedDiscoverFilters } = dataQry;
      const { data: newDataQry } = getAdvancedDiscoverFilters;
      let categoryResult = newDataQry[category.type] || [];
      if (category.type === 'countries') {
        categoryResult = countryFilterOptions(newDataQry?.countries || []);
      } else if (includes(taxonomiesKeys, category.type)) {
        categoryResult = getTaxonomyOption(newDataQry[category.type] || []);
      } else if (category.type === 'devices') {
        categoryResult = devicesFilterOptions(newDataQry[category.type] || []);
      } else if (category.type === 'locations') {
        categoryResult = devicesFilterOptions(newDataQry[category.type] || []);
      } else if (category.type === 'subprojects') {
        categoryResult = devicesFilterOptions(newDataQry[category.type] || []);
      } else if (category.type === 'deployments') {
        categoryResult = devicesFilterOptions(newDataQry[category.type] || []);
      }

      setFilterOptions(newDataQry);
      newCategory.data = categoryResult;
      setCategory(newCategory);
      if (includes(allExpandableKeys, category.type)) {
        setExpandCollapse(defaultExpandedKeys);
      }
    } else if (loadingQry) {
      setFilterOptions([]);
    }
  }, [dataQry, loadingQry, errorQry]);

  const resetFilterCategory = type => {
    let newFilter = { ...filters };

    // @ts-ignore
    newFilter = omit(newFilter, [type]);
    saveFilter({ [type]: null });
    // @ts-ignore
    newFilter.filterKey = category.type;

    setFilters(newFilter);
    setFiltersVars(parseFilters(newFilter, defaultCategoryName));
  };

  const handleFilters = (label, value) => {
    const filters_new = filters;
    if (!flagSingleSelect) {
      if (!filters_new[category.type]) {
        filters_new[category.type] = [
          {
            label,
            value
          }
        ];
      } else {
        const flagExist = find(filters_new[category.type], row => {
          return row.value === value;
        });
        if (!flagExist) {
          filters_new[category.type].push({
            label,
            value
          });
        } else {
          remove(filters_new[category.type], row => {
            return row.value === value;
          });
        }
      }
    } else {
      filters_new[category.type] = [
        {
          label,
          value
        }
      ];
    }
    if (filters_new[category.type].length > 0) {
      setFilters({
        ...filters_new,
        [category.type]: filters_new[category.type]
      });
    } else {
      // @ts-ignore
      setFilters(omit(filters_new, category.type));
    }
  };

  const handleExpandCollapse = index => {
    setExpandCollapse(prevState => {
      const tmpValue = [...prevState];
      if (!includes(tmpValue, index)) {
        tmpValue.push(index);
      } else {
        remove(tmpValue, val => {
          return val === index;
        });
      }
      return tmpValue;
    });
  };

  const renderCheckboxes = () => {
    const data = !isArrayOptions
      ? convertObjectToAlphaGrp(category.data, category.labelField)
      : convertArrayToAlphaGrp(category.data);
    const dataKeys = keys(data).sort();
    const selectedValues = map(filters[category.type], 'value');
    return (
      <div className="alphabetical-filter">
        <div className="any-order">
          <div className="form-group">
            <input
              checked={!filters[category.type]}
              type="checkbox"
              onChange={() => null}
            />
            <label onClick={() => resetFilterCategory(category.type)}>
              {labels[category.type].any}
            </label>
          </div>
        </div>
        {map(dataKeys, (key, index) => (
          <div key={`divalpha${key}-${index}`}>
            <div className="alphabet d-flex justify-content-between">
              <div>
                <span>{key}</span>
                <span className="alpha-count">
                  ({data[key].children.length})
                </span>
              </div>
              <div>
                <button
                  type="button"
                  className="pointer"
                  onClick={() => handleExpandCollapse(index)}
                >
                  <img
                    alt=""
                    src={
                      !includes(expandCollapse, index)
                        ? 'static/ic_keyboard_arrow_down_24px.png'
                        : 'static/ic_keyboard_arrow_up_24px.png'
                    }
                  />
                </button>
              </div>
            </div>
            <ul
              key={`ulalpha${key}-${index}`}
              className={classnames('list-group', {
                hide: !includes(expandCollapse, index)
              })}
              id={`alpha-chid${index}`}
            >
              {map(data[key].children, child => {
                const id = !isArrayOptions ? child[category.valueField] : child;
                const name = !isArrayOptions
                  ? child[category.labelField]
                  : child;
                return (
                  <li
                    className="list-group-item"
                    key={`li${category.type}${id}`}
                  >
                    <div
                      className="form-group"
                      key={`divchk${category.type}${id}`}
                    >
                      {!flagSingleSelect && (
                        <input
                          key={`chk${category.type}${id}`}
                          checked={includes(selectedValues, id)}
                          type="checkbox"
                          name={`${category.type}-${id}`}
                          value={id}
                          onChange={() => null}
                        />
                      )}
                      {flagSingleSelect && (
                        <input
                          key={`chk${category.type}${id}`}
                          checked={includes(selectedValues, id)}
                          type="radio"
                          name={category.type}
                          value={id}
                          onChange={() => null}
                        />
                      )}
                      <label
                        key={`lbl${category.type}${id}`}
                        onClick={() => handleFilters(name, id)}
                      >
                        {name}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderRadioboxes = () => {
    const { data } = category;
    const selectedValue = filters[category.type];
    return (
      <div className="alphabetical-filter">
        <div className="any-order">
          <div className="form-group">
            <input
              checked={!filters[category.type]}
              onChange={() => null}
              type="checkbox"
            />
            <label onClick={() => resetFilterCategory(category.type)}>
              {labels[category.type].any}
            </label>
          </div>
        </div>
        <div>
          <ul className="list-group">
            {map(data, id => {
              return (
                <li className="list-group-item" key={`li${category.type}${id}`}>
                  <div className="form-group">
                    <input
                      checked={selectedValue?.value === id}
                      type="radio"
                      key={`option${category.type}-${id}`}
                      name={category.type}
                      value={id}
                      onChange={() => null}
                    />
                    <label
                      className="radioLabel"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          [category.type]: { label: id, value: id }
                        })
                      }
                    >
                      {id}
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  const filterKeys = filter(
    keys(filters),
    row => row !== 'search' && row !== 'timespan' && row !== 'filterKey'
  );

  const renderSelectedValues = () => {
    return map(filterKeys, key => {
      let values;
      if (Array.isArray(filters[key])) {
        values = map(filters[key], 'label');
      } else {
        values = [filters[key].label];
      }
      saveFilter({ [key]: values });
      return (
        <div className="sub-category" key={`selected-div${key}`}>
          <span>
            <strong>{labels[key]?.selected}:</strong> {values.join(', ')}
          </span>
          <button
            type="button"
            className="pointer"
            onClick={() => resetFilterCategory(key)}
            key={`selected-btn${key}`}
          >
            <img
              alt=""
              className="clear-image"
              src="static/ic_clear_24px.png"
            />
          </button>
        </div>
      );
    });
  };

  const totalSelected = () => {
    let count = 0;
    filterKeys.forEach(key => {
      count += Array.isArray(filters[key]) ? filters[key].length : 1;
    });
    return count;
  };

  const resetFilters = () => {
    // @ts-ignore
    saveFilter(null);
    setFilters({});
    setCategory({
      type: defaultCategoryName,
      data: [],
      valueField: 'value',
      labelField: 'label'
    });
    setFiltersVars({ filterKey: defaultCategoryName });
  };

  return (
    <div
      className={classnames('content-panel advanced-filters', {
        'content-panel-error': errorQry !== undefined
      })}
    >
      {errorQry && (
        <div className="alert alert-danger" role="alert">
          {translateText(getGraphQLErrorMessage(errorQry))}
        </div>
      )}
      <div className="row top">
        <div className="col-4 px-0">
          <ul className="accordion__heading">
            <li>
              {isBasic ? (
                <ul className="list-group">
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'taxonomyClass'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'taxonomyClass',
                        data: filterOptions?.taxonomyClass || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Class</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'taxonomyOrder'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'taxonomyOrder',
                        data: filterOptions?.taxonomyOrder || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Order</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'taxonomyFamily'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'taxonomyFamily',
                        data: filterOptions?.taxonomyFamily || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Family</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'taxonomyGenus'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'taxonomyGenus',
                        data: filterOptions?.taxonomyGenus || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Genus</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'taxonomySpecies'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'taxonomySpecies',
                        data: filterOptions?.taxonomySpecies || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Species</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'deployments'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'deployments',
                        data: filterOptions?.deployments || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Camera Deployment</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'subprojects'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'subprojects',
                        data: filterOptions?.subprojects || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Subprojects</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'featureTypes'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'featureTypes',
                        data: filterOptions?.featureTypes || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Feature types</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'baitType'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'baitType',
                        data: filterOptions?.baitType || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Bait types</span>
                  </li>
                </ul>
              ) : (
                <ul className="list-group">
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'iucnStatus'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'iucnStatus',
                        data: filterOptions?.iucnStatus || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">IUCN Red list status</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'taxonomyCommonName'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'taxonomyCommonName',
                        data: filterOptions?.taxonomyCommonName || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Common name</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'sensorStatus'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'sensorStatus',
                        data: filterOptions?.sensorStatus || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Camera status</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'sensorHeight'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'sensorHeight',
                        data: filterOptions?.sensorHeight || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Camera height</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'sensorOrientation'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'sensorOrientation',
                        data: filterOptions?.sensorOrientation || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Camera angle</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'devices'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'devices',
                        data: filterOptions?.devices || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Cameras</span>
                  </li>
                  <li
                    role="presentation"
                    className={classnames('list-group-item', {
                      active: category.type === 'locations'
                    })}
                    onClick={() =>
                      setCategory({
                        type: 'locations',
                        data: filterOptions?.locations || [],
                        valueField: 'value',
                        labelField: 'label'
                      })
                    }
                  >
                    <span className="child-item">Locations</span>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
        <div className="col-4 sl sr px-0 colCheckbox">
          <div className="input-group mb-3">
            <TextFilter
              key={`search${category.type}`}
              id="searchKey"
              placeholder="Search"
              onChange={val =>
                setFiltersVars({
                  ...filtersVars,
                  searchKey: val
                })
              }
            />
          </div>
          {!loadingQry && (
            <div>
              {!flagSingleSelect ? renderCheckboxes() : renderRadioboxes()}
            </div>
          )}
          {loadingQry && (
            <div>
              <LoadingSpinner />
            </div>
          )}
        </div>
        <div className="col-4 px-0 colSelected">
          <div className="top-info-header">
            <span className="selected-status">{totalSelected()} Selected</span>
            <button
              type="button"
              className="pointer"
              onClick={() => resetFilters()}
            >
              <span
                className={classnames('clear-all', {
                  disabled: filterKeys?.length === 0
                })}
              >
                Clear all
              </span>
            </button>
          </div>
          <div className="selected-filters">{renderSelectedValues()}</div>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  saveFilter: data => {
    dispatch(actions.setFilters(data));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(React.memo(AdvanceFiltersModal));
