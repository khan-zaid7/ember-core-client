// services/models/GenericModel.ts
import { db } from "../db";

const tableMetadata: Record<string, { table: string; id: string }> = {
  user: { table: 'users', id: 'user_id' },
  registration: { table: 'registrations', id: 'registration_id' },
  supply: { table: 'supplies', id: 'supply_id' },
  task: { table: 'tasks', id: 'task_id' },
  task_assignment: { table: 'task_assignments', id: 'assignment_id' },
  location: { table: 'locations', id: 'location_id' },
  alert: { table: 'alerts', id: 'alert_id' },
};

export const markEntitySynced = (
  entity_type: string,
  entity_id: string,
  statusMessage = 'Synced successfully'
) => {
  const meta = tableMetadata[entity_type];

  if (!meta) {
    throw new Error(`Unknown entity_type: ${entity_type}`);
  }

  const { table, id } = meta;

  try {
    db.runSync(
      `UPDATE ${table} SET synced = 1, sync_status_message = ? WHERE ${id} = ?`,
      [statusMessage, entity_id]
    );
  } catch (error) {
    console.error(`Failed to mark entity as synced: ${entity_type} - ${entity_id}`, error);
  }
};
