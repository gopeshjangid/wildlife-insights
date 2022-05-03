import { getCountryFromIso } from 'utils/country-codes';
import { getFormInitialValues } from './helpers';

describe('getFormInitialValues', () => {
  test('return nothing if no location', () => {
    expect(getFormInitialValues(undefined)).toEqual({});
    expect(getFormInitialValues(null)).toEqual({});
  });

  test('return correct country option', () => {
    expect(getFormInitialValues({})).toEqual({ country: undefined });
    expect(getFormInitialValues({ country: null })).toEqual({ country: undefined });
    expect(getFormInitialValues({ country: 'GBR' })).toEqual({
      country: {
        label: getCountryFromIso('GBR'),
        value: 'GBR',
      },
    });
  });
});
