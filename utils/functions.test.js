import isDate from 'date-fns/isDate';
import isValid from 'date-fns/isValid';
import {
  getConcernedEntity,
  parseDate,
  getReadableRole,
  getLocale,
  translateText,
  formatDate,
  getCoordinatesBounds,
} from './functions';

describe('getConcernedEntity', () => {
  const projectResult = {
    type: 'project',
    id: 3,
  };

  const initiativeResult = {
    type: 'initiative',
    id: 2,
  };

  const organizationResult = {
    type: 'organization',
    id: 1,
  };

  test('return correct ID and type', () => {
    expect(getConcernedEntity(undefined, undefined, projectResult.id)).toEqual(projectResult);
    expect(getConcernedEntity(undefined, initiativeResult.id, projectResult.id)).toEqual(
      projectResult
    );
    expect(
      getConcernedEntity(organizationResult.id, initiativeResult.id, projectResult.id)
    ).toEqual(projectResult);
    expect(getConcernedEntity(organizationResult.id, undefined, projectResult.id)).toEqual(
      projectResult
    );

    expect(getConcernedEntity(undefined, initiativeResult.id, undefined)).toEqual(initiativeResult);
    expect(getConcernedEntity(organizationResult.id, initiativeResult.id, undefined)).toEqual(
      initiativeResult
    );

    expect(getConcernedEntity(organizationResult.id, undefined, undefined)).toEqual(
      organizationResult
    );

    expect(getConcernedEntity()).toEqual(null);
  });

  test('return correctly converts ID to number', () => {
    expect(getConcernedEntity(undefined, undefined, `${projectResult.id}`)).toEqual(projectResult);
    expect(getConcernedEntity(undefined, `${initiativeResult.id}`, undefined)).toEqual(
      initiativeResult
    );
    expect(getConcernedEntity(`${organizationResult.id}`, undefined, undefined)).toEqual(
      organizationResult
    );
  });
});

describe('getLocale', () => {
  test("don't throw error when executed on the server", () => {
    expect(() => getLocale()).not.toThrow();
  });
});

describe('translateText', () => {
  test("don't throw error when executed on the server", () => {
    expect(() => translateText('Vizzuality')).not.toThrow();
  });
});

describe('parseDate', () => {
  test('never return invalid Date', () => {
    let res = parseDate('2019-01-01', 'yyyy-MM-dd');
    expect(isDate(res)).toEqual(true);
    expect(isValid(res)).toEqual(true);

    res = parseDate('hello', 'yyyy-MM-dd');
    expect(isDate(res)).toEqual(false);
  });

  test('never parse an incomplete date string', () => {
    const res = parseDate('2-01-01', 'yyyy-MM-dd');
    expect(res).toEqual(undefined);
  });
});

describe('formatDate', () => {
  test("don't throw error with correct arguments", () => {
    expect(() => formatDate(new Date(), 'yyyy-MM-dd')).not.toThrow();
  });
});

describe('getReadableRole', () => {
  test('returns correct result for organizations', () => {
    expect(getReadableRole('ORGANIZATION_OWNER')).toEqual('owner');
    expect(getReadableRole('ORGANIZATION_EDITOR')).toEqual('editor');
    expect(getReadableRole('ORGANIZATION_VIEWER')).toEqual('viewer');
  });

  test('returns correct result for initiatives', () => {
    expect(getReadableRole('INITIATIVE_OWNER')).toEqual('owner');
    expect(getReadableRole('INITIATIVE_EDITOR')).toEqual('editor');
    expect(getReadableRole('INITIATIVE_VIEWER')).toEqual('viewer');
  });

  test('returns correct result for projects', () => {
    expect(getReadableRole('PROJECT_OWNER')).toEqual('owner');
    expect(getReadableRole('PROJECT_EDITOR')).toEqual('editor');
    expect(getReadableRole('PROJECT_VIEWER')).toEqual('viewer');
  });

  test('returns null when the role is unrecognised', () => {
    expect(getReadableRole('Vizzuality')).toEqual(null);
  });

  test('returns null when role is null or undefined', () => {
    expect(getReadableRole(null)).toEqual(null);
    expect(getReadableRole(undefined)).toEqual(null);
  });
});

describe('getCoordinatesBounds', () => {
  test('returns the whole world if no coordinates', () => {
    expect(getCoordinatesBounds([])).toEqual({
      sw: { lat: -90, lng: -180 },
      ne: { lat: 90, lng: 180 },
    });
  });

  test('return the correct bounds', () => {
    const coordinates = [[20, 65], [-2, -32], [-11, 48], [18, -102], [50, 98]];
    expect(getCoordinatesBounds(coordinates)).toEqual({
      sw: { lat: -11, lng: -102 },
      ne: { lat: 50, lng: 98 },
    });
  });
});
