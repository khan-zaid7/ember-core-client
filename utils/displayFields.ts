export const entityFieldMap: { [entityType: string]: string[] } = {
  user: ['name', 'email', 'phone_number', 'role', 'location'],
  registration: ['person_name', 'age', 'gender', 'location_id', 'timestamp'],
  supply: ['item_name', 'quantity', 'expiry_date', 'location_id'],
  task: ['title', 'description', 'status', 'priority', 'due_date'],
  task_assignment: ['status', 'feedback', 'assigned_at'],
  location: ['name', 'type', 'latitude', 'longitude', 'description'],
  alert: ['type', 'description', 'priority', 'location_id', 'timestamp'],
};
