import { PERMISSIONS } from 'modules/user/helpers';
import { shouldUploadImage, shouldDeleteImage, getOrganizationsOptions } from './helpers';

describe('shouldUploadImage', () => {
  test('returns false when creating and no image in form', () => {
    expect(shouldUploadImage(true, null)).toBe(false);
  });

  test('returns true when creating and image in form', () => {
    expect(shouldUploadImage(true, { id: 'new image' })).toBe(true);
  });

  test('returns false when updating and no image change', () => {
    const image = { id: 'old image' };
    expect(shouldUploadImage(false, image, image)).toBe(false);
  });

  test('returns false when updating and removing image', () => {
    expect(shouldUploadImage(false, null, { id: 'old image' })).toBe(false);
  });

  test('returns true when updating and adding image', () => {
    expect(shouldUploadImage(false, { id: 'new image' })).toBe(true);
  });

  test('returns true when updating and changing image', () => {
    expect(shouldUploadImage(false, { id: 'new image' }, { id: 'old image ' })).toBe(true);
  });
});

describe('shouldDeleteImage', () => {
  test('returns false when creating', () => {
    expect(shouldDeleteImage(true, null)).toBe(false);
    expect(shouldDeleteImage(true, { id: 'new image' })).toBe(false);
  });

  test('returns false when updating and updating image', () => {
    expect(shouldDeleteImage(false, { id: 'new image' }, { id: 'old image ' })).toBe(false);
  });

  test('returns true when updating and deleting image', () => {
    expect(shouldDeleteImage(false, null, { id: 'old image' })).toBe(true);
  });

  test('returns false when updating and adding image', () => {
    expect(shouldDeleteImage(false, { id: 'new image' })).toBe(false);
  });
});

describe('organizationsOptions', () => {
  const permissions = {
    organizations: {
      1: { permissions: [PERMISSIONS.PROJECT_ADD_TO_ORGANIZATION] },
      2: { permissions: [] },
    },
  };

  const organizations = [
    { id: '1', name: 'Organization 1' },
    { id: '2', name: 'Organization 2' },
    { id: '3', name: 'Organization 3' },
  ];

  test("filter out the organizations which don't allow projects to be attached to", () => {
    expect(getOrganizationsOptions(permissions, organizations)).toEqual([
      {
        label: organizations[0].name,
        value: +organizations[0].id,
      },
    ]);
  });
});
