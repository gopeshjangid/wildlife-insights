import { parseUserPermissions, can, isAdminUser } from './helpers';

/* eslint-disable */
const PARTICIPANT_DATA_RES = {
  data: {
    getParticipantData: {
      organizationRoles: [
        {
          organization: {
            id: '1',
            name: 'Organization 1',
            __typename: 'Organization',
          },
          role: {
            id: 4,
            name: 'ORGANIZATION_OWNER',
            permissions: [
              {
                id: 1,
                slug: 'organization.create',
                __typename: 'Permissions',
              },
              {
                id: 2,
                slug: 'organization.update',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'OrganizationRole',
        },
        {
          organization: {
            id: '2',
            name: 'Organization 2',
            __typename: 'Organization',
          },
          role: {
            id: 4,
            name: 'ORGANIZATION_EDITOR',
            permissions: [
              {
                id: 1,
                slug: 'organization.create',
                __typename: 'Permissions',
              },
              {
                id: 2,
                slug: 'organization.update',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'OrganizationRole',
        },
        {
          organization: {
            id: '3',
            name: 'Organization 3',
            __typename: 'Organization',
          },
          role: {
            id: 4,
            name: 'ORGANIZATION_VIEWER',
            permissions: [
              {
                id: 1,
                slug: 'organization.create',
                __typename: 'Permissions',
              },
              {
                id: 2,
                slug: 'organization.update',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'OrganizationRole',
        },
      ],
      initiativeRoles: [
        {
          initiative: {
            id: '1',
            name: 'Initiative 1',
            __typename: 'Initiative',
          },
          role: {
            id: 7,
            name: 'INITIATIVE_OWNER',
            permissions: [
              {
                id: 1,
                slug: 'initiative.invite_user_as_viewer',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'InitiativeRole',
        },
        {
          initiative: {
            id: '2',
            name: 'Initiative 2',
            __typename: 'Initiative',
          },
          role: {
            id: 7,
            name: 'INITIATIVE_EDITOR',
            __typename: 'Role',
            permissions: [
              {
                id: 1,
                slug: 'initiative.invite_user_as_editor',
                __typename: 'Permissions',
              },
            ],
          },
          __typename: 'InitiativeRole',
        },
        {
          initiative: {
            id: '3',
            name: 'Initiative 3',
            __typename: 'Initiative',
          },
          role: {
            id: 7,
            name: 'INITIATIVE_VIEWER',
            permissions: [
              {
                id: 1,
                slug: 'initiative.invite_user_as_owner',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'InitiativeRole',
        },
      ],
      projectRoles: [
        {
          project: {
            id: '1',
            name: 'Project 1',
            __typename: 'Project',
          },
          role: {
            id: 7,
            name: 'PROJECT_OWNER',
            permissions: [
              {
                id: 1,
                slug: 'project.update',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'ProjectRole',
        },
        {
          project: {
            id: '2',
            name: 'Project 2',
            __typename: 'Project',
          },
          role: {
            id: 7,
            name: 'PROJECT_EDITOR',
            permissions: [
              {
                id: 1,
                slug: 'project.delete',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'ProjectRole',
        },
        {
          project: {
            id: '3',
            name: 'Project 3',
            __typename: 'Project',
          },
          role: {
            id: 7,
            name: 'PROJECT_VIEWER',
            permissions: [
              {
                id: 1,
                slug: 'project.get_one',
                __typename: 'Permissions',
              },
            ],
            __typename: 'Role',
          },
          __typename: 'ProjectRole',
        },
      ],
      __typename: 'ParticipantEntities',
    },
  },
  loading: false,
  networkStatus: 7,
  stale: false,
}
/* eslint-enable */

describe('parseUserPermissions', () => {
  const data = PARTICIPANT_DATA_RES.data.getParticipantData;

  test('returns correct result when no access to a type of entity', () => {
    expect(parseUserPermissions({ ...data, organizationRoles: [] })).toHaveProperty(
      'organizations',
      {}
    );
    expect(parseUserPermissions({ ...data, initiativeRoles: [] })).toHaveProperty('initiatives', {});
    expect(parseUserPermissions({ ...data, projectRoles: [] })).toHaveProperty('projects', {});
  });

  test('returns correct result', () => {
    expect(parseUserPermissions(data)).toHaveProperty('organizations', {
      1: {
        role: 'ORGANIZATION_OWNER',
        permissions: ['organization.create', 'organization.update'],
      },
      2: {
        role: 'ORGANIZATION_EDITOR',
        permissions: ['organization.create', 'organization.update'],
      },
      3: {
        role: 'ORGANIZATION_VIEWER',
        permissions: ['organization.create', 'organization.update'],
      },
    });
    expect(parseUserPermissions(data)).toHaveProperty('initiatives', {
      1: { role: 'INITIATIVE_OWNER', permissions: ['initiative.invite_user_as_viewer'] },
      2: { role: 'INITIATIVE_EDITOR', permissions: ['initiative.invite_user_as_editor'] },
      3: { role: 'INITIATIVE_VIEWER', permissions: ['initiative.invite_user_as_owner'] },
    });
    expect(parseUserPermissions(data)).toHaveProperty('projects', {
      1: { role: 'PROJECT_OWNER', permissions: ['project.update'] },
      2: { role: 'PROJECT_EDITOR', permissions: ['project.delete'] },
      3: { role: 'PROJECT_VIEWER', permissions: ['project.get_one'] },
    });
  });
});

describe('can', () => {
  const permissions = parseUserPermissions(PARTICIPANT_DATA_RES.data.getParticipantData);

  const permissionsToCheck = [
    'organization.create',
    'organization.update',
    'initiative.invite_user_as_viewer',
    'initiative.invite_user_as_editor',
    'initiative.invite_user_as_owner',
    'project.update',
    'project.delete',
    'project.get_one',
    'non.existing',
  ];

  const results = {
    organization: [
      [true, true, false, false, false, false, false, false, false],
      [true, true, false, false, false, false, false, false, false],
      [true, true, false, false, false, false, false, false, false],
    ],
    initiative: [
      [false, false, true, false, false, false, false, false, false],
      [false, false, false, true, false, false, false, false, false],
      [false, false, false, false, true, false, false, false, false],
    ],
    project: [
      [false, false, false, false, false, true, false, false, false],
      [false, false, false, false, false, false, true, false, false],
      [false, false, false, false, false, false, false, true, false],
    ],
    'non-existing': [
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false, false],
    ],
  };

  Object.keys(results).forEach((entityType) => {
    test(`returns correct results for ${
      entityType !== 'non-existing' ? entityType : 'non existing entity type'
    }`, () => {
      Array.from({ length: results[entityType].length }, (_, i) => i + 1).forEach((entityId) => {
        permissionsToCheck.forEach((permission, permissionId) => {
          expect(can(permissions, entityType, entityId, permission)).toEqual(
            results[entityType][entityId - 1][permissionId]
          );
        });
      });
    });
  });
});

describe('isAdminUser', () => {
  test('return the correct result', () => {
    expect(isAdminUser(null)).toEqual(false);
    expect(isAdminUser(undefined)).toEqual(false);
    expect(isAdminUser({})).toEqual(false);
    expect(isAdminUser({ data: null })).toEqual(false);
    expect(isAdminUser({ data: {} })).toEqual(false);
    expect(isAdminUser({ data: { role: null } })).toEqual(false);
    expect(isAdminUser({ data: { role: {} } })).toEqual(false);
    expect(isAdminUser({ data: { role: { slug: 'PUBLIC' } } })).toEqual(false);
    expect(isAdminUser({ data: { role: { slug: 'PARTICIPANT_ADMIN' } } })).toEqual(true);
  });
})