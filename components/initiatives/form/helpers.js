import axios from 'axios';
import URI from 'urijs';

import { PERMISSIONS } from 'modules/user/helpers';

/**
 * Upload the logo of the initiative
 * @param {string} token Token of the user
 * @param {string|number} initiativeId ID of the initiative
 * @param {File} file Logo to upload
 */
export const uploadLogo = (token, initiativeId, file) => {
  const url = new URI(`backend/api/v1/initiative/upload/${initiativeId}/logo-image`)
    .origin(process.env.API_URL)
    .toString();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  const formData = new FormData();
  formData.append('logo', file);

  return axios.post(url, formData, { headers });
};

/**
 * Delete the logo of the initiative
 * @param {string} token Token of the user
 * @param {string|number} initiativeId ID of the initiative
 */
export const deleteLogo = (token, initiativeId) => {
  const url = new URI(`backend/api/v1/initiative/upload/${initiativeId}/logo-image`)
    .origin(process.env.API_URL)
    .toString();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  return axios.delete(url, { headers });
};

/**
 * Upload the cover image of the initiative
 * @param {string} token Token of the user
 * @param {string|number} initiativeId ID of the initiative
 * @param {File} file Cover image to upload
 */
export const uploadCoverImage = (token, initiativeId, file) => {
  const url = new URI(`backend/api/v1/initiative/upload/${initiativeId}/cover-image`)
    .origin(process.env.API_URL)
    .toString();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  const formData = new FormData();
  formData.append('coverImage', file);

  return axios.post(url, formData, { headers });
};

/**
 * Delete the cover image of the initiative
 * @param {string} token Token of the user
 * @param {string|number} initiativeId ID of the initiative
 */
export const deleteCoverImage = (token, initiativeId) => {
  const url = new URI(`backend/api/v1/initiative/upload/${initiativeId}/cover-image`)
    .origin(process.env.API_URL)
    .toString();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  return axios.delete(url, { headers });
};

/**
 * Upload the photos of the initiative
 * @param {string} token Token of the user
 * @param {string|number} initiativeId ID of the initiative
 * @param {File[]} files Photos to upload
 * @returns {import('axios').AxiosPromise<Array<Object>>}
 */
export const uploadPhotos = (token, initiativeId, files) => {
  const url = new URI(`backend/api/v1/initiative/upload/${initiativeId}/photos`)
    .origin(process.env.API_URL)
    .toString();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  const formData = new FormData();
  files.forEach(file => formData.append('fileList', file));

  return axios.post(url, formData, { headers });
};

/**
 * Upload the logos of the partners of the initiative
 * @param {string} token Token of the user
 * @param {string|number} initiativeId ID of the initiative
 * @param {File[]} files Logos to upload
 * @returns {import('axios').AxiosPromise<Array<Object>>}
 */
export const uploadLogos = (token, initiativeId, files) => {
  const url = new URI(`backend/api/v1/initiative/upload/${initiativeId}/partners-logos`)
    .origin(process.env.API_URL)
    .toString();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  const formData = new FormData();
  files.forEach(file => formData.append('fileList', file));

  return axios.post(url, formData, { headers });
};

/**
 * Return whether the image (logo or cover image) should be uploaded or not
 * @param {boolean} isCreating Is the user creating an initiative?
 * @param {Object} formImage Image contained in the form
 * @param {Object} [initiativeImage] Image as currently saved in the DB
 */
export const shouldUploadImage = (isCreating, formImage, initiativeImage) => {
  if (isCreating) {
    return !!formImage;
  }

  return !!(
    (!initiativeImage && formImage)
    || (initiativeImage && formImage && initiativeImage.id !== formImage.id)
  );
};

/**
 * Return whether the image (logo or cover image) should be deleted or not
 * @param {boolean} isCreating Is the user creating an initiative?
 * @param {Object} formImage Image contained in the form
 * @param {Object} [initiativeImage] Image as currently saved in the DB
 */
export const shouldDeleteImage = (isCreating, formImage, initiativeImage) => {
  if (isCreating) {
    return false;
  }

  // We only delete if the user doesn't want the image anymore
  return !!initiativeImage && !formImage;
};

/**
 * Return the options of the organization the user can attach the project to
 * @param {object} permissions Permissions of the logged in user
 * @param {Array<object>} organizationsData Array of organizations
 */
export const getOrganizationsOptions = (permissions, organizationsData) => organizationsData
  .filter(
    organization => !!permissions.organizations[organization.id]
        && permissions.organizations[organization.id].permissions.indexOf(
          PERMISSIONS.PROJECT_ADD_TO_ORGANIZATION
        ) !== -1
  )
  .map(organization => ({ label: organization.name, value: +organization.id }));
