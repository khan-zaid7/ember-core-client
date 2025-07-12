
import { db } from '../db';


export interface NotificationModel {
  notification_id: string;
  title?: string;
  message: string;
  type?: string;
  entity_type?: string;
  entity_id?: string;
  received_at?: string;
  read?: number;
  synced?: number;
  sync_status_message?: string;
  server_id?: string;
  updated_at?: string;
}

export const insertNotification = (notification: NotificationModel) => {
  db.runSync(
    `INSERT OR REPLACE INTO notifications (
      notification_id, title, message, type, entity_type, entity_id, received_at, read, synced, sync_status_message, server_id, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      notification.notification_id || '',
      notification.title ?? '',
      notification.message || '',
      notification.type ?? '',
      notification.entity_type ?? '',
      notification.entity_id ?? '',
      notification.received_at ?? '',
      notification.read ?? 0,
      notification.synced ?? 0,
      notification.sync_status_message ?? '',
      notification.server_id ?? '',
      notification.updated_at ?? ''
    ]
  );
};

export const getAllNotifications = (): NotificationModel[] => {
  return db.getAllSync<NotificationModel>(
    'SELECT * FROM notifications ORDER BY received_at DESC;'
  );
};

export const markNotificationAsRead = (notification_id: string) => {
  db.runSync(
    'UPDATE notifications SET read = 1 WHERE notification_id = ?;',
    [notification_id]
  );
};

export const getUnsyncedNotifications = (): NotificationModel[] => {
  return db.getAllSync<NotificationModel>(
    'SELECT * FROM notifications WHERE synced = 0;'
  );
};

export const updateNotificationSyncStatus = (notification_id: string, synced: number, sync_status_message: string) => {
  db.runSync(
    'UPDATE notifications SET synced = ?, sync_status_message = ? WHERE notification_id = ?;',
    [synced, sync_status_message, notification_id]
  );
};

export const getNotificationById = (notification_id: string): NotificationModel | undefined => {
  const result = db.getAllSync<NotificationModel>(
    'SELECT * FROM notifications WHERE notification_id = ? LIMIT 1;',
    [notification_id]
  );
  return result.length > 0 ? result[0] : undefined;
};