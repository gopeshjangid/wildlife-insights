import nanoid from 'nanoid';

export const parseImage = image => ({
  id: nanoid(),
  name: image.name,
  type: image.type,
  instance: image,
  alt: '',
});

export default { parseImage };
