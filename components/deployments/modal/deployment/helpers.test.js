import { serializeBody, getFormInitialValues } from './helpers';

const FORM_VALUES = {
  id: '160',
  deploymentName: 'Deployment 3',
  startDatetime: '2019-03-18',
  endDatetime: '2019-03-29',
  remarks: '',
  __typename: 'Deployment',
  locationOption: {
    label: 'Newcastle 1',
    value: '99',
  },
  deviceOption: {
    label: 'H500HG10195631',
    value: '3484',
  },
  sensorFailureOption: {
    label: 'Memory Card',
    value: 'Memory Card',
  },
  sensorHeightOption: {
    label: 'Chest height',
    value: 'Chest height',
  },
  sensorHeightDetails: '4m',
  sensorOrientationOption: {
    label: 'Parallel',
    value: 'Parallel',
  },
  sensorOrientationDetails: 'Facing south',
  baitTypeOption: {
    label: 'Meat',
    value: 'Meat',
  },
  baitTypeDetails: 'Carrot',
  featureTypeOptions: [
    {
      label: 'Carcass',
      value: 'Carcass',
    },
    {
      label: 'Fruiting tree',
      value: 'Fruiting tree',
    },
  ],
  featureTypeMethodology: 'Vizzuality',
};

describe('getFormInitialValues', () => {
  const DEPLOYMENT = {
    id: '160',
    deploymentName: 'Deployment 3',
    startDatetime: '2019-03-18',
    endDatetime: '2019-03-29',
    location: {
      id: '99',
      placename: 'Newcastle 1',
      __typename: 'Location',
    },
    device: {
      id: '10',
      name: 'Canon EOS',
      __typename: 'Device',
    },
    sensorFailureDetails: 'Wildlife Damage',
    sensorHeight: 'Canopy',
    sensorOrientation: 'Pointed Downward',
    baitType: {
      id: '11',
      typeName: 'None',
    },
    remarks: null,
    metadata: {
      height_other: 'Variable',
      orientation_other: 'Facing north',
      bait_description: 'Spinach',
      feature_type: ['Road dirt', 'Nest site'],
      feature_type_methodology: 'Hello world',
    },
    __typename: 'Deployment',
  };

  test('return nothing if no deployment', () => {
    const resp = {
      baitTypeOption: {
        label: 'None',
        value: 'None',
      },
    };
    expect(getFormInitialValues(undefined, 1)).toEqual(resp);
    expect(getFormInitialValues(null, 1)).toEqual(resp);
  });

  test('return correct location option', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('location');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty('locationOption', {
      label: DEPLOYMENT.location.placename,
      value: DEPLOYMENT.location.id,
    });
    expect(
      getFormInitialValues({ ...DEPLOYMENT, location: null })
    ).not.toHaveProperty('locationOption');
  });

  test('return correct device option', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('device');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty('deviceOption', {
      label: DEPLOYMENT.device.name,
      value: DEPLOYMENT.device.id,
    });
    expect(
      getFormInitialValues({ ...DEPLOYMENT, device: null })
    ).not.toHaveProperty('deviceOption');
  });

  test('return correct sensor failure details option', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('sensorFailureDetails');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'sensorFailureOption',
      {
        label: DEPLOYMENT.sensorFailureDetails,
        value: DEPLOYMENT.sensorFailureDetails,
      }
    );
    expect(
      getFormInitialValues({ ...DEPLOYMENT, sensorFailureDetails: null })
    ).not.toHaveProperty('sensorFailureOption');
  });

  test('return correct sensor height option', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('sensorHeight');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'sensorHeightOption',
      {
        label: DEPLOYMENT.sensorHeight,
        value: DEPLOYMENT.sensorHeight,
      }
    );
    expect(
      getFormInitialValues({ ...DEPLOYMENT, sensorHeight: null })
    ).not.toHaveProperty('sensorHeightOption');
  });

  test('return correct sensor height details field', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('sensorHeightDetails');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: null })
    ).not.toHaveProperty('sensorHeightDetails');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: {} })
    ).not.toHaveProperty('sensorHeightDetails');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'sensorHeightDetails',
      DEPLOYMENT.metadata.height_other
    );
  });

  test('return correct sensor orientation option', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('sensorOrientation');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'sensorOrientationOption',
      {
        label: DEPLOYMENT.sensorOrientation,
        value: DEPLOYMENT.sensorOrientation,
      }
    );
    expect(
      getFormInitialValues({ ...DEPLOYMENT, sensorOrientation: null })
    ).not.toHaveProperty('sensorOrientationOption');
  });

  test('return correct sensor orientation details field', () => {
    expect(getFormInitialValues({})).not.toHaveProperty(
      'sensorOrientationDetails'
    );
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: null })
    ).not.toHaveProperty('sensorOrientationDetails');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: {} })
    ).not.toHaveProperty('sensorOrientationDetails');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'sensorOrientationDetails',
      DEPLOYMENT.metadata.orientation_other
    );
  });

  test('return correct bait type option', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('baitType');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty('baitTypeOption', {
      label: DEPLOYMENT.baitType.typeName,
      value: DEPLOYMENT.baitType.typeName,
    });
    expect(
      getFormInitialValues({ ...DEPLOYMENT, baitType: null })
    ).not.toHaveProperty('baitTypeOption');
  });

  test('return correct bait type details field', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('baitTypeDetails');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: null })
    ).not.toHaveProperty('baitTypeDetails');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: {} })
    ).not.toHaveProperty('baitTypeDetails');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'baitTypeDetails',
      DEPLOYMENT.metadata.bait_description
    );
  });

  test('return correct feature type options', () => {
    expect(getFormInitialValues({})).not.toHaveProperty('featureTypeOptions');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: null })
    ).not.toHaveProperty('featureTypeOptions');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: {} })
    ).not.toHaveProperty('featureTypeOptions');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'featureTypeOptions',
      DEPLOYMENT.metadata.feature_type.map(feature => ({
        label: feature,
        value: feature,
      }))
    );
  });

  test('return correct feature type methodology field', () => {
    expect(getFormInitialValues({})).not.toHaveProperty(
      'featureTypeMethodology'
    );
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: null })
    ).not.toHaveProperty('featureTypeMethodology');
    expect(
      getFormInitialValues({ ...DEPLOYMENT, metadata: {} })
    ).not.toHaveProperty('baitTyfeatureTypeMethodologypeDetails');
    expect(getFormInitialValues(DEPLOYMENT)).toHaveProperty(
      'featureTypeMethodology',
      DEPLOYMENT.metadata.feature_type_methodology
    );
  });
});

describe('serializeBody', () => {
  test("doesn't return non supported attributes", () => {
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('id');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('location');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('locationOption');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('device');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('deviceOption');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty(
      'sensorFailureOption'
    );
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('sensorHeightOption');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty(
      'sensorOrientationOption'
    );
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('baitTypeOption');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('__typename');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty('featureTypeOptions');
    expect(serializeBody(FORM_VALUES)).not.toHaveProperty(
      'featureTypeMethodology'
    );
  });

  test('returns the locationId correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'locationId',
      +FORM_VALUES.locationOption.value
    );
    expect(
      serializeBody({ ...FORM_VALUES, locationOption: null })
    ).toHaveProperty('locationId', null);
    expect(
      serializeBody({ ...FORM_VALUES, locationOption: undefined })
    ).toHaveProperty('locationId', null);
  });

  test('returns the deviceId correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'deviceId',
      +FORM_VALUES.deviceOption.value
    );
    expect(
      serializeBody({ ...FORM_VALUES, deviceOption: null })
    ).toHaveProperty('deviceId', null);
    expect(
      serializeBody({ ...FORM_VALUES, deviceOption: undefined })
    ).toHaveProperty('deviceId', null);
  });

  test('returns the sensorFailureDetails correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'sensorFailureDetails',
      FORM_VALUES.sensorFailureOption.value
    );
    expect(
      serializeBody({ ...FORM_VALUES, sensorFailureOption: null })
    ).toHaveProperty('sensorFailureDetails', null);
    expect(
      serializeBody({ ...FORM_VALUES, sensorFailureOption: undefined })
    ).toHaveProperty('sensorFailureDetails', null);
  });

  test('returns the sensorHeight correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'sensorHeight',
      FORM_VALUES.sensorHeightOption.value
    );
    expect(
      serializeBody({ ...FORM_VALUES, sensorHeightOption: null })
    ).toHaveProperty('sensorHeight', null);
    expect(
      serializeBody({ ...FORM_VALUES, sensorHeightOption: undefined })
    ).toHaveProperty('sensorHeight', null);
  });

  test('returns the sensorHeightDetails field correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadata.height_other',
      FORM_VALUES.sensorHeightDetails
    );
    expect(
      serializeBody({ ...FORM_VALUES, sensorHeightDetails: null })
    ).not.toHaveProperty('metadata.height_other');
    expect(
      serializeBody({ ...FORM_VALUES, sensorHeightDetails: undefined })
    ).not.toHaveProperty('metadata.height_other');
  });

  test('returns the sensorOrientation correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'sensorOrientation',
      FORM_VALUES.sensorOrientationOption.value
    );
    expect(
      serializeBody({ ...FORM_VALUES, sensorOrientationOption: null })
    ).toHaveProperty('sensorOrientation', null);
    expect(
      serializeBody({ ...FORM_VALUES, sensorOrientationOption: undefined })
    ).toHaveProperty('sensorOrientation', null);
  });

  test('returns the sensorOrientationDetails field correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadata.orientation_other',
      FORM_VALUES.sensorOrientationDetails
    );
    expect(
      serializeBody({ ...FORM_VALUES, sensorOrientationDetails: null })
    ).not.toHaveProperty('metadata.orientation_other');
    expect(
      serializeBody({ ...FORM_VALUES, sensorOrientationDetails: undefined })
    ).not.toHaveProperty('metadata.orientation_other');
  });

  test('returns the baitTypeName correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'baitTypeName',
      FORM_VALUES.baitTypeOption.value
    );
    expect(
      serializeBody({ ...FORM_VALUES, baitTypeOption: null })
    ).toHaveProperty('baitTypeName', null);
    expect(
      serializeBody({ ...FORM_VALUES, baitTypeOption: undefined })
    ).toHaveProperty('baitTypeName', null);
  });

  test('returns the baitTypeDetails field correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadata.bait_description',
      FORM_VALUES.baitTypeDetails
    );
    expect(
      serializeBody({ ...FORM_VALUES, baitTypeDetails: null })
    ).not.toHaveProperty('metadata.bait_description');
    expect(
      serializeBody({ ...FORM_VALUES, baitTypeDetails: undefined })
    ).not.toHaveProperty('metadata.bait_description');
  });

  test('returns the featureTypeOptions field correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadata.feature_type',
      FORM_VALUES.featureTypeOptions.map(option => option.value)
    );
    expect(
      serializeBody({ ...FORM_VALUES, featureTypeOptions: null })
    ).toHaveProperty('metadata.feature_type', []);
    expect(
      serializeBody({ ...FORM_VALUES, featureTypeOptions: undefined })
    ).toHaveProperty('metadata.feature_type', []);
  });

  test('returns the featureTypeMethodology field correctly', () => {
    expect(serializeBody(FORM_VALUES)).toHaveProperty(
      'metadata.feature_type_methodology',
      FORM_VALUES.featureTypeMethodology
    );
    expect(
      serializeBody({ ...FORM_VALUES, featureTypeMethodology: null })
    ).not.toHaveProperty('metadata.feature_type_methodology');
    expect(
      serializeBody({ ...FORM_VALUES, featureTypeMethodology: undefined })
    ).not.toHaveProperty('metadata.feature_type_methodology');
  });
});
