import URI from 'urijs';
import axios from 'axios';

export const getDetectionRates = (query, authToken, responseType = 'json') => {
  let endpoint =
    responseType === 'json' ? 'detection_rate_data' : 'detection_rate';
  let baseUrl = new URI(`/detection/${endpoint}`)
    .origin(process.env.BACKEND_API_URL)
    .toString();

  baseUrl = query ? baseUrl + '?' + query : baseUrl;

  const apiUrl = new URI(baseUrl)
    .origin(process.env.BACKEND_API_URL)
    .toString();
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    responseType: responseType === 'graph' ? 'arraybuffer' : 'application/json'
  };

  return axios.get(apiUrl, config);
};

export const getDetectionMap = (query, authToken, responseType = 'json') => {
  let endpoint =
    responseType === 'json' ? 'detection_map_data' : 'detection_map';
  let baseUrl = new URI(`/detection/${endpoint}`)
    .origin(process.env.BACKEND_API_URL)
    .toString();
  baseUrl = query ? baseUrl + '?' + query : baseUrl;

  const apiUrl = new URI(baseUrl)
    .origin(process.env.BACKEND_API_URL)
    .toString();
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  };

  return axios.get(apiUrl, config);
};
