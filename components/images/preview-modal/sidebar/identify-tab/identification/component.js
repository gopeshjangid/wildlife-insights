import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown, faTrash } from '@fortawesome/free-solid-svg-icons';

import { exists, formatDate as format } from 'utils/functions';
import { getTaxonomyIdsFromSessionStorage } from 'utils/storage-helpers';
import { MAX_ANIMAL_COUNT } from '../constants';
import isEmptyTaxonomy, { getAuthorName } from './helpers';
import IdentificationItem from './identification-item';
import query from './taxonomies.graphql';
import './style.scss';

const formatDate = str => format(str, 'MM/dd/yyyy HH:mm:ss');

const sexOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Unknown', value: 'unknown' },
];

const ageOptions = [
  { label: 'Adult', value: 'adult' },
  { label: 'Juvenile', value: 'juvenile' },
  { label: 'Unknown', value: 'unknown' },
];

class Identification extends PureComponent {
  static propTypes = {
    // IdentificationOutput object from the API
    identification: PropTypes.objectOf(PropTypes.any).isRequired,
    readOnly: PropTypes.bool,
    // Which attributes to display in read only mode
    attributes: PropTypes.arrayOf(PropTypes.string),
    idForTaxonomyLookup: PropTypes.number,
    projectType: PropTypes.string,
    useCommonNames: PropTypes.bool.isRequired,
    canRemove: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    onClick: PropTypes.func,
    disableCount: PropTypes.bool.isRequired
  }

  static defaultProps = {
    readOnly: false,
    attributes: [
      'author',
      'date',
      'class',
      'order',
      'family',
      'genus',
      'species',
      'blank',
      'age',
      'sex',
      'markings',
      'behavior',
      'remarks',
      'confidence',
      'identifiedObjCount'
    ],
    idForTaxonomyLookup: null,
    projectType: null,
    onChange: () => { },
    onRemove: () => { },
    onClick: () => { },
  }

  state = {
    // Current value of the taxonomy search input
    search: '',
    // Whether all the fields are shown when editing
    expanded: false,
    recentTaxonomyIds: this.props.idForTaxonomyLookup
      ? getTaxonomyIdsFromSessionStorage(this.props.idForTaxonomyLookup)
      : []
  }

  /**
   * Event handler executed when the user selects a suggestion
   * from the taxonomy search input
   * @param {string} taxonomyId UUID of the taxonomy
   * @param {Array<object>} taxonomies List of the taxonomy results
   */
  onSelectSuggestion = (taxonomyId, taxonomies) => {
    const taxonomy = taxonomies.find(d => d.uniqueIdentifier === taxonomyId);

    if (!taxonomy) {
      return;
    }

    this.setState({ search: '' });

    this.onChangeIdentificationItem({
      taxonomyId: taxonomy.uniqueIdentifier,
      taxonomy: {
        class: taxonomy.class,
        order: taxonomy.order,
        family: taxonomy.family,
        genus: taxonomy.genus,
        species: taxonomy.species,
        commonNameEnglish: taxonomy.commonNameEnglish,
        scientificName: taxonomy.scientificName
      },
    });
  }

  onChangeIdentificationItem = (object) => {
    const {
      identification,
      identification: { identifiedObjects },
      onChange,
    } = this.props;

    onChange(
      Object.assign({}, identification, {
        identifiedObjects: [Object.assign({}, identifiedObjects[0], object)],
      })
    );
  }

  render() {
    const {
      readOnly,
      attributes,
      identification,
      projectType,
      useCommonNames,
      canRemove,
      onRemove,
      disableCount,
    } = this.props;
    const { search, expanded, recentTaxonomyIds } = this.state;
    const isSequenceProject = projectType === 'sequence';

    // When readOnly is true, several animals may be displayed
    // in the same card
    if (readOnly) {
      const idIconLabel = identification?.idIconLabel;
      const classes = `c-identification container-fluid ${idIconLabel ? 'with-id-label' : ''}`;

      const Wrapper = ({ children }) => <div className={classes}>{children}</div>;
      const { mlIdentification } = identification.identificationMethod;

      return (
        <Wrapper>
          {idIconLabel && (
            <div className="id-label-holder">
              <div className="common-name-label solid-badge">
                {idIconLabel}
              </div>
            </div>
          )}
          {attributes.indexOf('author') !== -1 && (
            <IdentificationItem
              readOnly
              label="Author"
              type="text"
              value={getAuthorName(identification)}
            />
          )}
          {attributes.indexOf('date') !== -1 && (
            <IdentificationItem
              readOnly
              label="ID date"
              type="text"
              value={formatDate(new Date(identification.timestamp))}
            />
          )}
          {attributes.indexOf('blank') !== -1 && identification.blankYn && (
            <IdentificationItem
              readOnly
              label="Blank"
              type="checkbox"
              value={identification.blankYn}
            />
          )}
          {!identification.blankYn && (
            <Fragment>
              {identification.identifiedObjects.map((identifiedObject, index) => {
                let displayCommonName = false;
                if (
                  useCommonNames
                  && identifiedObject.taxonomy
                  && identifiedObject.taxonomy.commonNameEnglish
                ) {
                  displayCommonName = true;
                }

                return (
                  <Fragment key={identifiedObject.id}>
                    {attributes.indexOf('class') !== -1 && !displayCommonName && (
                      <IdentificationItem
                        readOnly
                        renderEmptyValue={mlIdentification}
                        label="Class"
                        type="text"
                        value={identifiedObject.taxonomy && identifiedObject.taxonomy.class}
                      />
                    )}
                    {attributes.indexOf('order') !== -1 && !displayCommonName && (
                      <IdentificationItem
                        readOnly
                        renderEmptyValue={mlIdentification}
                        label="Order"
                        type="text"
                        value={identifiedObject.taxonomy && identifiedObject.taxonomy.order}
                      />
                    )}
                    {attributes.indexOf('family') !== -1 && !displayCommonName && (
                      <IdentificationItem
                        readOnly
                        renderEmptyValue={mlIdentification}
                        label="Family"
                        type="text"
                        value={identifiedObject.taxonomy && identifiedObject.taxonomy.family}
                      />
                    )}
                    {attributes.indexOf('genus') !== -1 && !displayCommonName && (
                      <IdentificationItem
                        readOnly
                        renderEmptyValue={mlIdentification}
                        label="Genus"
                        type="text"
                        value={identifiedObject.taxonomy && identifiedObject.taxonomy.genus}
                      />
                    )}
                    {attributes.indexOf('species') !== -1 && !displayCommonName && (
                      <IdentificationItem
                        readOnly
                        renderEmptyValue={mlIdentification}
                        label="Species"
                        type="text"
                        value={identifiedObject.taxonomy && identifiedObject.taxonomy.species}
                      />
                    )}
                    {attributes.indexOf('species') !== -1 && (displayCommonName || isEmptyTaxonomy(identifiedObject)) && (
                      <IdentificationItem
                        readOnly
                        label="Common name"
                        type="text"
                        value={
                          identifiedObject.taxonomy && identifiedObject.taxonomy.commonNameEnglish
                        }
                      />
                    )}
                    {!disableCount && attributes.indexOf('identifiedObjCount') !== -1 && (
                      <IdentificationItem
                        readOnly
                        label={isSequenceProject ? "Group size" : "Count"}
                        type="number"
                        value={identifiedObject.count}
                      />
                    )}
                    {attributes.indexOf('age') !== -1 && (
                      <IdentificationItem
                        readOnly
                        label="Relative age"
                        type="select"
                        value={identifiedObject.relativeAge}
                        options={ageOptions}
                      />
                    )}
                    {attributes.indexOf('sex') !== -1 && (
                      <IdentificationItem
                        readOnly
                        label="Sex"
                        type="select"
                        value={identifiedObject.sex}
                        options={sexOptions}
                      />
                    )}
                    {attributes.indexOf('markings') !== -1 && (
                      <IdentificationItem
                        readOnly
                        label="Markings"
                        type="text"
                        value={identifiedObject.markings}
                      />
                    )}
                    {/* 
                      label for behavior field changed to "Individual ID", 
                      but there is no individualID api key yet 
                    */}
                    {attributes.indexOf('behavior') !== -1 && (
                      <IdentificationItem
                        readOnly
                        label="Individual ID"
                        type="text"
                        value={identifiedObject.behavior}
                      />
                    )}
                    {attributes.indexOf('remarks') !== -1 && (
                      <IdentificationItem
                        readOnly
                        label="Remarks"
                        type="text"
                        value={identifiedObject.remarks}
                      />
                    )}
                    {index + 1 < identification.identifiedObjects.length && (
                      <div className="separator" />
                    )}
                  </Fragment>
                );
              })}
              {attributes.indexOf('confidence') !== -1
                && (identification.identificationMethod
                  && identification.identificationMethod.mlIdentification)
                && exists(identification.confidence) && (
                  <IdentificationItem
                    readOnly
                    label="Confidence"
                    type="text"
                    value={
                      identification.confidence[0] === identification.confidence[1]
                        ? `${identification.confidence[0] === null
                          ? '–'
                          : `${Math.round(identification.confidence[0] * 100)}%`
                        }`
                        : `${Math.round(identification.confidence[0] * 100)}% - ${Math.round(
                          identification.confidence[1] * 100
                        )}%`
                    }
                  />
                )}
            </Fragment>
          )}
          {!isSequenceProject && attributes.indexOf('appliedTo') !== -1
            && !mlIdentification && (
              <IdentificationItem
                readOnly
                label=""
                type="text"
                value={`Applied to ${identification.dataFileCount} images`}
              />
            )
          }
          {
            /*
            !isSequenceProject && attributes.indexOf('count') !== -1 && (
              <IdentificationItem
                readOnly
                label="Present in"
                type="text"
                value={`
                  ${identification.count || 0} photo${identification.count && identification.count > 1 ? 's' : ''}
                `}
              />
            )
            */
          }
        </Wrapper>
      );
    }

    // When readOnly is false, each animal is displayed in a separate card
    // Each card gets one IdentifiedObject of the IdentificationOutput object
    // (see the API)

    let displayCommonName = false;
    if (
      useCommonNames
      && identification.identifiedObjects[0].taxonomy
      && identification.identifiedObjects[0].taxonomy.commonNameEnglish
    ) {
      displayCommonName = true;
    }

    return (
      <div className="c-identification containter-fluid mb-3">
        <Query query={query} variables={{ search }}>
          {({ loading, error, data }) => {
            const { getTaxonomies } = data || { getTaxonomies: { data: [] } };

            let options = [];
            let taxonomiesWithoutRecentIds = [];
            if (!loading && !error) {
              const recentIdsOptions = recentTaxonomyIds.length > 0
                ? [{
                  label: 'RECENT IDS',
                  // @ts-ignore
                  options: recentTaxonomyIds.map(d => ({
                    label: (
                      <Fragment>
                        {displayCommonName ? d.commonNameEnglish : d.scientificName}
                        <div className="font-italic">
                          {displayCommonName ? d.scientificName : d.commonNameEnglish}
                        </div>
                      </Fragment>
                    ),
                    value: d.uniqueIdentifier,
                  })),
                }] : [];

              taxonomiesWithoutRecentIds = getTaxonomies.data.filter(tData => !(
                recentTaxonomyIds.find(rData => (
                  tData.uniqueIdentifier === rData.uniqueIdentifier
                ))
              ));

              options = [
                ...recentIdsOptions,
                {
                  label: 'Class',
                  // @ts-ignore
                  options: taxonomiesWithoutRecentIds
                    .filter(d => d.taxonLevel === 'class')
                    .map(d => ({
                      label: (
                        <Fragment>
                          {displayCommonName ? d.commonNameEnglish : d.scientificName}
                          <div className="font-italic">
                            {displayCommonName ? d.scientificName : d.commonNameEnglish}
                          </div>
                        </Fragment>
                      ),
                      value: d.uniqueIdentifier,
                    })),
                },
                {
                  label: 'Order',
                  // @ts-ignore
                  options: taxonomiesWithoutRecentIds
                    .filter(d => d.taxonLevel === 'order')
                    .map(d => ({
                      label: (
                        <Fragment>
                          {displayCommonName ? d.commonNameEnglish : d.scientificName}
                          <div className="font-italic">
                            {displayCommonName ? d.scientificName : d.commonNameEnglish}
                          </div>
                        </Fragment>
                      ),
                      value: d.uniqueIdentifier,
                    })),
                },
                {
                  label: 'Family',
                  // @ts-ignore
                  options: taxonomiesWithoutRecentIds
                    .filter(d => d.taxonLevel === 'family')
                    .map(d => ({
                      label: (
                        <Fragment>
                          {displayCommonName ? d.commonNameEnglish : d.scientificName}
                          <div className="font-italic">
                            {displayCommonName ? d.scientificName : d.commonNameEnglish}
                          </div>
                        </Fragment>
                      ),
                      value: d.uniqueIdentifier,
                    })),
                },
                {
                  label: 'Genus',
                  // @ts-ignore
                  options: taxonomiesWithoutRecentIds
                    .filter(d => d.taxonLevel === 'genus')
                    .map(d => ({
                      label: (
                        <Fragment>
                          {displayCommonName ? d.commonNameEnglish : d.scientificName}
                          <div className="font-italic">
                            {displayCommonName ? d.scientificName : d.commonNameEnglish}
                          </div>
                        </Fragment>
                      ),
                      value: d.uniqueIdentifier,
                    })),
                },
                {
                  label: 'Species',
                  // @ts-ignore
                  options: taxonomiesWithoutRecentIds
                    .filter(d => d.taxonLevel === 'species' || d.taxonLevel === 'subspecies')
                    .map(d => ({
                      label: (
                        <Fragment>
                          {displayCommonName ? d.commonNameEnglish : d.scientificName}
                          <div className="font-italic">
                            {displayCommonName ? d.scientificName : d.commonNameEnglish}
                          </div>
                        </Fragment>
                      ),
                      value: d.uniqueIdentifier,
                    })),
                },
                {
                  label: 'Other',
                  // @ts-ignore
                  options: taxonomiesWithoutRecentIds
                    .filter(d => d.taxonLevel === 'none')
                    .map(d => ({
                      label: (
                        <Fragment>
                          {displayCommonName ? d.commonNameEnglish : d.scientificName}
                          <div className="font-italic">
                            {displayCommonName ? d.scientificName : d.commonNameEnglish}
                          </div>
                        </Fragment>
                      ),
                      value: d.uniqueIdentifier,
                    })),
                },
              ];
            }

            return (
              <IdentificationItem
                readOnly={false}
                // The label doesn't matter because none is displayed in the UI
                label=""
                type="autocomplete"
                isLoading={loading}
                pageSize={1000}
                filterOption={null}
                value={identification.identifiedObjects[0].taxonomyId}
                options={options}
                onInputChange={val => this.setState({ search: val })}
                onChange={taxonomyId => this.onSelectSuggestion(taxonomyId, loading || error
                  ? [] : [...recentTaxonomyIds, ...taxonomiesWithoutRecentIds])
                }
                controlShouldRenderValue={false}
                placeholder="Search an animal"
              />
            );
          }}
        </Query>
        {!displayCommonName && (
          <IdentificationItem
            readOnly
            label="Class"
            type="text"
            value={
              identification.identifiedObjects[0].taxonomy
              && identification.identifiedObjects[0].taxonomy.class
            }
          />
        )}
        {!displayCommonName && (
          <IdentificationItem
            readOnly
            label="Order"
            type="text"
            value={
              identification.identifiedObjects[0].taxonomy
              && identification.identifiedObjects[0].taxonomy.order
            }
          />
        )}
        {!displayCommonName && (
          <IdentificationItem
            readOnly
            label="Family"
            type="text"
            value={
              identification.identifiedObjects[0].taxonomy
              && identification.identifiedObjects[0].taxonomy.family
            }
          />
        )}
        {!displayCommonName && (
          <IdentificationItem
            readOnly
            label="Genus"
            type="text"
            value={
              identification.identifiedObjects[0].taxonomy
              && identification.identifiedObjects[0].taxonomy.genus
            }
          />
        )}
        {!displayCommonName && (
          <IdentificationItem
            readOnly
            label="Species"
            type="text"
            value={
              identification.identifiedObjects[0].taxonomy
              && identification.identifiedObjects[0].taxonomy.species
            }
          />
        )}
        {(displayCommonName || isEmptyTaxonomy(identification.identifiedObjects[0])) && (
          <IdentificationItem
            readOnly
            label="Common name"
            type="text"
            value={
              identification.identifiedObjects[0].taxonomy
              && identification.identifiedObjects[0].taxonomy.commonNameEnglish
            }
          />
        )}
        {!disableCount
          && (<IdentificationItem
            readOnly={readOnly}
            label={isSequenceProject ? "Group size" : "Count"}
            type="integerinput"
            min={1}
            max={MAX_ANIMAL_COUNT}
            defaultValue={1}
            onChange={count => this.onChangeIdentificationItem({ count: +count })}
            value={identification.identifiedObjects[0].count || ''}
          />)
        }
        {expanded && (
          <Fragment>
            {disableCount
              && (<IdentificationItem
                readOnly={readOnly}
                label={isSequenceProject ? "Group size" : "Count"}
                type="integerinput"
                min={0}
                max={MAX_ANIMAL_COUNT}
                defaultValue=""
                onChange={count => this.onChangeIdentificationItem({ count: +count })}
                value={identification.identifiedObjects[0].count || ''}
              />)
            }
            <IdentificationItem
              readOnly={readOnly}
              label="Relative age"
              type="select"
              options={ageOptions}
              onChange={relativeAge => this.onChangeIdentificationItem({ relativeAge })}
              value={identification.identifiedObjects[0].relativeAge}
            />
            <IdentificationItem
              readOnly={readOnly}
              label="Sex"
              type="select"
              options={sexOptions}
              onChange={sex => this.onChangeIdentificationItem({ sex })}
              value={identification.identifiedObjects[0].sex}
            />
            <IdentificationItem
              readOnly={readOnly}
              label="Markings"
              type="text"
              onChange={markings => this.onChangeIdentificationItem({ markings })}
              value={identification.identifiedObjects[0].markings}
            />
            {/* 
              label for behavior field changed to "Individual ID", 
              but there is no individualID api key yet 
            */}
            <IdentificationItem
              readOnly={readOnly}
              label="Individual ID"
              type="text"
              onChange={behavior => this.onChangeIdentificationItem({ behavior })}
              value={identification.identifiedObjects[0].behavior}
            />
            <IdentificationItem
              readOnly={readOnly}
              label="Remarks"
              type="text"
              onChange={remarks => this.onChangeIdentificationItem({ remarks })}
              value={identification.identifiedObjects[0].remarks}
            />
          </Fragment>
        )}
        {canRemove && (
          <div className="row">
            <div className="col-12 text-center">
              <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={onRemove}>
                <FontAwesomeIcon icon={faTrash} size="sm" title="Remove identification" /> Remove
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className="btn btn-sm btn-primary btn-expand"
          onClick={() => this.setState({ expanded: !expanded })}
        >
          <FontAwesomeIcon
            icon={expanded ? faAngleUp : faAngleDown}
            size="lg"
            title={expanded ? 'Contract' : 'Expand'}
          />
        </button>
      </div>
    );
  }
}

export default Identification;
