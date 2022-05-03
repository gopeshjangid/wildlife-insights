import React from 'react';
import PropTypes from 'prop-types';
import NotificationsComponent from 'react-notification-system-redux';

import { exists } from 'utils/functions';

import './style.scss';

const Notifications = ({ notifications }) => {
  const notificationsDict = {};
  notifications.forEach((notification) => {
    if (!notificationsDict[notification.uid]) {
      notificationsDict[notification.uid] = notification;
    }
  });

  const uniqueNotifications = Object.values(notificationsDict);

  // See the other defaults in actions.js
  const notificationsWithDefaults = notifications.map(notification => ({
    ...notification,
    children: exists(notification.children)
      ? <div className="notification-message">{notification.children}</div>
      : undefined
  }));

  return (
    <div>
      <div className="sr-only" aria-live="polite">
        {uniqueNotifications.map(notification => (
          <div key={notification.uid}>
            {notification.level}: {notification.title}
            {/* NOTE: we cannot display the content of the notification
                notification.message or notification.children here because
                we would mount twice a possible component that needs to
                be unique. This is the case of UploadItem.
              */}
          </div>
        ))}
      </div>
      <NotificationsComponent
        notifications={notificationsWithDefaults}
        style={false} // eslint-disable-line react/style-prop-object
      />
    </div>
  );
};

Notifications.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Notifications;
