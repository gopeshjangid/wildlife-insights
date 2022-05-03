import omit from 'lodash/omit';

import { PERMISSIONS } from 'modules/user/helpers';
import { getCountryFromIso } from 'utils/country-codes';
import {
  isValidEmbargo,
  serializeBody,
  getInitiativesOptions,
  getOrganizationsOptions,
  getFormInitialValues,
  getTaxonomyName,
} from './helpers';

/* eslint-disable */
const FORM_VALUES = {
  id: '49',
  name: 'staging-Hello you',
  shortName: null,
  abbreviation: null,
  startDate: '2019-01-21',
  endDate: null,
  metadataLicense: {
    label: 'CC0',
    value: 'CC0',
  },
  dataFilesLicense: {
    label: 'CC BY 4.0',
    value: 'CC BY 4.0',
  },
  objectives: null,
  projectUrl: null,
  projectCreditLine: null,
  methodology: null,
  embargo: '10',
  embargoConfirmation: true,
  acknowledgements: null,
  remarks: null,
  deleteDataFilesWithIdentifiedHumans: true,
  organization: {
    id: '1',
    name: 'My first organization 001',
    __typename: 'Organization',
  },
  // initiativeId: 1,
  initiatives: [{
    label: 'Initiative 2',
    value: '2',
  }],
  metadata: {
    project_species: {
      label: 'Individual',
      value: 'Individual',
    },
    project_individual_animals: {
      label: 'Yes',
      value: 'Yes',
    },
    project_sensor_layout: {
      label: 'Randomized',
      value: 'Randomized',
    },
    project_sensor_cluster: {
      label: 'Yes',
      value: 'Yes',
    },
    project_sensor_method: {
      label: 'Both',
      value: 'Both',
    },
    project_blank_images: {
      label: 'Some',
      value: 'Some',
    },
    project_bait_use: {
      label: 'Yes',
      value: 'Yes',
    },
    project_bait_type: {
      label: 'Meat',
      value: 'Meat',
    },
    project_stratification: {
      label: 'Yes',
      value: 'Yes',
    },
    project_sensor_layout_targeted_type: 'Hello',
    project_stratification_type: 'Hello',
    project_admin: 'John',
    project_admin_email: 'john@yahoo.com',
    project_species_individual: [
      {
        label: '56882803-e1e6-44de-9872-178974c56825',
        value: '56882803-e1e6-44de-9872-178974c56825',
      },
      {
        label: '0bef6be8-0abc-48fc-98a1-76b186872585',
        value: '0bef6be8-0abc-48fc-98a1-76b186872585',
      },
      {
        label: 'c862fa19-0789-4ea2-be52-57bd0680309f',
        value: 'c862fa19-0789-4ea2-be52-57bd0680309f',
      },
    ],
    country_code: {
      label: 'France',
      value: 'FRA',
    },
  },
  publicLatitude: '50.9',
  publicLongitude: '-1.6',
  __typename: 'Project',
}
/* eslint-enable */

const METADATA_SELECT_FIELDS = [
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

const METADATA_STRING_FIELDS = [
  'project_sensor_layout_targeted_type',
  'project_stratification_type',
  'project_admin',
  'project_admin_email',
];

describe('getFormInitialValues', () => {
  const PROJECT = {
    id: '1',
    name: 'My first project 001',
    shortName: null,
    abbreviation: null,
    startDate: '2018-10-07',
    endDate: '2019-10-24',
    metadataLicense: 'CC0',
    dataFilesLicense: 'CC0',
    objectives: null,
    projectUrl: 'http://www.vizzuality.com',
    projectCreditLine: 'Cash',
    methodology: 'Manual',
    embargo: null,
    acknowledgements: 'Ack',
    remarks: null,
    deleteDataFilesWithIdentifiedHumans: null,
    organization: { id: '1', name: 'My first organization 001', __typename: 'Organization' },
    initiatives: [{ id: '5', name: 'mm_init_test2', __typename: 'Initiative' }],
    metadata: {
      project_species: 'Individual',
      project_species_individual: 'hello  you there',
      project_individual_animals: 'Yes',
      project_sensor_layout: 'Randomized',
      project_sensor_layout_targeted_type: 'Hello',
      project_sensor_cluster: 'Yes',
      project_sensor_method: 'Both',
      project_blank_images: 'Some',
      project_bait_use: 'Yes',
      project_bait_type: 'Meat',
      project_stratification: 'Yes',
      project_stratification_type: 'Hello',
      country_code: 'FRA',
      project_admin: 'John',
      project_admin_email: 'john@yahoo.com',
    },
    __typename: 'Project',
  };

  test('return nothing if no project', () => {
    expect(getFormInitialValues(undefined)).toEqual({});
    expect(getFormInitialValues(null)).toEqual({});
  });

  test('return correct initiative option', () => {
    expect(getFormInitialValues({})).toHaveProperty('initiatives', []);
    expect(getFormInitialValues({ ...PROJECT, initiatives: null })).toHaveProperty(
      'initiatives',
      []
    );
    expect(getFormInitialValues(PROJECT)).toHaveProperty('initiatives', [{
      label: PROJECT.initiatives[0].name,
      value: +PROJECT.initiatives[0].id,
    }]);
  });

  test('return correct metadata license option', () => {
    expect(getFormInitialValues({})).toHaveProperty('metadataLicense', null);
    expect(getFormInitialValues({ ...PROJECT, metadataLicense: null })).toHaveProperty(
      'metadataLicense',
      null
    );
    expect(getFormInitialValues(PROJECT)).toHaveProperty('metadataLicense', {
      label: PROJECT.metadataLicense,
      value: PROJECT.metadataLicense,
    });
  });

  test('return correct DataFiles license option', () => {
    expect(getFormInitialValues({})).toHaveProperty('dataFilesLicense', null);
    expect(getFormInitialValues({ ...PROJECT, dataFilesLicense: null })).toHaveProperty(
      'dataFilesLicense',
      null
    );
    expect(getFormInitialValues(PROJECT)).toHaveProperty('dataFilesLicense', {
      label: PROJECT.dataFilesLicense,
      value: PROJECT.dataFilesLicense,
    });
  });

  test('return correct metadata', () => {
    expect(getFormInitialValues({})).toHaveProperty('metadata', null);
    expect(getFormInitialValues({ ...PROJECT, metadata: null })).toHaveProperty('metadata', null);
  });

  METADATA_SELECT_FIELDS.forEach((field) => {
    test(`return correct ${field} metadata option`, () => {
      expect(
        getFormInitialValues({ ...PROJECT, metadata: omit(PROJECT.metadata, field) })
      ).not.toHaveProperty(`metadata.${field}`);

      expect(
        getFormInitialValues({ ...PROJECT, metadata: { ...PROJECT.metadata, [field]: null } })
      ).toHaveProperty(`metadata.${field}`, null);

      expect(getFormInitialValues(PROJECT)).toHaveProperty(`metadata.${field}`, {
        label: PROJECT.metadata[field],
        value: PROJECT.metadata[field],
      });
    });
  });

  METADATA_STRING_FIELDS.forEach((field) => {
    expect(
      getFormInitialValues({
        ...PROJECT,
        metadata: omit(PROJECT.metadata, field),
      })
    ).not.toHaveProperty(`metadata.${field}`);

    expect(getFormInitialValues(PROJECT)).toHaveProperty(
      `metadata.${field}`,
      PROJECT.metadata[field]
    );
  });

  test('return correct species individual metadata option', () => {
    expect(
      getFormInitialValues({
        ...PROJECT,
        metadata: omit(PROJECT.metadata, 'project_species_individual'),
      })
    ).not.toHaveProperty('metadata.project_species_individual');

    expect(
      getFormInitialValues({
        ...PROJECT,
        metadata: { ...PROJECT.metadata, project_species_individual: null },
      })
    ).toHaveProperty('metadata.project_species_individual', []);

    expect(getFormInitialValues(PROJECT)).toHaveProperty(
      'metadata.project_species_individual',
      PROJECT.metadata.project_species_individual
        .split(' ')
        .filter(sp => sp.length > 0)
        .map(sp => ({ label: null, value: sp }))
    );
  });

  test('return correct country code metadata', () => {
    expect(
      getFormInitialValues({
        ...PROJECT,
        metadata: omit(PROJECT.metadata, 'country_code'),
      })
    ).not.toHaveProperty('metadata.country_code');

    expect(
      getFormInitialValues({
        ...PROJECT,
        metadata: { ...PROJECT.metadata, country_code: null },
      })
    ).toHaveProperty('metadata.country_code', null);

    expect(getFormInitialValues(PROJECT)).toHaveProperty('metadata.country_code', {
      label: getCountryFromIso(PROJECT.metadata.country_code),
      value: PROJECT.metadata.country_code,
    });
  });
});

describe('isValidEmbargo', () => {
  test('return correct result', () => {
    expect(isValidEmbargo(undefined)).toEqual(false);
    expect(isValidEmbargo(null)).toEqual(false);
    expect(isValidEmbargo('')).toEqual(false);
    expect(isValidEmbargo('hello')).toEqual(false);
    expect(isValidEmbargo('0')).toEqual(false);
    expect(isValidEmbargo('-10')).toEqual(false);
    expect(isValidEmbargo('100')).toEqual(false);
    expect(isValidEmbargo('10')).toEqual(true);
  });
});

describe('serializeBody', () => {
  test("doesn't return non supported attributes", () => {
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('id');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('organizationId');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('organization');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('initiative');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('embargoConfirmation');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('__typename');
  });

  test('returns the licenses correctly', () => {
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('metadataLicense.label');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('metadataLicense.value');

    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('dataFilesLicense.label');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('dataFilesLicense.value');

    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadataLicense',
      FORM_VALUES.metadataLicense.value
    );

    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'dataFilesLicense',
      FORM_VALUES.dataFilesLicense.value
    );
  });

  test('returns the initiativeId correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty('initiativeIds', [+FORM_VALUES.initiatives[0].value]);
    expect(serializeBody({ ...FORM_VALUES, initiatives: null })).not.toHaveProperty('initiatives', []);
    expect(serializeBody({ ...FORM_VALUES, initiatives: undefined })).not.toHaveProperty(
      'initiatives',
      []
    );
  });

  test('returns the embargo correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty('embargo', 10);
    expect(serializeBody({ ...FORM_VALUES, embargo: '0' })).toHaveProperty('embargo', null);
    expect(serializeBody({ ...FORM_VALUES, embargo: 'hello' })).toHaveProperty('embargo', null);
    expect(serializeBody({ ...FORM_VALUES, embargo: null })).toHaveProperty('embargo', null);
    expect(serializeBody({ ...FORM_VALUES, embargo: undefined })).toHaveProperty('embargo', null);
    expect(serializeBody({ ...FORM_VALUES, embargo: '' })).toHaveProperty('embargo', null);
  });

  test('returns the metadata correctly', () => {
    ['country_code', ...METADATA_SELECT_FIELDS].forEach((field) => {
      expect(serializeBody(FORM_VALUES)).not.toHaveProperty(`metadata.${field}.label`);
      expect(serializeBody(FORM_VALUES)).not.toHaveProperty(`metadata.${field}.value`);
      expect(serializeBody(FORM_VALUES)).toHaveProperty(
        `metadata.${field}`,
        FORM_VALUES.metadata[field].value
      );
    });

    METADATA_STRING_FIELDS.forEach(field => expect(serializeBody(FORM_VALUES)).toHaveProperty(
      `metadata.${field}`,
      FORM_VALUES.metadata[field]
    ));

    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadata.project_species_individual',
      FORM_VALUES.metadata.project_species_individual.map(op => op.value).join(' ')
    );
  });

  test('should not return the public coordinates', () => {
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty(
      'publicLatitude',
      +FORM_VALUES.publicLatitude
    );
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty(
      'publicLongitude',
      +FORM_VALUES.publicLongitude
    );

    expect(serializeBody({ ...FORM_VALUES, publicLatitude: '' })).not.toHaveProperty(
      'publicLatitude',
      null
    );
    expect(serializeBody({ ...FORM_VALUES, publicLongitude: '' })).not.toHaveProperty(
      'publicLongitude',
      null
    );
  });
});

describe('initiativesOptions', () => {
  const permissions = {
    initiatives: {
      1: { permissions: [PERMISSIONS.PROJECT_ADD_TO_INITIATIVE] },
      2: { permissions: [] },
    },
  };

  const initiatives = [
    { id: '1', name: 'Initiative 1' },
    { id: '2', name: 'Initiative 2' },
    { id: '3', name: 'Initiative 3' },
  ];

  test("filter out the initiatives which don't allow projects to be attached to", () => {
    expect(getInitiativesOptions(permissions, initiatives)).toEqual([
      {
        label: initiatives[0].name,
        value: +initiatives[0].id,
      },
    ]);
  });
});

describe('organizationsOptions', () => {
  const permissions = {
    organizations: {
      1: { permissions: [PERMISSIONS.PROJECT_ADD_TO_ORGANIZATION] },
      2: { permissions: [] },
    },
  };

  const organizations = [
    { id: '1', name: 'Organization 1' },
    { id: '2', name: 'Organization 2' },
    { id: '3', name: 'Organization 3' },
  ];

  test("filter out the organizations which don't allow projects to be attached to", () => {
    expect(getOrganizationsOptions(permissions, organizations)).toEqual([
      {
        label: organizations[0].name,
        value: +organizations[0].id,
      },
    ]);
  });
});

describe('getTaxonomyName', () => {
  test('return correct result when both scientific and common names are present', () => {
    expect(getTaxonomyName({ scientificName: 'hello', commonNameEnglish: 'world' }, false)).toEqual(
      'hello - world'
    );
    expect(getTaxonomyName({ scientificName: 'hello', commonNameEnglish: 'world' }, true)).toEqual(
      'world - hello'
    );
  });

  test('return correct result when only scientific name is present', () => {
    expect(getTaxonomyName({ scientificName: 'hello' }, false)).toEqual('hello');
    expect(getTaxonomyName({ scientificName: 'hello' }, true)).toEqual('hello');
  });

  test('return correct result when only common name is present', () => {
    expect(getTaxonomyName({ commonNameEnglish: 'hello' }, false)).toEqual('hello');
    expect(getTaxonomyName({ commonNameEnglish: 'hello' }, true)).toEqual('hello');
  });
});
