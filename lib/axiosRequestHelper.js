import URI from 'urijs';
import axios from 'axios';

export const uploadFile = ({ authToken, deploymentId, file, projectId, cancelToken }) => {
  const uploadUrl = new URI(`backend/api/v1/project/${projectId}/deployment/${deploymentId}/data-file`)
    .origin(process.env.API_URL)
    .toString();
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'multipart/form-data',
    }
  };

  // do not add cancelToken, if it is undefined 
  // or expired (already cancelled)
  if (cancelToken && !cancelToken?.reason) {
    config['cancelToken'] = cancelToken;
  }
  const formData = new FormData();
  formData.append('file', file.instance);
  formData.append('name', file.instance.name);

  return axios.post(uploadUrl, formData, config);
};

export const uploadFileOnBucket = ({ url, file, cancelToken }) => {
  const config = {
    headers: {
      'Content-Type': file.type,
    }
  };

  // do not add cancelToken, if it is undefined 
  // or expired (already cancelled)
  if (cancelToken && !cancelToken?.reason) {
    config['cancelToken'] = cancelToken;
  }

  return axios.put(url, file.instance, config);
};

export const requestEntityDownload = (entityType, entityId, authToken, cancelToken) => {
  const url = new URI(`backend/api/v1/batch-downloads/${entityType}/${entityId}`)
    .origin(process.env.API_URL)
    .toString();
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  };

  // do not add cancelToken, if it is undefined 
  // or expired (already cancelled)
  if (cancelToken && !cancelToken?.reason) {
    config['cancelToken'] = cancelToken;
  }

  return axios.post(url, { entityType, entityId }, config);
};
