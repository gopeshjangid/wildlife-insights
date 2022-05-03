import React, { Fragment, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import classnames from 'classnames';

import { getConcernedEntity, translateText } from 'utils/functions';
import { Filter } from '../index';

import taxonomiesQuery from './taxonomies.graphql';
import entityTaxonomiesQuery from './entity-taxonomies.graphql';

const getTaxonomyOption = ({ taxonomy, fromEntity, useCommonNames }) => ({
  label: (
    <Fragment>
      {fromEntity && (
        <span className="badge badge-pill badge-primary align-top mr-1">
          Top
        </span>
      )}
      <span className={classnames({ 'font-weight-bold': fromEntity })}>
        {useCommonNames ? taxonomy.commonNameEnglish : taxonomy.scientificName}
      </span>
      <div className="font-italic">
        {useCommonNames ? taxonomy.scientificName : taxonomy.commonNameEnglish}
      </div>
    </Fragment>
  ),
  textLabel: useCommonNames
    ? taxonomy.commonNameEnglish || taxonomy.scientificName
    : taxonomy.scientificName || taxonomy.commonNameEnglish,
  value: taxonomy.uniqueIdentifier
});

const TaxonomyFilter = ({
  useCommonNames,
  organizationId,
  initiativeId,
  projectId,
  selected,
  formatOptions,
  onChange,
  projectType,
  tab,
  label,
  isMulti,
  labelRenderer
}) => {
  const [search, setSearch] = useState('');
  const [taxonomies, setTaxonomies] = useState([]);
  const [entityTaxonomies, setEntityTaxonomies] = useState([]);

  const entity = useMemo(
    () => getConcernedEntity(organizationId, initiativeId, projectId),
    [organizationId, initiativeId, projectId]
  );

  const options = useMemo(() => {
    const entityTaxonomiesOptions = entityTaxonomies
      .filter(entityTaxonomy =>
        taxonomies.find(
          taxonomy =>
            entityTaxonomy.uniqueIdentifier === taxonomy.uniqueIdentifier
        )
      )
      .map(taxonomy =>
        getTaxonomyOption({
          taxonomy,
          fromEntity: true,
          useCommonNames
        })
      );

    const taxonomiesOptions = taxonomies
      .filter(
        taxonomy =>
          !entityTaxonomies.find(
            entityTaxonomy =>
              entityTaxonomy.uniqueIdentifier === taxonomy.uniqueIdentifier
          )
      )
      .map(taxonomy =>
        getTaxonomyOption({
          taxonomy,
          fromEntity: false,
          useCommonNames
        })
      );

    return entityTaxonomiesOptions.concat(taxonomiesOptions);
  }, [taxonomies, entityTaxonomies, useCommonNames]);

  const { data: taxonomiesData, loading: taxonomiesLoading } = useQuery(
    taxonomiesQuery,
    {
      variables: {
        entityType: entity?.type,
        entityId: entity?.id,
        isSequence: projectType === 'sequence',
        identifiedByExpertFlag: tab === 'catalogued',
        search,
        sort: [
          {
            column: useCommonNames ? 'commonNameEnglish' : 'scientificName',
            order: 'ASC'
          }
        ]
      }
    }
  );

  const {
    data: entityTaxonomiesData,
    loading: entityTaxonomiesLoading
  } = useQuery(entityTaxonomiesQuery, {
    skip: !entity,
    variables: {
      entityType: entity?.type,
      entityId: entity?.id,
      search,
      sort: [
        {
          column: useCommonNames ? 'commonNameEnglish' : 'scientificName',
          order: 'ASC'
        }
      ]
    }
  });

  useEffect(() => {
    if (!taxonomiesLoading && taxonomiesData?.getTaxonomies?.data) {
      setTaxonomies(taxonomiesData.getTaxonomies.data);
    }
  }, [taxonomiesData, taxonomiesLoading, setTaxonomies]);

  useEffect(() => {
    if (
      !entityTaxonomiesLoading &&
      entityTaxonomiesData?.getTaxonomiesForEntity?.data
    ) {
      setEntityTaxonomies(entityTaxonomiesData.getTaxonomiesForEntity.data);
    }
  }, [entityTaxonomiesData, entityTaxonomiesLoading, setEntityTaxonomies]);

  return (
    <Filter
      async
      label={translateText(label || 'Taxonomies')}
      isLoading={taxonomiesLoading || entityTaxonomiesLoading}
      options={formatOptions(selected, options)}
      selected={selected}
      pageSize={50} // Small lie: between 50 and 55 results are actually shown
      onChange={onChange}
      onInputChange={setSearch}
      isMulti={!!isMulti}
      labelRenderer={labelRenderer}
    />
  );
};

TaxonomyFilter.propTypes = {
  useCommonNames: PropTypes.bool,
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  formatOptions: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  projectType: PropTypes.string,
  tab: PropTypes.string,
  label: PropTypes.string
};

TaxonomyFilter.defaultProps = {
  useCommonNames: null,
  organizationId: null,
  initiativeId: null,
  projectId: null,
  projectType: null,
  tab: null
};

export default TaxonomyFilter;
