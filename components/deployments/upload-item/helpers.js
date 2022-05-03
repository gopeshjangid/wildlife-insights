import URI from 'urijs';
import axios from 'axios';
import { translateText, formatDate } from 'utils/functions';
import { FORMAT } from 'components/form/datepicker';

export const uploadCSVFile = ({ authToken, projectId, file }) => {
  const uploadUrl = new URI(`backend/api/v1/batch-uploads/project/${projectId}/deployment`)
    .origin(process.env.API_URL)
    .toString();
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'multipart/form-data',
    }
  };
  const formData = new FormData();
  formData.append('file', file.instance);
  return axios.post(uploadUrl, formData, config);
};

export const generateErrorFile = (totalUploaded, filesWithUnknownStatus) => {
  let content = translateText('Upload report of {date}', {
    date: formatDate(new Date(), FORMAT),
  });
  content += translateText('\n\nBelow is the breakdown of each of the categories with the name of the files that belong to them.');
  content += translateText('\n\nDeployments in an unknown state:\n');
  content += filesWithUnknownStatus.length
    ? filesWithUnknownStatus.map(name => `- ${name}`).join('\n')
    : translateText('None');
  content += translateText('\n\nSuccessfully uploaded deployments:\n');
  content += totalUploaded > 0
    ? totalUploaded
    : translateText('None');

  const blob = new Blob([content], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};
