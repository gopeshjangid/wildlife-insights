import { getTaxonomyOptions, serializeFilter, isFiltering } from './helpers';

describe('getTaxonomyOptions', () => {
  const OPTIONS = [
    {
      label: 'Option 1',
      value: 'option-1',
    },
    {
      label: 'Option 2',
      value: 'option-2',
    },
    {
      label: 'Option 3',
      value: 'option-3',
    },
  ];

  test('return nothing if no options', () => {
    expect(getTaxonomyOptions([], [])).toEqual([
      {
        label: 'Selected',
        options: [],
      },
      {
        label: 'Suggestions',
        options: [],
      },
    ]);

    expect(getTaxonomyOptions([OPTIONS[0]], [])).toEqual([
      {
        label: 'Selected',
        options: [OPTIONS[0]],
      },
      {
        label: 'Suggestions',
        options: [],
      },
    ]);
  });

  test('return correct result if no selected option', () => {
    expect(getTaxonomyOptions([], [OPTIONS[0]])).toEqual([
      {
        label: 'Selected',
        options: [],
      },
      {
        label: 'Suggestions',
        options: [OPTIONS[0]],
      },
    ]);
  });

  test('return correct result if both selected and suggested options', () => {
    expect(getTaxonomyOptions([OPTIONS[0]], [OPTIONS[1]])).toEqual([
      {
        label: 'Selected',
        options: [OPTIONS[0]],
      },
      {
        label: 'Suggestions',
        options: [OPTIONS[1]],
      },
    ]);
  });

  test("don't return an option as both selected and suggested", () => {
    expect(getTaxonomyOptions([OPTIONS[0], OPTIONS[2]], [OPTIONS[0], OPTIONS[1]])).toEqual([
      {
        label: 'Selected',
        options: [OPTIONS[0], OPTIONS[2]],
      },
      {
        label: 'Suggestions',
        options: [OPTIONS[1]],
      },
    ]);
  });
});

describe('serializeFilter', () => {
  test('return correct format for start and end filters', () => {
    expect(serializeFilter('start', '2001-01-07')).toEqual(
      new Date(Date.UTC(2001, 0, 7)).toISOString()
    );
    expect(serializeFilter('end', '2001-01-07')).toEqual(
      new Date(Date.UTC(2001, 0, 7)).toISOString()
    );
  });

  test('return correct format for taxonomies filter', () => {
    expect(serializeFilter('taxonomies', [{ label: 'taxonomy', value: '1' }])).toEqual([
      { label: 'taxonomy', value: '1' },
    ]);
    expect(serializeFilter('taxonomies', [])).toEqual(null);
  });

  test('return correct format for project filter', () => {
    expect(serializeFilter('project', { label: 'Project 1', value: 1 })).toEqual({
      label: 'Project 1',
      value: 1,
    });
    expect(serializeFilter('project', { label: 'Project 1', value: null })).toEqual(null);
  });

  test('return correct format for any other filter', () => {
    expect(serializeFilter('hello', { label: 'label', value: 'value' })).toEqual('value');
  });
});

describe('isFiltering', () => {
  test('return false if no filter', () => {
    expect(isFiltering({})).toEqual(false);
  });

  test('return false if all the filters have a null or undefined value', () => {
    expect(isFiltering({ filter1: null, filter2: undefined })).toEqual(false);
  });

  test('return true if any of the filter have a value different than null or undefined', () => {
    expect(isFiltering({ filter1: 0 })).toEqual(true);
    expect(isFiltering({ filter1: false })).toEqual(true);
    expect(isFiltering({ filter1: {} })).toEqual(true);
    expect(isFiltering({ filter1: null, filter2: 'hello world' })).toEqual(true);
  });
});
