export interface SyncQueueItem {
  entity_type: string;
  entity_id: string;
  conflict_field: string;
  status?: string;
  sync_id?: string;
  allowed_strategies?: string;
}

export interface ConflictData {
  entityType: string;
  entityId: string;
  conflictField: string;
  localData: Record<string, any>;
  serverData: Record<string, any>;
  conflict: SyncQueueItem;
  clientData: Record<string, any>;
}

export type ResolveStatus = "resolved" | "error" | "already_resolved";
