import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { omit, uniq } from 'lodash';

import { exists } from 'utils/functions';
import { Link } from 'lib/routes';
import Tooltip from 'components/tooltip';
import Identification from 'components/images/preview-modal/sidebar/identify-tab/identification';
import { MAX_ANIMAL_COUNT } from 'components/images/preview-modal/sidebar/identify-tab/constants';
import { setTaxonomyIdsToSessionStorage } from 'utils/storage-helpers';
import './style.scss';

class IdentificationTooltip extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    selectedImageGroups: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
    ).isRequired,
    organizationId: PropTypes.string,
    initiativeId: PropTypes.string,
    projectId: PropTypes.string,
    tab: PropTypes.string,
    setSelectedImageGroups: PropTypes.func.isRequired,
    createBulkIdentification: PropTypes.func.isRequired,
    createSequenceBulkIdentification: PropTypes.func.isRequired,
    displaySuccess: PropTypes.func.isRequired,
    displayWarning: PropTypes.func.isRequired,
    displayError: PropTypes.func.isRequired,
    isSequenceProject: PropTypes.bool.isRequired,
    idForTaxonomyLookup: PropTypes.number
  };

  static defaultProps = {
    organizationId: null,
    initiativeId: null,
    projectId: null,
    tab: null,
    idForTaxonomyLookup: null
  };

  state = {
    identification: { blankYn: false, identifiedObjects: [{ id: 0 }] },
  };

  onClickMarkAsBlank = () => {
    const {
      selectedImageGroups,
      createBulkIdentification,
      createSequenceBulkIdentification,
      setSelectedImageGroups,
      displayError,
      isSequenceProject
    } = this.props;

    // creating identifications for image or sequence project are nearly similar, except for:
    // type of entity(dataFileIds or sequenceIds), entityIds(id of dataFiles or sequences)
    let entityIdsKey = 'dataFileIds';
    let createMethod = createBulkIdentification;
    let entityIds;
    if (isSequenceProject) {
      entityIdsKey = 'sequenceIds';
      entityIds = uniq(selectedImageGroups
        .reduce((res, group) => [...res, ...group], [])
        .map(({ sequenceId }) => +sequenceId));
      createMethod = createSequenceBulkIdentification;
    } else {
      entityIds = selectedImageGroups
        .reduce((res, group) => [...res, ...group], [])
        .map(({ id }) => +id);
    }

    const body = {
      [entityIdsKey]: entityIds,
      identificationOutput: {
        blankYn: true,
        identificationMethodId: 1,
        identifiedObjects: [],
      },
    };

    createMethod({ variables: { body } })
      .then(() => {
        this.displaySuccessNotification();
        setSelectedImageGroups([]);
      })
      .catch(() => {
        displayError({
          title: 'Unable to mark the photos as blank',
          message: 'Please try again in a few minutes.',
        });
      });
  };

  onClickSave = () => {
    const {
      selectedImageGroups,
      createBulkIdentification,
      createSequenceBulkIdentification,
      setSelectedImageGroups,
      displayWarning,
      displayError,
      isSequenceProject,
      idForTaxonomyLookup
    } = this.props;

    const { identification } = this.state;

    if (
      identification.identifiedObjects.some(
        identifiedObject => identifiedObject.taxonomyId === null
          || identifiedObject.taxonomyId === undefined,
      )
    ) {
      displayWarning({
        title: 'Empty identification',
        message: 'You must select a family, genus or species for each of the cards.',
      });
      return;
    }

    const totalAnimalCount = identification.identifiedObjects.map((identifiedObject) => {
      return identifiedObject.count ? identifiedObject.count : 0;
    }).reduce((total, cur) => {
      return total + cur;
    }, 0);

    if (totalAnimalCount > MAX_ANIMAL_COUNT) {
      displayWarning({
        title: `Not more than ${MAX_ANIMAL_COUNT} identified objects allowed`,
        message: `Identified objects should be less than ${MAX_ANIMAL_COUNT}.`,
      });
      return;
    }

    // creating identifications for image or sequence project are nearly similar, except for:
    // type of entity(dataFileIds or sequenceIds), entityIds(id of dataFiles or sequences)
    let entityIdsKey = 'dataFileIds';
    let createMethod = createBulkIdentification;
    let entityIds;
    if (isSequenceProject) {
      entityIdsKey = 'sequenceIds';
      entityIds = uniq(selectedImageGroups
        .reduce((res, group) => [...res, ...group], [])
        .map(({ sequenceId }) => +sequenceId));
      createMethod = createSequenceBulkIdentification;
    } else {
      entityIds = selectedImageGroups
        .reduce((res, group) => [...res, ...group], [])
        .map(({ id }) => +id);
    }

    const body = {
      [entityIdsKey]: entityIds,
      identificationOutput: {
        blankYn: false,
        identificationMethodId: 1,
        // Some attributes of the object are only used by the UI
        // or by react-apollo and should not be sent
        identifiedObjects: identification.identifiedObjects.map(
          o => omit(o, ['id', 'taxonomy', '__typename']),
        ),
      },
    };

    createMethod({ variables: { body } })
      .then(() => {
        this.displaySuccessNotification();
        setSelectedImageGroups([]);

        // save most recent ids per project in browser storage
        if (idForTaxonomyLookup) {
          const uniqueTaxonomies = {};
          identification.identifiedObjects.map(item => {
            uniqueTaxonomies[item.taxonomyId] = {
              ...item.taxonomy,
              uniqueIdentifier: item.taxonomyId
            };
          });
          setTaxonomyIdsToSessionStorage([idForTaxonomyLookup], uniqueTaxonomies);
        }
      })
      .catch(() => {
        displayError({
          title: 'Unable to save the identification',
          message: 'Please try again in a few minutes.',
        });
      });
  };

  onClickAddAnimal = () => {
    const { identification } = this.state;
    this.setState({
      identification: Object.assign({}, identification, {
        // In case it was blank before (main case 3)
        blankYn: false,
        identifiedObjects: [
          ...identification.identifiedObjects,
          // The ID is just used by React as a key
          { id: identification.identifiedObjects.length },
        ],
      }),
    });
  };

  onChangeIdentifiedObject = (index, newIdentification) => {
    const { identification } = this.state;
    const { identifiedObjects } = identification;

    const newIdentifiedObjects = [
      ...identifiedObjects.slice(0, index),
      Object.assign(
        {},
        identifiedObjects[index],
        newIdentification.identifiedObjects[0],
      ),
      ...(index + 1 < identifiedObjects.length
        ? identifiedObjects.slice(index + 1, identifiedObjects.length)
        : []),
    ];

    this.setState({
      identification: Object.assign({}, identification, {
        identifiedObjects: newIdentifiedObjects,
      }),
    });
  };

  onRemoveIdentifiedObject = (index) => {
    const { identification } = this.state;
    const newIdentifiedObjects = [...identification.identifiedObjects];
    newIdentifiedObjects.splice(index, 1);

    this.setState({
      identification: Object.assign({}, identification, {
        identifiedObjects: newIdentifiedObjects,
      }),
    });
  };

  displaySuccessNotification() {
    const { tab, organizationId, initiativeId, projectId, displaySuccess } = this.props;

    /**
     * Truth table:
     *
     *  organizationId | initiativeId | projectId | ROUTE
     *  ---------------|--------------|-----------|------
     *  0              | 0            | 0         | overview
     *  0              | 0            | 1         | X
     *  0              | 1            | 0         | initiatives_show
     *  0              | 1            | 1         | X
     *  1              | 0            | 0         | organizations_show
     *  1              | 0            | 1         | projects_show
     *  1              | 1            | 0         | X
     *  1              | 1            | 1         | projects_initiative_show
     */

    let route = null;
    if (!exists(organizationId) && !exists(initiativeId) && !exists(projectId)) {
      route = 'overview';
    } else if (!exists(organizationId) && exists(initiativeId) && !exists(projectId)) {
      route = 'initiatives_show';
    } else if (exists(organizationId) && !exists(initiativeId) && !exists(projectId)) {
      route = 'organizations_show';
    } else if (exists(organizationId) && !exists(initiativeId) && exists(projectId)) {
      route = 'projects_show';
    } else if (exists(organizationId) && exists(initiativeId) && exists(projectId)) {
      route = 'projects_initiative_show';
    }

    displaySuccess({
      children: tab !== 'catalogued'
        ? (
          <span className="notification-title">
            Photos moved to{' '}
            <Link route={route} params={{ tab: 'catalogued', organizationId, initiativeId, projectId }}>
              <a>Catalogued</a>
            </Link>
          </span>
        )
        : (
          <span className="notification-title">
            Photos updated
          </span>
        )
    });
  }

  render() {
    const { children, idForTaxonomyLookup } = this.props;
    const { identification } = this.state;

    return (
      <Tooltip
        distance={10}
        placement="top"
        content={
          (
            <div className="c-identification-tooltip">
              <div className="scroll-container">
                {identification.identifiedObjects.map((
                  identifiedObject,
                  index,
                ) => (
                  <Identification
                    key={identifiedObject.id}
                    identification={Object.assign({}, identification, {
                      identifiedObjects: [identifiedObject],
                    })}
                    canRemove={index > 0}
                    onChange={ident => this.onChangeIdentifiedObject(index, ident)}
                    onRemove={() => this.onRemoveIdentifiedObject(index)}
                    idForTaxonomyLookup={idForTaxonomyLookup}
                  />
                ))}
                <div className="mt-md-4 text-center">
                  <button
                    type="button"
                    className="btn btn-secondary mb-2"
                    onClick={this.onClickAddAnimal}
                  >
                    Add animal
                  </button>
                </div>
              </div>
              <div className="fixed-container mt-3">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={this.onClickMarkAsBlank}
                >
                  Mark as blank
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.onClickSave}
                >
                  Save changes
                </button>
              </div>
            </div>
          )
        }
      >
        {children}
      </Tooltip>
    );
  }
}

export default IdentificationTooltip;
