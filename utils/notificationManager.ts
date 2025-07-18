import { NotificationType } from "../context/NotificationContext";

// This is a utility to allow non-React files like services to send notifications
// It will be initialized by the NotificationContext
type NotifyFunction = (message: string, type?: NotificationType, title?: string) => void;
type CheckNewNotificationsFunction = () => void;

let notifyFn: NotifyFunction = () => {};
let checkNewNotificationsFn: CheckNewNotificationsFunction = () => {};

export const initializeNotificationManager = (
  notify: NotifyFunction,
  checkNewNotifications: CheckNewNotificationsFunction
) => {
  notifyFn = notify;
  checkNewNotificationsFn = checkNewNotifications;
};

export const showNotification = (message: string, type: NotificationType = 'info', title?: string) => {
  notifyFn(message, type, title);
};

export const checkForNewNotifications = () => {
  checkNewNotificationsFn();
};
