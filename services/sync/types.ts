// services/sync/types.ts

/**
 * Standard sync response from server
 */
export interface SyncResponse {
  success: boolean;
  status?: number;
  message?: string;
  
  // Conflict-related fields
  conflict_field?: string;
  conflict_type?: 'unique_constraint' | 'potential_duplicate_account' | 'potential_duplicate_registration' | 'potential_duplicate_location' | 'potential_duplicate_task' | 'potential_duplicate_supply';
  latest_data?: any;
  allowed_strategies?: string[];
  
  // ID mapping fields (Option A implementation)
  client_id?: string;
  server_id?: string;
  
  // Auto-resolve success cases
  resolved_as?: 'same_user_detected' | 'same_person_detected' | 'same_location_detected' | 'same_task_detected' | 'same_supply_detected';
  server_user_id?: string;
  server_registration_id?: string;
  server_location_id?: string;
  server_task_id?: string;
  server_supply_id?: string;
  server_assignment_id?: string;
}

/**
 * Conflict resolution request payload
 */
export interface ConflictResolutionRequest {
  [key: string]: string; // entity_id field name varies (user_id, registration_id, etc.)
  resolution_strategy: string;
  clientData: any;
}

/**
 * Processed sync result for internal use
 */
export interface ProcessedSyncResult {
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
  allowed_strategies?: string[];
  
  // ID mapping information
  idMappingRequired?: boolean;
  clientId?: string;
  serverId?: string;
  entityType?: string;
}
