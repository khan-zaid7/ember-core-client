import { db } from "../db";
import dayjs from 'dayjs';

export interface SyncQueueItem {
    sync_id : string;
    entity_id: string;
    entity_type: string;
    status : string | null;
    retry_count : number;
    last_attempt_at: string | null;
    created_by: string;
}


export const getAllSyncItems = (userId: string): SyncQueueItem[] => {
    const results = db.getAllSync<SyncQueueItem>(
        `SELECT * FROM sync_queue WHERE created_by = ?`,
        [userId]
    );
    return results;
}

export const getPendingSyncItems = (userId: string): SyncQueueItem[] => {
    const results = db.getAllSync<SyncQueueItem>(
        `SELECT * FROM sync_queue WHERE (status IS NULL OR status = 'pending') AND created_by = ?`,
        [userId]
    );
    return results;
}

export const markSyncSuccess = (sync_id: string) => {
    db.runSync(
        `UPDATE sync_queue SET status = 'success', last_attempt_at = ? WHERE sync_id = ? `, 
        [new Date().toISOString(), sync_id]
    );
};

export const markSyncFailed = (sync_id: string) => {
    db.runSync(
        `UPDATE sync_queue SET retry_count = retry_count + 1,  last_attempt_at = ? WHERE sync_id = ? `, 
        [new Date().toISOString(), sync_id]
    );
};

export const makeConflict = (
  sync_id: string,
  conflict_field: string,
  latest_data: any
): void => {
  try {
    const timestamp = dayjs().toISOString();

    db.runSync(
      `UPDATE sync_queue
       SET status = ?, conflict_field = ?, latest_data = ?, updated_at = ?
       WHERE sync_id = ?`,
      ['conflict', conflict_field, JSON.stringify(latest_data), timestamp, sync_id]
    );

    console.log(`⚠️ Conflict recorded in sync_queue [${sync_id}] on ${conflict_field}`);
  } catch (err) {
    console.error('❌ Failed to mark conflict in sync_queue:', err);
  }
};


export const getEntityDetails = (entityType: string, entityId: string): any => {
  try {
    switch (entityType.toLowerCase()) {
      case 'user':
        return db.getFirstSync(
          `SELECT * FROM users WHERE user_id = ?`,
          [entityId]
        );

      case 'registration':
        return db.getFirstSync(
          `SELECT * FROM registrations WHERE registration_id = ?`,
          [entityId]
        );

      case 'supply':
        return db.getFirstSync(
          `SELECT * FROM supplies WHERE supply_id = ?`,
          [entityId]
        );

      case 'task':
        return db.getFirstSync(
          `SELECT * FROM tasks WHERE task_id = ?`,
          [entityId]
        );

      case 'task_assignment':
        return db.getFirstSync(
          `SELECT * FROM task_assignments WHERE assignment_id = ?`,
          [entityId]
        );

      case 'location':
        return db.getFirstSync(
          `SELECT * FROM locations WHERE location_id = ?`,
          [entityId]
        );

      case 'alert':
        return db.getFirstSync(
          `SELECT * FROM alerts WHERE alert_id = ?`,
          [entityId]
        );

      default:
        console.warn(`⚠️ Unknown entityType "${entityType}" for entityId "${entityId}"`);
        return null;
    }
  } catch (error) {
    console.error(`❌ Failed to fetch entity details for [${entityType}:${entityId}]`, error);
    return null;
  }
};

// Returns the last sync date/time and whether all items are synced for a user
export const getLastSyncStatus = (userId: string): { lastSync: string | null, isAllSynced: boolean } => {
  const lastSyncRow = db.getFirstSync<{ last_attempt_at: string | null }>(
    `SELECT MAX(last_attempt_at) as last_attempt_at FROM sync_queue WHERE created_by = ?`,
    [userId]
  );
  const unsyncedCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sync_queue WHERE (status IS NULL OR status != 'success') AND created_by = ?`,
    [userId]
  );
  return {
    lastSync: lastSyncRow?.last_attempt_at || null,
    isAllSynced: (unsyncedCount?.count ?? 0) === 0,
  };
};
