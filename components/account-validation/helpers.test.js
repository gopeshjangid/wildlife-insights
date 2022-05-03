import {
  getApproveMutationData,
  getRejectMutationData,
  didApproveMutationPerformAllChanges,
  didRejectMutationPerformAllChanges,
} from './helpers';

describe('getApproveMutationData', () => {
  test('returns the correct data', () => {
    expect(getApproveMutationData({ users: [] })).toEqual([]);
    expect(getApproveMutationData({
      users: [
        {
          id: 1,
          approve: true
        },
        {
          id: 2,
          approve: false
        },
        {
          id: 3,
        },
      ]
    })).toEqual([
      {
        participantId: 1,
        whitelisted: true
      }
    ]);
  });
});

describe('getRejectMutationData', () => {
  test('returns the correct data', () => {
    expect(getRejectMutationData({ users: [] })).toEqual([]);
    expect(getRejectMutationData({
      users: [
        {
          id: 1,
          reject: true
        },
        {
          id: 2,
          reject: false
        },
        {
          id: 3,
        },
      ]
    })).toEqual([1]);
  });
});

describe('didApproveMutationPerformAllChanges', () => {
  test('returns correct result', () => {
    expect(didApproveMutationPerformAllChanges(
      [],
      { successfulOperationsCount: 0 }
    )).toEqual(true);
    expect(didApproveMutationPerformAllChanges(
      [
        {
          participantId: 1,
          whitelisted: true,
        }
      ],
      { successfulOperationsCount: 1 }
    )).toEqual(true);
    expect(didApproveMutationPerformAllChanges(
      [
        {
          participantId: 1,
          whitelisted: true,
        }
      ],
      { successfulOperationsCount: 0 }
    )).toEqual(false);
  });
});


describe('didRejectMutationPerformAllChanges', () => {
  test('returns correct result', () => {
    expect(didRejectMutationPerformAllChanges(
      [],
      []
    )).toEqual(true);
    expect(didRejectMutationPerformAllChanges(
      [1],
      [
        {
          deleted: true,
        }
      ]
    )).toEqual(true);
    expect(didRejectMutationPerformAllChanges(
      [1],
      [
        {
          deleted: false,
        }
      ]
    )).toEqual(false);
    expect(didRejectMutationPerformAllChanges(
      [1],
      []
    )).toEqual(false);
  });
});
