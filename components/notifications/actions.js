import {
  success,
  error,
  warning,
  info,
  hide,
} from 'react-notification-system-redux';

const notificationDefaults = {
  position: 'bc',
  dismissible: 'button',
  autoDismiss: 5,
};

export const displaySuccess = notification => success({ ...notificationDefaults, ...notification });
export const displayError = notification => error({ ...notificationDefaults, ...notification });
export const displayWarning = notification => warning({ ...notificationDefaults, ...notification });
export const displayInfo = notification => info({ ...notificationDefaults, ...notification });
export const removeNotification = uid => hide(uid);
