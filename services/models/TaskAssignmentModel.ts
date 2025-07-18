import { db } from '../db';
import { handleIdMapping } from '../sync/syncQueueProcessor'; 
import { Task } from './TaskModel';

export const getTaskAssignmentById = (assignment_id: string) => {
  return db.getFirstSync(
    'SELECT * FROM task_assignments WHERE assignment_id = ?',
    [assignment_id]
  );
};


export interface TaskAssignment {
  assignment_id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  status: string;
  feedback?: string | null;
  updated_at: string;
  synced: number;
  sync_status_message?: string | null;

  task?: Task;
}

export const reconcileTaskAssignmentAfterServerUpdate = async (
  serverAssignmentData: TaskAssignment,
  oldLocalAssignmentId?: string
): Promise<{ isNew: boolean; shouldNotify: boolean }> => {
  const {
    assignment_id,
    task_id,
    user_id,
    assigned_at,
    status,
    feedback,
    updated_at,
  } = serverAssignmentData;

  const normalizedStatus = status?.trim() || 'assigned';
  const normalizedFeedback = feedback?.trim() || null;

  const localAssignment = db.getFirstSync<TaskAssignment>(
    `SELECT * FROM task_assignments WHERE assignment_id = ?`,
    [assignment_id]
  );

  if (localAssignment) {
    if (new Date(updated_at).getTime() > new Date(localAssignment.updated_at).getTime()) {
      db.runSync(
        `UPDATE task_assignments SET
          task_id = ?,
          user_id = ?,
          assigned_at = ?,
          status = ?,
          feedback = ?,
          updated_at = ?,
          synced = 1,
          sync_status_message = ''
        WHERE assignment_id = ?`,
        [
          task_id,
          user_id,
          assigned_at,
          normalizedStatus,
          normalizedFeedback,
          updated_at,
          assignment_id,
        ]
      );
      console.log(`✅ Local task assignment ${assignment_id} updated and synced.`);
      return { isNew: false, shouldNotify: true };
    } else {
      console.log(`ℹ️ Local task assignment ${assignment_id} is newer or same, skipping update.`);
      return { isNew: false, shouldNotify: false };
    }
  } else {
    db.runSync(
      `INSERT INTO task_assignments (
        assignment_id, task_id, user_id, assigned_at, status, feedback, updated_at, synced, sync_status_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, '')`,
      [
        assignment_id,
        task_id,
        user_id,
        assigned_at,
        normalizedStatus,
        normalizedFeedback,
        updated_at,
      ]
    );
    console.log(`➕ New local task assignment ${assignment_id} inserted from server data.`);
    return { isNew: true, shouldNotify: true };
  }

  // If this line is ever reached, default fallback
  return { isNew: false, shouldNotify: false };
};
