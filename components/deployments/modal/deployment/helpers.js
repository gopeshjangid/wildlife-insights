import { get, omit } from 'lodash';
import { BAIT_TYPE_OPTIONS } from 'components/upload/form/deployment-create-field/constant.js';

const getBaitType = (projectData, deployment) => {
  let baitTypeOption = {};
  const baitUse = get(projectData, 'getProject.metadata.project_bait_use', '');
  if (baitUse === 'Yes' || baitUse === 'Some') {
    if (!deployment) {
      const baitType = get(projectData, 'getProject.metadata.project_bait_type', '');
      const baitTypeValue = BAIT_TYPE_OPTIONS.find(d => d.label.includes(baitType));
      baitTypeOption = {
        label: baitTypeValue.label,
        value: baitTypeValue.value,
      };
    } else {
      baitTypeOption = {
        label: deployment.baitType.typeName,
        value: deployment.baitType.typeName,
      };
    }
  } else {
    baitTypeOption = {
      label: 'None',
      value: 'None',
    };
  }
  return baitTypeOption;
};

/**
 * Return the initial values of the form
 * @param {Object} deployment Deployment object from the API
 */
export const getFormInitialValues = (deployment, projectData) => {
  if (!deployment) {
    const res = {};
    res.baitTypeOption = getBaitType(projectData, deployment);
    return res;
  }

  const res = omit(
    deployment,
    'location',
    'device',
    'sensorFailureDetails',
    'sensorHeight',
    'sensorOrientation',
    'baitType',
    'metadata'
  );

  if (deployment.location) {
    res.locationOption = {
      label: deployment.location.placename,
      value: deployment.location.id,
    };
  }

  if (deployment.device) {
    res.deviceOption = {
      label: deployment.device.name,
      value: deployment.device.id,
    };
  }

  if (deployment.sensorFailureDetails) {
    res.sensorFailureOption = {
      label: deployment.sensorFailureDetails,
      value: deployment.sensorFailureDetails,
    };
  }

  if (deployment.sensorHeight) {
    res.sensorHeightOption = {
      label: deployment.sensorHeight,
      value: deployment.sensorHeight,
    };
  }

  if (deployment.sensorOrientation) {
    res.sensorOrientationOption = {
      label: deployment.sensorOrientation,
      value: deployment.sensorOrientation,
    };
  }

  if (deployment.baitType) {
    res.baitTypeOption = getBaitType(projectData, deployment);
  }

  // eslint-disable-next-line camelcase
  if (deployment.metadata?.height_other) {
    res.sensorHeightDetails = deployment.metadata.height_other;
  }

  // eslint-disable-next-line camelcase
  if (deployment.metadata?.orientation_other) {
    res.sensorOrientationDetails = deployment.metadata.orientation_other;
  }

  // eslint-disable-next-line camelcase
  if (deployment.metadata?.bait_description) {
    res.baitTypeDetails = deployment.metadata.bait_description;
  }

  // eslint-disable-next-line camelcase
  if (deployment.metadata?.feature_type) {
    res.featureTypeOptions = deployment.metadata.feature_type.map(feature => ({
      label: feature,
      value: feature,
    }));
  }

  // eslint-disable-next-line camelcase
  if (deployment.metadata?.feature_type_methodology) {
    res.featureTypeMethodology = deployment.metadata.feature_type_methodology;
  }

  if (deployment.subproject) {
    res.subProjectOption = {
      label: deployment.subproject.name,
      value: deployment.subproject.id,
    };
  }

  return res;
};

/**
 * Return the serialized values of the form so they can be sent to the API
 * @param {Object<string, any>} values Values of the form
 */
export const serializeBody = (values) => {
  /** @type {any} res */
  const res = {
    ...omit(values, [
      'id',
      '__typename',
      'location',
      'locationOption',
      'device',
      'deviceOption',
      'sensorFailureOption',
      'sensorHeightOption',
      'sensorOrientationOption',
      'baitTypeOption',
      'sensorHeightDetails',
      'sensorOrientationDetails',
      'baitTypeDetails',
      'featureTypeOptions',
      'featureTypeMethodology',
      'subProjectOption',
    ]),
    ...(values.locationOption
      ? { locationId: +values.locationOption.value }
      : { locationId: null }),
    ...(values.deviceOption
      ? { deviceId: +values.deviceOption.value }
      : { deviceId: null }),
    ...(values.sensorFailureOption
      ? { sensorFailureDetails: values.sensorFailureOption.value }
      : { sensorFailureDetails: null }),
    ...(values.sensorHeightOption
      ? { sensorHeight: values.sensorHeightOption.value }
      : { sensorHeight: null }),
    ...(values.sensorOrientationOption
      ? { sensorOrientation: values.sensorOrientationOption.value }
      : { sensorOrientation: null }),
    ...(values.baitTypeOption
      ? { baitTypeName: values.baitTypeOption.value }
      : { baitTypeName: null }),
    ...(values.quietPeriod
      ? { quietPeriod: +values.quietPeriod }
      : { quietPeriod: null }),
    ...(values.subProjectOption
      ? { subprojectId: +values.subProjectOption.value }
      : { subprojectId: null }),
  };

  if (values.sensorHeightDetails) {
    if (!res.metadata) {
      res.metadata = {};
    }
    res.metadata.height_other = values.sensorHeightDetails;
  }

  if (values.sensorOrientationDetails) {
    if (!res.metadata) {
      res.metadata = {};
    }
    res.metadata.orientation_other = values.sensorOrientationDetails;
  }

  if (values.baitTypeDetails) {
    if (!res.metadata) {
      res.metadata = {};
    }
    res.metadata.bait_description = values.baitTypeDetails;
  }

  if (!res.metadata) {
    res.metadata = {};
  }
  res.metadata.feature_type = values.featureTypeOptions
    ? values.featureTypeOptions.map(option => option.value)
    : [];

  if (values.featureTypeMethodology) {
    if (!res.metadata) {
      res.metadata = {};
    }
    res.metadata.feature_type_methodology = values.featureTypeMethodology;
  }

  return res;
};
