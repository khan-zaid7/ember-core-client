// Field display configuration per entity type
export const DISPLAY_FIELDS: Record<string, string[]> = {
  user: [
    'user_id', 'name', 'email', 'phone_number', 'location', 'image_url', 'updated_at'
  ],
  users: [
    'user_id', 'name', 'email', 'phone_number', 'location', 'image_url', 'updated_at'
  ],
  registrations: [
    'registration_id', 'person_name', 'age', 'gender', 'location_id', 'timestamp', 'updated_at'
  ],
  supplies: [
    'supply_id', 'item_name', 'quantity', 'expiry_date', 'location_id', 'timestamp', 'updated_at', 'status', 'barcode', 'sku'
  ],
  tasks: [
    'task_id', 'title', 'description', 'status', 'priority', 'due_date', 'created_at', 'updated_at'
  ],
  task_assignments: [
    'assignment_id', 'task_id', 'user_id', 'assigned_at', 'status', 'feedback', 'updated_at'
  ],
  locations: [
    'location_id', 'user_id', 'name', 'type', 'latitude', 'longitude', 'added_at', 'description', 'updated_at'
  ],
  alerts: [
    'alert_id', 'user_id', 'type', 'location_id', 'description', 'priority', 'timestamp', 'updated_at', 'sent_via'
  ],
  notifications: [
    'notification_id', 'user_id', 'title', 'message', 'type', 'entity_type', 'entity_id', 'received_at', 'updated_at'
  ]
};

// Get filtered fields for display
export const getDisplayFields = (entityType: string, clientData: Record<string, any>, serverData: Record<string, any>): string[] => {
  const displayFields = DISPLAY_FIELDS[entityType.toLowerCase()] || [];
  const allAvailableFields = Array.from(
    new Set([
      ...Object.keys(clientData || {}),
      ...Object.keys(serverData || {}),
    ])
  );
  
  return displayFields.length > 0 
    ? displayFields.filter(f => allAvailableFields.includes(f))
    : allAvailableFields;
};

// Get unique constraint fields from conflict data
export const getUniqueConstraintFields = (conflictField: string, status: string): string[] => {
  if (!conflictField) return [];
  
  const isUniqueConstraint =
    status === 'unique_constraint_violation' ||
    conflictField.includes('unique_constraint') ||
    // Email conflicts are usually unique constraint violations
    (conflictField === 'email' && status === 'conflict');
  
  if (!isUniqueConstraint) return [];
  
  // Handle different conflict_field formats
  let fieldString = conflictField;
  if (fieldString.includes('unique_constraint:')) {
    fieldString = fieldString.replace('unique_constraint:', '');
  }
  
  return fieldString
    .split(',')
    .map((field: string) => field.trim())
    .filter((field: string) => field.length > 0);
};

// Get conflicting fields for highlighting
export const getConflictFields = (conflictField: string, uniqueConstraintFields: string[]): string[] => {
  if (conflictField?.includes('unique_constraint:')) {
    return uniqueConstraintFields;
  }
  return conflictField ? conflictField.split(',').map(f => f.trim()) : [];
};
