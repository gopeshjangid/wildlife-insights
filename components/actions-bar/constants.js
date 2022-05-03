import { translateText } from 'utils/functions';

export const statusOptions = [
  {
    label: translateText('All'),
    value: 'all',
  },
  {
    label: translateText('Blank'),
    value: 'blank',
  },
  {
    label: translateText('Not blank'),
    value: 'notblank',
  },
];

export const photosOptions = [
  {
    label: translateText('All'),
    value: 'all',
  },
  {
    label: translateText('Highlighted'),
    value: 'highlighted',
  },
  {
    label: translateText('Not highlighted'),
    value: 'not-highlighted',
  },
];

export default {
  statusOptions,
  photosOptions,
};
