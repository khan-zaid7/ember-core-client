import { db } from '../db';

export const getTaskAssignmentById = (assignment_id: string) => {
  return db.getFirstSync(
    'SELECT * FROM task_assignments WHERE assignment_id = ?',
    [assignment_id]
  );
};
