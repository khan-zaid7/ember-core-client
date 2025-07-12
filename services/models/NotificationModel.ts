import { db } from '../db';


export interface NotificationModel {
  notification_id: string;
  user_id: string;
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
  archived?: number;
}

export const insertNotification = (notification: NotificationModel) => {
  db.runSync(
    `INSERT OR REPLACE INTO notifications (
      notification_id, user_id, title, message, type, entity_type, entity_id, received_at, read, synced, sync_status_message, server_id, updated_at, archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      notification.notification_id || '',
      notification.user_id || '',
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
      notification.updated_at ?? '',
      notification.archived ?? 0
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

export const getNotificationsByUserId = (userId: string, includeArchived: boolean = false): NotificationModel[] => {
  try {
    const archivedClause = includeArchived ? '' : 'AND (archived IS NULL OR archived = 0)';
    return db.getAllSync<NotificationModel>(
      `SELECT * FROM notifications WHERE user_id = ? ${archivedClause} ORDER BY received_at DESC;`,
      [userId]
    );
  } catch (error) {
    console.error('Error fetching notifications by user ID:', error);
    // Fallback to getting all notifications if user_id column doesn't exist yet
    return getAllNotifications();
  }
};

export const getUnreadNotificationsByUserId = (userId: string): NotificationModel[] => {
  try {
    return db.getAllSync<NotificationModel>(
      'SELECT * FROM notifications WHERE user_id = ? AND read = 0 AND (archived IS NULL OR archived = 0) ORDER BY received_at DESC;',
      [userId]
    );
  } catch (error) {
    console.error('Error fetching unread notifications by user ID:', error);
    // Fallback to getting all unread notifications if user_id column doesn't exist yet
    return db.getAllSync<NotificationModel>(
      'SELECT * FROM notifications WHERE read = 0 AND (archived IS NULL OR archived = 0) ORDER BY received_at DESC;'
    );
  }
};

export const archiveNotification = (notification_id: string) => {
  db.runSync(
    'UPDATE notifications SET archived = 1 WHERE notification_id = ?;',
    [notification_id]
  );
};

export const deleteNotification = (notification_id: string) => {
  db.runSync(
    'DELETE FROM notifications WHERE notification_id = ?;',
    [notification_id]
  );
};