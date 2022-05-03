import { getMutationData } from './helpers';

describe('getMutationData', () => {
  const FORM_DATA = {
    id: '1',
    name: 'Camera 1',
    model: 'DX10',
    serialNumber: 'j9798798Unkj',
    purchaseDate: '2018-01-01',
    purchasePrice: '100',
    productUrl: 'http://www.vizzuality.com',
    remarks: 'Main camera',
    __typename: 'Device',
  };

  test("remove attribute that should't be sent", () => {
    expect(getMutationData(FORM_DATA)).not.toHaveProperty('id');
    expect(getMutationData(FORM_DATA)).not.toHaveProperty('__typename');
  });

  test('parse purchasePrice attribute correctly', () => {
    expect(getMutationData(FORM_DATA)).toHaveProperty('purchasePrice', +FORM_DATA.purchasePrice);
    expect(getMutationData({ ...FORM_DATA, purchasePrice: '' })).toHaveProperty(
      'purchasePrice',
      null
    );
    expect(getMutationData({ ...FORM_DATA, purchasePrice: undefined })).toHaveProperty(
      'purchasePrice',
      null
    );
  });
});
