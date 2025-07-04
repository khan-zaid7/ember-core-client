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

export const getPendingSyncItems = (): SyncQueueItem[] => {
    const results = db.getAllSync<SyncQueueItem>(
        `SELECT * FROM sync_queue WHERE status IS NULL OR status = 'pending'`
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