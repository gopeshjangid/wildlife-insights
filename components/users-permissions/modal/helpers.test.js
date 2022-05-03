import {
  USER_PERMISSIONS,
  getMutationChangeData,
  getFormInitialValues,
  didMutationPerformAllChanges,
  parseUsers,
  getInvitationRoleOptions,
  getRoleOptionsForUser,
  getRoleOptions,
} from './helpers';

describe('getInvitationRoleOptions', () => {
  test("return empty array if user can't invite", () => {
    expect(getInvitationRoleOptions(null)).toEqual([]);
    // @ts-ignore
    expect(getInvitationRoleOptions({})).toEqual([]);
    // @ts-ignore
    expect(getInvitationRoleOptions({ something: true })).toEqual([]);
  });

  test("return reduced options if user can't assign all the roles", () => {
    expect(getInvitationRoleOptions({ viewer: true, editor: false, owner: false })).toEqual([
      ...getRoleOptions().filter(role => role.value === 'viewer'),
    ]);
    expect(getInvitationRoleOptions({ viewer: false, editor: true, owner: false })).toEqual([
      ...getRoleOptions().filter(role => role.value === 'editor'),
    ]);
    expect(getInvitationRoleOptions({ viewer: false, editor: false, owner: true })).toEqual([
      ...getRoleOptions().filter(role => role.value === 'owner'),
    ]);
  });

  test('return everything if user can', () => {
    expect(getInvitationRoleOptions({ viewer: true, editor: true, owner: true, contributor: true, tagger: true })).toEqual(
      getRoleOptions()
    );
  });
});

describe('getRoleOptionsForUser', () => {
  const USER = {
    id: 2,
    firstName: 'John',
    lastName: 'Carter',
    email: 'john.carter@example.com',
    role: 'editor',
    canBeRevoked: true,
    canBeAssignedRole: ['owner', 'editor', 'viewer', 'contributor', 'tagger'],
  };

  test("return empty array if user can't get new role assigned", () => {
    expect(getRoleOptionsForUser({ ...USER, canBeAssignedRole: [] })).toEqual([]);
  });

  test("return reduced options if user can't get assigned all the roles", () => {
    expect(
      getRoleOptionsForUser({
        ...USER,
        canBeAssignedRole: USER.canBeAssignedRole.filter(r => r !== 'owner'),
      })
    ).toEqual([...getRoleOptions().filter(role => role.value !== 'owner')]);
  });

  test('return everything if user can get assigned any role', () => {
    expect(getRoleOptionsForUser(USER)).toEqual(getRoleOptions());
  });
});

describe('getMutationChangeData', () => {
  const USERS = [
    {
      id: 1,
      firstName: 'David',
      lastName: 'Smiths',
      email: 'david.smiths@example.com',
      role: 'owner',
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Carter',
      email: 'john.carter@example.com',
      role: 'editor',
    },
    {
      id: 3,
      firstName: 'Lucy',
      lastName: 'Millrose',
      email: 'lucy.millrose@example.com',
      role: 'viewer',
    },
  ];
  const ENTITY_ID = 1;

  test('return an empty array if no change', () => {
    expect(getMutationChangeData(ENTITY_ID, USERS, getFormInitialValues(USERS))).toEqual([]);
  });

  test('return an empty array is rekove is not true', () => {
    const newUsers = [
      { ...USERS[0], revoke: false },
      { ...USERS[1], revoke: undefined },
      { ...USERS[2], revoke: null },
    ];

    expect(getMutationChangeData(ENTITY_ID, USERS, getFormInitialValues(newUsers))).toEqual([]);
  });

  test('return correct result if roles changed', () => {
    const newUsers = [
      { ...USERS[0], role: 'editor' },
      USERS[1],
      { ...USERS[2], role: 'owner', revoke: undefined },
    ];

    expect(getMutationChangeData(ENTITY_ID, USERS, getFormInitialValues(newUsers))).toEqual(
      [newUsers[0], newUsers[2]].map(newUser => ({
        operation: USER_PERMISSIONS.UPDATE,
        entityId: ENTITY_ID,
        email: newUser.email,
        role: newUser.role,
      }))
    );
  });

  test('return correct result if users revoked', () => {
    const newUsers = [{ ...USERS[0], revoke: true }, USERS[1], { ...USERS[2], revoke: undefined }];

    expect(getMutationChangeData(ENTITY_ID, USERS, getFormInitialValues(newUsers))).toEqual(
      newUsers.slice(0, 1).map(newUser => ({
        operation: newUser.revoke === true ? USER_PERMISSIONS.DELETE : USER_PERMISSIONS.UPDATE,
        entityId: ENTITY_ID,
        email: newUser.email,
        role: newUser.role,
      }))
    );
  });

  test('return correctly update and delete operations at once', () => {
    const users = [...USERS, USERS[0]];
    const newUsers = [
      { ...users[0], role: 'owner', revoke: true },
      { ...users[1], role: 'owner' },
      { ...users[2], role: 'owner', revoke: true },
      users[3],
    ];

    expect(getMutationChangeData(ENTITY_ID, users, getFormInitialValues(newUsers))).toEqual(
      newUsers.slice(0, 3).map(newUser => ({
        operation: newUser.revoke === true ? USER_PERMISSIONS.DELETE : USER_PERMISSIONS.UPDATE,
        entityId: ENTITY_ID,
        email: newUser.email,
        role: newUser.role,
      }))
    );
  });
});

describe('didMutationPerformAllChanges', () => {
  const mutationData = [
    {
      operation: USER_PERMISSIONS.DELETE,
      entityId: 1,
      email: '',
      role: 'owner',
    },
    {
      operation: USER_PERMISSIONS.UPDATE,
      entityId: 2,
      email: '',
      role: 'owner',
    },
    {
      operation: USER_PERMISSIONS.CREATE,
      entityId: 3,
      email: '',
      role: 'owner',
    },
  ];

  test('return true if no change', () => {
    expect(didMutationPerformAllChanges([], { create: 0, update: 0, delete: 0 })).toEqual(true);
    expect(didMutationPerformAllChanges([], { create: null, update: null, delete: null })).toEqual(
      true
    );
  });

  test('return false if one change failed', () => {
    expect(didMutationPerformAllChanges(mutationData, { create: 0, update: 1, delete: 1 })).toEqual(
      false
    );
    expect(didMutationPerformAllChanges(mutationData, { create: 1, update: 0, delete: 1 })).toEqual(
      false
    );
    expect(didMutationPerformAllChanges(mutationData, { create: 1, update: 1, delete: 0 })).toEqual(
      false
    );
    expect(didMutationPerformAllChanges(mutationData, { create: 0, update: 0, delete: 0 })).toEqual(
      false
    );
  });

  test('return true if all the changes succeeded', () => {
    expect(didMutationPerformAllChanges(mutationData, { create: 1, update: 1, delete: 1 })).toEqual(
      true
    );
  });
});

describe('parseUsers', () => {
  const INPUT = [
    {
      participant: {
        id: 1,
        firstName: 'David',
        lastName: 'Smiths',
        email: 'david.smiths@example.com',
      },
      role: {
        id: 4,
        name: 'ORGANIZATION_OWNER',
      },
      canRoleBeRevoked: false,
      roleCanBeChangedTo: [],
      isImplicit: null,
    },
    {
      participant: {
        id: 2,
        firstName: 'John',
        lastName: 'Carter',
        email: 'john.carter@example.com',
      },
      role: {
        id: 2,
        name: 'INITIATIVE_EDITOR',
      },
      canRoleBeRevoked: true,
      roleCanBeChangedTo: [
        {
          id: 1,
          name: 'INITIATIVE_OWNER',
        },
        {
          id: 2,
          name: 'INITIATIVE_EDITOR',
        },
        {
          id: 3,
          name: 'INITIATIVE_VIEWER',
        },
      ],
      isImplicit: false,
    },
    {
      participant: {
        id: 3,
        firstName: 'Lucy',
        lastName: 'Millrose',
        email: 'lucy.millrose@example.com',
      },
      role: {
        id: 2,
        name: 'PROJECT_VIEWER',
      },
      canRoleBeRevoked: true,
      roleCanBeChangedTo: [
        {
          id: 2,
          name: 'PROJECT_VIEWER',
        },
      ],
      isImplicit: true,
    },
  ];

  const OUTPUT = [
    {
      id: 1,
      firstName: 'David',
      lastName: 'Smiths',
      email: 'david.smiths@example.com',
      role: 'owner',
      canBeRevoked: false,
      canBeAssignedRole: [],
      isImplicit: false,
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Carter',
      email: 'john.carter@example.com',
      role: 'editor',
      canBeRevoked: true,
      canBeAssignedRole: ['owner', 'editor', 'viewer'],
      isImplicit: false,
    },
    {
      id: 3,
      firstName: 'Lucy',
      lastName: 'Millrose',
      email: 'lucy.millrose@example.com',
      role: 'viewer',
      canBeRevoked: true,
      canBeAssignedRole: ['viewer'],
      isImplicit: true,
    },
  ];

  test('return correct parsed list', () => {
    expect(parseUsers(INPUT)).toEqual(OUTPUT);
  });
});
