/* eslint-disable import/prefer-default-export */
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

/**
 * Hook to debounce a callback
 * @param {function(...any): any} callback Callback to debounce
 * @param {number} delay Delay in ms
 * @param {any} [options] Options for lodash's debounce function
 */
export const useDebouncedCallback = (callback, delay, options) => (
  useCallback(debounce(callback, delay, options), [callback, delay])
);
