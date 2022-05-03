import {
  getConfirmedIdentification,
  containsHuman,
  HUMAN_TAXONOMY_GENUS
} from './helpers';

describe('getConfirmedIdentification', () => {
  test('returns nothing if no identification', () => {
    expect(getConfirmedIdentification([])).toBe(null);
  });

  test('returns the only identification', () => {
    const identification = { id: 'identification' };
    expect(getConfirmedIdentification([identification])).toBe(identification);
  });

  test('returns most recent identification', () => {
    const oldIdentifiation = { id: 'old identification', timestamp: '2019-10-14T20:42:03.679Z' };
    const newIdentification = { id: 'new identification', timestamp: '2019-10-15T10:47:14.765Z' };
    expect(getConfirmedIdentification([oldIdentifiation, newIdentification])).toBe(
      newIdentification
    );
    expect(getConfirmedIdentification([newIdentification, oldIdentifiation])).toBe(
      newIdentification
    );
  });
});

describe('containsHuman', () => {
  test('returns false if identification does not contain identified objects', () => {
    expect(containsHuman({ identifiedObjects: [] })).toBe(false);
    expect(containsHuman({ identifiedObjects: [{}] })).toBe(false);
  });

  test('returns true if identification contains human', () => {
    expect(
      containsHuman({ identifiedObjects: [{ taxonomy: { genus: HUMAN_TAXONOMY_GENUS } }] })
    ).toBe(true);
    expect(
      containsHuman({
        identifiedObjects: [
          { taxonomy: { genus: 'hello' } },
          { taxonomy: { genus: HUMAN_TAXONOMY_GENUS } },
        ],
      })
    ).toBe(true);
  });

  test('returns false if identification does not contain human', () => {
    expect(containsHuman({ identifiedObjects: [{ taxonomy: { genus: 'hello' } }] })).toBe(false);
  });
});
