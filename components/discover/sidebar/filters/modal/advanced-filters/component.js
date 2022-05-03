import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useQuery } from 'react-apollo-hooks';
import { keys, map, find, remove, includes, omit, filter } from 'lodash';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { getCountryFromIso } from 'utils/country-codes';
import Tooltip from 'components/tooltip';
import { Form, DatePicker } from 'components/form';
import { getPublicApolloClient } from 'lib/initApollo';
import { GQL_PUBLIC_DEFAULT } from 'utils/app-constants';
import {
  translateText,
  getGraphQLErrorMessage,
  parseDate,
  parseLocalTimeZoneDateInUTC,
  parseUTCDateInLocalTimeZone
} from 'utils/functions';
import { FORMAT } from 'components/form/datepicker';
import { TextFilter } from 'components/filters';
import LoadingSpinner from 'components/loading-spinner';
import { convertObjectToAlphaGrp, convertArrayToAlphaGrp, parseFilters } from './helpers';
import getAdvancedDiscoverFiltersQuery from './get-advanced-discover-filters.graphql';
import './style.scss';

const AdvanceFiltersModal = ({
  open,
  onClose,
  advFilters,
  setAdvFilters,
  onChangeFilters,
  basicSelection,
  disableBasicFilter,
  minDate,
  maxDate,
  currentStartDate,
  currentEndDate
}) => {
  const defaultCategoryName = 'taxonomyOrder';
  const singleSelectKeys = ['sensorMethod', 'sensorCluster', 'embargo', 'blankImages'];
  const taxonomiesKeys = ['taxonomyClass', 'taxonomyOrder', 'taxonomyFamily', 'taxonomyGenus', 'taxonomySpecies'];
  const allExpandableKeys = ['imageLicense', 'metadataLicense', 'sensorLayout', 'featureTypes', 'baitUse', 'baitType'];
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
    metadataLicense: { selected: 'Metadata Licenses', any: 'Any metadata license' },
    embargo: { selected: 'Active Embargo', any: 'All' },
    blankImages: { selected: 'Include Blank Images', any: 'All' },
    continents: { selected: 'Continent', any: 'Any continent' },
    initiatives: { selected: 'Initiative', any: 'Any initiative' },
    organizations: { selected: 'Organization', any: 'Any organization' },
    baitUse: { selected: 'Bait use', any: 'Any bait use' },
    baitType: { selected: 'Bait type', any: 'Any bait type' },
    imageLicense: { selected: 'Image License', any: 'All' },
  };
  let initialVars = {};
  if (!disableBasicFilter) {
    if (basicSelection.project?.value) {
      initialVars.projects = [basicSelection.project];
    }
    if (basicSelection.timespan) {
      initialVars.timespan = {
        start: currentStartDate,
        end: currentEndDate
      };
    }
    if (basicSelection.country) {
      initialVars.countries = {
        label: getCountryFromIso(basicSelection.country),
        value: basicSelection.country,
      }
    }
    if (basicSelection.taxonomies && basicSelection.taxonomies.length > 0) {
      const species = [];
      basicSelection.taxonomies.forEach((element) => {
        species.push({
          label: element.label,
          value: element.label,
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
  const [category, setCategory] = useState({ type: defaultCategoryName, data: filters?.taxonomyOrder || [], valueField: 'value', labelField: 'label' });
  const [filtersVars, setFiltersVars] = useState(parseFilters(initialVars, defaultCategoryName));
  const [expandCollapse, setExpandCollapse] = useState([]);
  const flagSingleSelect = includes(singleSelectKeys, category.type);
  // @ts-ignore
  const { data: dataQry, loading: loadingQry, error: errorQry } = useQuery(getAdvancedDiscoverFiltersQuery, {
    variables: filtersVars,
    client: publicClient,
  });
  const arrayOptions = ['featureTypes', 'sensorMethod', 'sensorLayout', 'sensorCluster', 'metadataLicense', 'embargo', 'blankImages', 'baitUse', 'baitType', 'imageLicense', 'taxonomyCommonName', 'continents'];
  const isArrayOptions = includes(arrayOptions, category.type);

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

  const countryFilterOptions = paramCountries => paramCountries.map(
    value => ({ label: getCountryFromIso(value), value })
  );

  const getTaxonomyOption = paramTaxData => paramTaxData.map(value => ({ label: value, value }));

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

  const resetFilterCategory = (type) => {
    let newFilter = { ...filters };
    // @ts-ignore
    newFilter = omit(newFilter, [type]);
    // @ts-ignore
    newFilter.filterKey = category.type;
    setFilters(newFilter);
    setFiltersVars(parseFilters(newFilter, defaultCategoryName));
  };

  const handleFilters = (label, value) => {
    const filters_new = filters;
    if (!flagSingleSelect) {
      if (!filters_new[category.type]) {
        filters_new[category.type] = [{
          label,
          value,
        }];
      } else {
        const flagExist = find(filters_new[category.type], (row) => {
          return row.value === value;
        });
        if (!flagExist) {
          filters_new[category.type].push({
            label,
            value,
          });
        } else {
          remove(filters_new[category.type], (row) => {
            return row.value === value;
          });
        }
      }
    } else {
      filters_new[category.type] = [{
        label,
        value,
      }];
    }
    if (filters_new[category.type].length > 0) {
      setFilters({ ...filters_new, [category.type]: filters_new[category.type] });
    } else {
      // @ts-ignore
      setFilters(omit(filters_new, category.type));
    }
  };

  const handleExpandCollapse = (index) => {
    setExpandCollapse((prevState) => {
      const tmpValue = [...prevState];
      if (!includes(tmpValue, index)) {
        tmpValue.push(index);
      } else {
        remove(tmpValue, (val) => { return val === index; });
      }
      return tmpValue;
    });
  };

  const renderCheckboxes = () => {
    const data = !isArrayOptions ? convertObjectToAlphaGrp(category.data, category.labelField)
      : convertArrayToAlphaGrp(category.data);
    const dataKeys = keys(data).sort();
    const selectedValues = map(filters[category.type], 'value');
    return (
      <div className="alphabetical-filter">
        <div className="any-order">
          <div className="form-group">
            <input checked={!filters[category.type]} type="checkbox" onChange={() => null} />
            <label onClick={() => resetFilterCategory(category.type)}>{labels[category.type].any}</label>
          </div>
        </div>
        {
          map(dataKeys, (key, index) => (
            <div key={`divalpha${key}-${index}`}>
              <div className="alphabet d-flex justify-content-between">
                <div>
                  <span>{key}</span>
                  <span className="alpha-count">({data[key].children.length})</span>
                </div>
                <div>
                  <button type="button" className="pointer" onClick={() => handleExpandCollapse(index)}>
                    <img alt="" src={!includes(expandCollapse, index) ? 'static/ic_keyboard_arrow_down_24px.png' : 'static/ic_keyboard_arrow_up_24px.png'} />
                  </button>
                </div>
              </div>
              <ul key={`ulalpha${key}-${index}`} className={classnames('list-group', { hide: !includes(expandCollapse, index) })} id={`alpha-chid${index}`}>
                {
                  map(data[key].children, (child) => {
                    const id = !isArrayOptions ? child[category.valueField] : child;
                    const name = !isArrayOptions ? child[category.labelField] : child;
                    return (
                      <li className="list-group-item" key={`li${category.type}${id}`}>
                        <div className="form-group" key={`divchk${category.type}${id}`}>
                          {!flagSingleSelect
                            && <input key={`chk${category.type}${id}`} checked={includes(selectedValues, id)} type="checkbox" name={`${category.type}-${id}`} value={id} onChange={() => null} />
                          }
                          {flagSingleSelect
                            && <input key={`chk${category.type}${id}`} checked={includes(selectedValues, id)} type="radio" name={category.type} value={id} onChange={() => null} />
                          }
                          <label key={`lbl${category.type}${id}`} onClick={() => handleFilters(name, id)}>{name}</label>
                        </div>
                      </li>
                    );
                  })
                }
              </ul>
            </div>
          ))
        }
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
            <input checked={!filters[category.type]} onChange={() => null} type="checkbox" />
            <label onClick={() => resetFilterCategory(category.type)}>{labels[category.type].any}</label>
          </div>
        </div>
        <div>
          <ul className="list-group">
            {
              map(data, (child) => {
                const id = child;
                const name = child;
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
                        onClick={() => setFilters({
                          ...filters,
                          [category.type]: { label: name, value: id },
                        })
                        }
                      >
                        {name}
                      </label>
                    </div>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  };

  const apply = () => {
    setAdvFilters(filters);
    // @ts-ignore
    onChangeFilters(omit(parseFilters(filters, defaultCategoryName), ['filterKey']));
    onClose();
  };

  const filterKeys = filter(keys(filters), row => row !== 'search' && row !== 'timespan' && row !== 'filterKey');

  const renderSelectedValues = () => {
    return map(filterKeys, (key) => {
      let values;
      if (Array.isArray(filters[key])) {
        values = map(filters[key], 'label');
      } else {
        values = [filters[key].label];
      }
      return (
        <div className="sub-category" key={`selected-div${key}`}>
          <span>
            <strong>{labels[key]?.selected}:</strong> {values.join(', ')}
          </span>
          <button type="button" className="pointer" onClick={() => resetFilterCategory(key)} key={`selected-btn${key}`}>
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
    filterKeys.forEach((key) => {
      count += Array.isArray(filters[key]) ? filters[key].length : 1;
    });
    return count;
  };

  const currentStartDate1 = filters?.timespan?.start
    ? parseUTCDateInLocalTimeZone(filters.timespan.start)
    : currentStartDate;
  const currentEndDate1 = filters?.timespan?.end
    ? parseUTCDateInLocalTimeZone(filters.timespan.end)
    : currentEndDate;

  const setTimespan = (val, filterKey) => {
    const newFilters = { ...filters };
    newFilters.timespan = newFilters.timespan || {
      start: currentStartDate1,
      end: currentEndDate1,
    };
    newFilters.timespan[filterKey] = parseLocalTimeZoneDateInUTC(
      parseDate(val, FORMAT)
    ).toISOString();
    setFilters(newFilters);
  };

  const resetFilters = () => {
    // @ts-ignore
    setFilters({});
    setCategory({ type: defaultCategoryName, data: [], valueField: 'value', labelField: 'label' });
    setFiltersVars({ filterKey: defaultCategoryName });
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-adv-filters-modal"
      contentLabel={translateText('Advanced filters')}
      ariaHideApp={false}
    >
      <div className={classnames('content-panel advanced-filters', { 'content-panel-error': errorQry !== undefined })}>
        <div className="advanced-filters-header d-flex justify-content-between">
          <div className="d-flex">
            <h2>Advanced filters</h2>
            <Tooltip trigger="click" placement="right" content={<span>Customize your search by applying advanced filters. Choose a category or date range in the left panel and select options from within that category in the middle panel. The right panel will show all filters selected. Click Apply to update the page with your filters.</span>}>
              <button type="button" className="btn btn-link m-0 p-0 icon-info-title">
                <FontAwesomeIcon icon={faInfoCircle} size="sm" />
              </button>
            </Tooltip>
          </div>
          <button type="button" className="pointer" onClick={onClose}>
            <img
              className="close-image"
              alt=""
              src="/static/ic_close_14px.png"
            />
          </button>
        </div>
        {errorQry && (
          <div className="alert alert-danger" role="alert">
            {translateText(
              getGraphQLErrorMessage(errorQry)
            )}
          </div>
        )}
        <div className="row top">
          <div className="col-4 px-0">
            <div className="date-range">
              <Form>
                <div className="start-date">
                  <span>From</span>
                  <DatePicker
                    wrapperClassName="date-range"
                    id="start-date-adv"
                    field="start"
                    after={minDate}
                    before={maxDate}
                    value={currentStartDate1}
                    onChange={val => setTimespan(val, 'start')}
                  />
                </div>
                <div className="end-date">
                  <span>To</span>
                  <DatePicker
                    wrapperClassName="date-range"
                    id="end-date-adv"
                    field="end"
                    after={minDate}
                    before={maxDate}
                    value={currentEndDate1}
                    onChange={val => setTimespan(val, 'end')}
                  />
                </div>
              </Form>
            </div>
            <ul className="accordion__heading">
              <li>
                <span className="taxonomy">Taxonomies</span>
                <ul className="list-group">
                  <li role="presentation" className={classnames('list-group-item', { active: category.type === 'taxonomyClass' })} onClick={() => setCategory({ type: 'taxonomyClass', data: filterOptions?.taxonomyClass || [], valueField: 'value', labelField: 'label' })}>
                    <span className="child-item">Class</span>
                  </li>
                  <li role="presentation" className={classnames('list-group-item', { active: category.type === 'taxonomyOrder' })} onClick={() => setCategory({ type: 'taxonomyOrder', data: filterOptions?.taxonomyOrder || [], valueField: 'value', labelField: 'label' })}>
                    <span className="child-item">Order</span>
                  </li>
                  <li role="presentation" className={classnames('list-group-item', { active: category.type === 'taxonomyFamily' })} onClick={() => setCategory({ type: 'taxonomyFamily', data: filterOptions?.taxonomyFamily || [], valueField: 'value', labelField: 'label' })}>
                    <span className="child-item">Family</span>
                  </li>
                  <li role="presentation" className={classnames('list-group-item', { active: category.type === 'taxonomyGenus' })} onClick={() => setCategory({ type: 'taxonomyGenus', data: filterOptions?.taxonomyGenus || [], valueField: 'value', labelField: 'label' })}>
                    <span className="child-item">Genus</span>
                  </li>
                  <li role="presentation" className={classnames('list-group-item', { active: category.type === 'taxonomySpecies' })} onClick={() => setCategory({ type: 'taxonomySpecies', data: filterOptions?.taxonomySpecies || [], valueField: 'value', labelField: 'label' })}>
                    <span className="child-item">Species</span>
                  </li>
                  <li role="presentation" className={classnames('list-group-item', { active: category.type === 'taxonomyCommonName' })} onClick={() => setCategory({ type: 'taxonomyCommonName', data: [], valueField: 'id', labelField: 'name' })}>
                    <span className="child-item">Common name</span>
                  </li>
                </ul>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'continents' })} onClick={() => setCategory({ type: 'continents', data: filterOptions?.continent || [] })}>
                <span>Continent</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'countries' })} onClick={() => setCategory({ type: 'countries', data: filterOptions?.countries || [], valueField: 'value', labelField: 'label' })}>
                <span>Country</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'initiatives' })} onClick={() => setCategory({ type: 'initiatives', data: filterOptions?.initiatives || [], valueField: 'id', labelField: 'name' })}>
                <span>Initiative</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'organizations' })} onClick={() => setCategory({ type: 'organizations', data: filterOptions?.organizations || [], valueField: 'id', labelField: 'name' })}>
                <span>Organization</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'baitUse' })} onClick={() => setCategory({ type: 'baitUse', data: filterOptions?.baitUse || [] })}>
                <span>Bait use</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'baitType' })} onClick={() => setCategory({ type: 'baitType', data: filterOptions?.baitType || [] })}>
                <span>Bait type</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'projects' })} onClick={() => setCategory({ type: 'projects', data: filterOptions?.projects || [], valueField: 'id', labelField: 'shortName' })}>
                <span>Project</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'featureTypes' })} onClick={() => setCategory({ type: 'featureTypes', data: filterOptions?.featureTypes || [] })}>
                <span>Feature Types</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'sensorMethod' })} onClick={() => setCategory({ type: 'sensorMethod', data: filterOptions?.sensorMethod || [] })}>
                <span>Sensor Method</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'sensorLayout' })} onClick={() => setCategory({ type: 'sensorLayout', data: filterOptions?.sensorLayout || [] })}>
                <span>Sensor Layouts</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'sensorCluster' })} onClick={() => setCategory({ type: 'sensorCluster', data: filterOptions?.sensorCluster || [] })}>
                <span>Sensor Clusters</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'metadataLicense' })} onClick={() => setCategory({ type: 'metadataLicense', data: filterOptions?.metadataLicense || [] })}>
                <span>Metadata Licenses</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'imageLicense' })} onClick={() => setCategory({ type: 'imageLicense', data: filterOptions?.imageLicense || [] })}>
                <span>Image License</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'embargo' })} onClick={() => setCategory({ type: 'embargo', data: filterOptions?.embargo || [] })}>
                <span>Active Embargo</span>
              </li>
              <li role="presentation" className={classnames('list-group-item', { active: category.type === 'blankImages' })} onClick={() => setCategory({ type: 'blankImages', data: filterOptions?.blankImages || [] })}>
                <span>Include records of blank images</span>
              </li>
            </ul>
          </div>
          <div className="col-4 sl sr px-0 colCheckbox">
            <div className="input-group mb-3">
              <TextFilter
                key={`search${category.type}`}
                id="searchKey"
                placeholder="Search"
                onChange={val => setFiltersVars({
                  ...filtersVars,
                  searchKey: val,
                })}
              />
            </div>
            {!loadingQry
              && (
                <div>
                  {!flagSingleSelect ? renderCheckboxes() : renderRadioboxes()}
                </div>
              )
            }
            {loadingQry
              && (
                <div>
                  <LoadingSpinner />
                </div>
              )
            }
          </div>
          <div className="col-4 px-0 colSelected">
            <div className="top-info-header">
              <span className="selected-status">{totalSelected()} Selected</span>
              <button type="button" className="pointer" onClick={() => resetFilters()}>
                <span className={classnames('clear-all', { disabled: filterKeys?.length === 0 })}>Clear all</span>
              </button>
            </div>
            <div className="selected-filters">
              {renderSelectedValues()}
            </div>
          </div>
        </div>
        <button type="button" className="btn-apply btn btn-primary btn-lg" onClick={apply}>
          Apply
        </button>
      </div>
    </ReactModal>
  );
};

AdvanceFiltersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  setAdvFilters: PropTypes.func.isRequired,
  onChangeFilters: PropTypes.func.isRequired,
  basicSelection: PropTypes.objectOf(PropTypes.object).isRequired,
  advFilters: PropTypes.objectOf(PropTypes.object).isRequired,
  disableBasicFilter: PropTypes.bool.isRequired,
  minDate: PropTypes.instanceOf(Date).isRequired,
  maxDate: PropTypes.instanceOf(Date).isRequired,
  currentStartDate: PropTypes.instanceOf(Date).isRequired,
  currentEndDate: PropTypes.instanceOf(Date).isRequired,
};

AdvanceFiltersModal.defaultProps = {
  onClose: () => { },
};

export default AdvanceFiltersModal;
