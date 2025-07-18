import { db } from '../db'; // adjust the path as needed
import { generateUUID } from '@/utils/generateUUID';

export interface Task {
  task_id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  created_by: string;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  synced: number;
  sync_status_message?: string | null;
}


export const insertTaskOffline = (form: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignTo?: string[];
  createdBy: string;
  dueDate?: string;
}) => {
  const task_id = generateUUID();
  const title = form.title.trim();
  const description = form.description?.trim() || '';
  const status = form.status?.trim() || 'pending';
  const priority = form.priority?.trim() || 'normal';
  const created_by = form.createdBy.trim();
  const due_date = form.dueDate || null;
  const created_at = new Date().toISOString();
  const updated_at = created_at;

  // Basic validation
  if (!title || !created_by) {
    throw new Error('Title and Creator are required');
  }

  // Optional: check for duplicate task_id (rare)
  const exists = db.getFirstSync<{ task_id: string }>(
    `SELECT task_id FROM tasks WHERE task_id = ?`,
    [task_id]
  );

  if (exists) {
    throw new Error('A task with this ID already exists locally');
  }

  // Insert into tasks table
  db.runSync(
    `INSERT INTO tasks (
      task_id, title, description, status, priority,
      created_by, due_date, created_at, updated_at, synced, sync_status_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task_id,
      title,
      description,
      status,
      priority,
      created_by,
      due_date,
      created_at,
      updated_at,
      0, // synced
      '', // sync_status_message
    ]
  );

  // Insert assignments for each user
  if (Array.isArray(form.assignTo)) {
    form.assignTo.forEach(user_id => {
      const assignment_id = generateUUID();
      db.runSync(
        `INSERT INTO task_assignments (
          assignment_id, task_id, user_id, assigned_at, status, feedback, updated_at, synced, sync_status_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assignment_id,
          task_id,
          user_id,
          created_at,
          'assigned',
          '',
          updated_at,
          0,
          ''
        ]
      );

      // 🔧 Add this block to sync the assignment
      db.runSync(
        `INSERT INTO sync_queue (
          sync_id, entity_type, entity_id, status, retry_count, created_by
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          generateUUID(),
          'task_assignment',
          assignment_id,
          'pending',
          0,
          created_by
        ]
      );
    });
  }


  // Add to sync_queue
  db.runSync(
    `INSERT INTO sync_queue (
      sync_id, entity_type, entity_id, status, retry_count, created_by
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      generateUUID(),
      'task',
      task_id,
      'pending',
      0,
      created_by
    ]
  );

  return task_id;
};

export const getTasksByUserId = (userId: string) => {
  console.log('this works', userId)
  const result = db.getAllSync<any>(
    `SELECT t.*, 
                u_creator.name as created_by_name,
                ta.status as assignment_status,
                ta.feedback as assignment_feedback,
                ta.assigned_at
         FROM tasks t
         INNER JOIN task_assignments ta ON t.task_id = ta.task_id
         LEFT JOIN users u_creator ON t.created_by = u_creator.user_id
         WHERE ta.user_id = ?
         ORDER BY t.created_at DESC`,
    [userId]
  );
  const allTasks = db.getAllSync<any>(
    `SELECT * FROM tasks WHERE task_id IN (
  '6193df9e-2de1-4d35-bf96-9b0083643fa3',
  'b8eb6007-e133-498e-a874-d7f372b5b9bb'
);`
  );
  const allTasksAssignment = db.getAllSync<any>(
    `SELECT * from task_assignments`
  );
  console.log(allTasks)
  console.log(allTasksAssignment)
  return result;
};

export const getCreatedTasks = (userId: string) => {
  return db.getAllSync<any>(
    `SELECT t.*, 
                u_creator.name as created_by_name,
                GROUP_CONCAT(u_assignee.name, ', ') as assignees
         FROM tasks t
         LEFT JOIN users u_creator ON t.created_by = u_creator.user_id
         LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
         LEFT JOIN users u_assignee ON ta.user_id = u_assignee.user_id
         WHERE t.created_by = ?
         GROUP BY t.task_id
         ORDER BY t.created_at DESC`,
    [userId]
  );
};

export const getTaskById = (task_id: string) => {
  return db.getFirstSync(
    'SELECT * FROM tasks WHERE task_id = ?',
    [task_id]
  );
};

export const reconcileTaskAfterServerUpdate = (serverTaskData: Task) => {
  const {
    task_id,
    title,
    description,
    status,
    priority,
    created_by,
    due_date,
    created_at,
    updated_at,
  } = serverTaskData;

  const normalizedTitle = title?.trim() || '';
  const normalizedDescription = description?.trim() || null;
  const normalizedStatus = status?.trim() || 'pending';
  const normalizedPriority = priority?.trim() || 'normal';
  const normalizedDueDate = due_date?.trim() || null;

  const localTask = db.getFirstSync<Task>(
    `SELECT * FROM tasks WHERE task_id = ?`,
    [task_id]
  );

  if (localTask) {
    if (new Date(updated_at).getTime() > new Date(localTask.updated_at).getTime()) {
      db.runSync(
        `UPDATE tasks SET 
          title = ?,
          description = ?,
          status = ?,
          priority = ?,
          created_by = ?,
          due_date = ?,
          created_at = ?,
          updated_at = ?,
          synced = 1,
          sync_status_message = ''
        WHERE task_id = ?`,
        [
          normalizedTitle,
          normalizedDescription,
          normalizedStatus,
          normalizedPriority,
          created_by,
          normalizedDueDate,
          created_at,
          updated_at,
          task_id,
        ]
      );
      console.log(`✅ Local task ${task_id} updated and synced.`);
    } else {
      console.log(`ℹ️ Local task ${task_id} is newer or same, skipping update.`);
    }
  } else {
    db.runSync(
      `INSERT INTO tasks (
        task_id, title, description, status, priority,
        created_by, due_date, created_at, updated_at, synced, sync_status_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '')`,
      [
        task_id,
        normalizedTitle,
        normalizedDescription,
        normalizedStatus,
        normalizedPriority,
        created_by,
        normalizedDueDate,
        created_at,
        updated_at,
      ]
    );
    console.log(`➕ New local task ${task_id} inserted from server data.`);
  }
};