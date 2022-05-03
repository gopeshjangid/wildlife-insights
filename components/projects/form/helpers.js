import { omit, isNumber } from 'lodash';
import { exists } from 'utils/functions';
import { PERMISSIONS } from 'modules/user/helpers';
import { GQL_DEFAULT, MAX_EMBARGO } from 'utils/app-constants';
import { getCountryFromIso } from 'utils/country-codes';
import { getAuthApolloClient } from 'lib/initApollo';

import taxonomiesQuery from './taxonomies.graphql';
import taxonomiesByUUIDsQuery from './taxonomies-by-uuids.graphql';

/**
 * Return the initial values of the form
 * @param {Object} project Project object from the API
 */
export const getFormInitialValues = (project) => {
  if (!project) {
    return {};
  }

  const metadata = project.metadata ? {} : null;
  if (metadata) {
    // Attributes that correspond to an option in a list
    const optionAttributes = [
      'project_species',
      'project_individual_animals',
      'project_sensor_layout',
      'project_sensor_cluster',
      'project_sensor_method',
      'project_blank_images',
      'project_bait_use',
      'project_bait_type',
      'project_stratification',
    ];

    // Attributes that are copied without any change
    const stringAttributes = [
      'project_sensor_layout_targeted_type',
      'project_stratification_type',
      'project_admin',
      'project_admin_email',
    ];

    optionAttributes.forEach((property) => {
      if (Object.keys(project.metadata).indexOf(property) !== -1) {
        if (!exists(project.metadata[property])) {
          metadata[property] = null;
        } else {
          metadata[property] = {
            label: project.metadata[property],
            value: project.metadata[property],
          };
        }
      }
    });

    stringAttributes.forEach((property) => {
      if (Object.keys(project.metadata).indexOf(property) !== -1) {
        metadata[property] = project.metadata[property];
      }
    });

    if (Object.keys(project.metadata).indexOf('project_species_individual') !== -1) {
      if (!exists(project.metadata.project_species_individual)) {
        metadata.project_species_individual = [];
      } else {
        metadata.project_species_individual = project.metadata.project_species_individual
          .split(' ')
          .filter(sp => sp.length > 0)
          .map(sp => ({ label: null, value: sp }));
      }
    }

    if (Object.keys(project.metadata).indexOf('country_code') !== -1) {
      if (!exists(project.metadata.country_code)) {
        metadata.country_code = null;
      } else {
        metadata.country_code = {
          label: getCountryFromIso(project.metadata.country_code),
          value: project.metadata.country_code,
        };
      }
    }
  }

  const initiatives = [];
  if (project?.initiatives) {
    (project?.initiatives).forEach((row) => {
      initiatives.push({
        label: row.name,
        value: +row.id
      });
    });
  }

  return {
    ...project,
    initiatives,
    metadataLicense: project?.metadataLicense
      ? { label: project.metadataLicense, value: project.metadataLicense }
      : null,
    dataFilesLicense: project?.dataFilesLicense
      ? { label: project.dataFilesLicense, value: project.dataFilesLicense }
      : null,
    organizationId: project?.organizationId
      ? { label: project.organization.name, value: project.organization.id }
      : null,
    projectType: project?.projectType
      ? { label: project.projectType, value: project.projectType }
      : null,
    metadata,
  };
};

/**
 * Return whether the embargo value is correct
 * @param {string} value Embargo value from the form
 */
export const isValidEmbargo = value => exists(value) && isNumber(+value) && +value > 0 && +value <= MAX_EMBARGO;

/**
 * Return the serialized values of the form so they can be sent to the API
 * @param {Object<string, any>} values Values of the form
 */
export const serializeBody = (values) => {
  const body = omit(values, [
    'id',
    '__typename',
    'organization',
    'organizationId',
    'initiatives',
    'initiativeIds',
    'metadataLicense',
    'dataFilesLicense',
    'embargoConfirmation',
    'embargoDate',
    'projectType'
  ]);

  if (values.metadata) {
    body.metadata = { ...values.metadata };
  }
  if (values.initiatives) {
    body.initiativeIds = values.initiatives.map(row => +row.value);
  }
  body.metadataLicense = exists(values.metadataLicense) ? values.metadataLicense.value : null;
  body.dataFilesLicense = exists(values.dataFilesLicense) ? values.dataFilesLicense.value : null;
  body.projectType = exists(values.projectType) ? values.projectType.value : null;
  // Do not send the embargo field if its value is 0 or falsy
  body.embargo = isValidEmbargo(values.embargo) ? +values.embargo : null;
  [
    'project_species',
    'project_individual_animals',
    'project_sensor_layout',
    'project_sensor_cluster',
    'project_sensor_method',
    'project_blank_images',
    'project_bait_use',
    'project_bait_type',
    'project_stratification',
    'country_code',
  ].forEach((field) => {
    if (values?.metadata?.[field]) {
      body.metadata[field] = values.metadata[field].value;
    }
  });

  // eslint-disable-next-line camelcase
  if (values?.metadata?.project_species_individual) {
    body.metadata.project_species_individual = values.metadata.project_species_individual
      .map(op => op.value)
      .join(' ');
  }

  return body;
};

/**
 * Return the options of the initiatives the user can attach the project to
 * @param {object} permissions Permissions of the logged in user
 * @param {Array<object>} initiativesData Array of initiatives
 */
export const getInitiativesOptions = (permissions, initiativesData) => initiativesData
  .filter(
    initiative => !!permissions.initiatives[initiative.id]
      && permissions.initiatives[initiative.id].permissions.indexOf(
        PERMISSIONS.PROJECT_ADD_TO_INITIATIVE
      ) !== -1
  )
  .map(initiative => ({ label: initiative.name, value: +initiative.id }));

/**
 * Return the options of the organization the user can attach the project to
 * @param {object} permissions Permissions of the logged in user
 * @param {Array<object>} organizationsData Array of organizations
 */
export const getOrganizationsOptions = (permissions, organizationsData) => organizationsData
  .filter(
    organization => !!permissions.organizations[organization.id]
      && permissions.organizations[organization.id].permissions.indexOf(
        PERMISSIONS.PROJECT_ADD_TO_ORGANIZATION
      ) !== -1
  )
  .map(organization => ({ label: organization.name, value: +organization.id }));

/**
 * Return the name of a taxonomy as a combination of scientific and common name
 * @param {{ scientificName?: string, commonNameEnglish?: string}} taxonomy Taxonomy
 * @param {boolean} useCommonNames Whether to display common names first instead of scientific ones
 */
export const getTaxonomyName = (taxonomy, useCommonNames) => {
  let result = '';

  if (useCommonNames) {
    if (taxonomy.commonNameEnglish) {
      result = taxonomy.commonNameEnglish;

      if (taxonomy.scientificName) {
        result = `${result} - ${taxonomy.scientificName}`;
      }
    } else {
      result = taxonomy.scientificName;
    }
    return result;
  }

  if (taxonomy.scientificName) {
    result = taxonomy.scientificName;

    if (taxonomy.commonNameEnglish) {
      result = `${result} - ${taxonomy.commonNameEnglish}`;
    }
  } else {
    result = taxonomy.commonNameEnglish;
  }

  return result;
};

/**
 * Return the taxonomy options corresponding to the UUIDs
 * @param {string[]} UUIDs Unique identifiers of a taxonomies
 * @param {boolean} useCommonNames Whether to display common names first instead of scientific ones
 */
export const getTaxonomyOptionsFromUUIDs = (UUIDs, useCommonNames) => {
  if (!UUIDs.length) {
    return [];
  }

  const client = getAuthApolloClient(GQL_DEFAULT);
  try {
    return client
      .query({
        query: taxonomiesByUUIDsQuery,
        variables: {
          taxonomyUUIDs: UUIDs,
        },
      })
      .then(({ data: { getTaxonomies: { data } } }) => data.map(result => ({
        label: getTaxonomyName(result, useCommonNames),
        value: result.uniqueIdentifier,
      })));
  } catch (e) {
    return Promise.resolve(
      UUIDs.map(UUID => ({
        label: UUID,
        value: UUID,
      }))
    );
  }
};

/**
 * Return the list of taxonomy options for the search
 * @param {string} search Searched terms
 * @param {boolean} useCommonNames Whether to display common names first instead of scientific ones
 */
export const getTaxonomiesSearchResults = (search, useCommonNames) => {
  const client = getAuthApolloClient(GQL_DEFAULT);
  return client
    .query({
      query: taxonomiesQuery,
      variables: {
        search,
        sort: [
          {
            column: useCommonNames ? 'commonNameEnglish' : 'scientificName',
            order: 'ASC',
          },
        ],
      },
    })
    .then(({ data: { getTaxonomies: { data } } }) => data.map(result => ({
      label: getTaxonomyName(result, useCommonNames),
      value: result.uniqueIdentifier,
    })));
};
