import { parseFilters } from './helpers';

describe('parseFilters', () => {
  test('return correctly the taxonomies', () => {
    expect(parseFilters({ taxonomyIds: null })).toEqual({ taxonomyIds: null });
    expect(parseFilters({ taxonomyIds: undefined })).toEqual({ taxonomyIds: undefined });
    expect(
      parseFilters({
        taxonomyIds: [{ label: 'Snail', value: 'vizzuality' }, { label: 'Snake', value: 'madrid' }],
      })
    ).toEqual({ taxonomyIds: ['vizzuality', 'madrid'] });
  });
});
