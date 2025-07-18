import { getPendingSyncItems, markSyncSuccess, markSyncFailed, makeConflict, getAllSyncItems  } from '@/services/models/SyncQueueModel';
import { markEntitySynced } from '@/services/models/GenericModel';
import { syncEntity } from './entityDispatchers';
import { db } from '@/services/db';
import { getSessionFromDB, saveSessionToDB } from '@/services/models/SessionModel';
import { downsyncAllDataForUser } from './downSyncQueueProcessor';

// Import for AuthContext updates
let authContextUpdateFunction: ((newUserId: string) => Promise<void>) | null = null;

// Function to set the auth context updater (called from a React component)
export const setAuthContextUpdater = (updateFunction: (newUserId: string) => Promise<void>) => {
  authContextUpdateFunction = updateFunction;
};

/**
 * Handle ID mapping when server returns a different ID than client
 * This implements Option A - immediate ID updates
 */
export const handleIdMapping = async (entityType: string, clientId: string, serverId: string) => {
  try {
    console.log(`🔄 Processing ID mapping: ${entityType} ${clientId} -> ${serverId}`);
    
    // Entity type to table mapping
    const entityTableMap: Record<string, { table: string; idField: string }> = {
      user: { table: 'users', idField: 'user_id' },
      registration: { table: 'registrations', idField: 'registration_id' },
      supply: { table: 'supplies', idField: 'supply_id' },
      task: { table: 'tasks', idField: 'task_id' },
      task_assignment: { table: 'task_assignments', idField: 'assignment_id' },
      location: { table: 'locations', idField: 'location_id' },
      alert: { table: 'alerts', idField: 'alert_id' },
    };

    const entityInfo = entityTableMap[entityType.toLowerCase()];
    if (!entityInfo) {
      console.error(`❌ Unknown entity type for ID mapping: ${entityType}`);
      return false;
    }

    const { table, idField } = entityInfo;

    // Step 1: Update the primary entity record
    const updateResult = db.runSync(
      `UPDATE ${table} SET ${idField} = ? WHERE ${idField} = ?`,
      [serverId, clientId]
    );

    if (updateResult.changes === 0) {
      console.warn(`⚠️ No records updated for ${entityType} ${clientId} -> ${serverId}`);
      return false;
    }

    console.log(`✅ Updated ${entityType} record: ${clientId} -> ${serverId}`);

    // Step 2: Update session storage and AuthContext if this is a user ID change
    if (entityType.toLowerCase() === 'user') {
      try {
        // Update session storage
        const currentSession = getSessionFromDB();
        if (currentSession && currentSession.user_id === clientId) {
          const updatedSession = { ...currentSession, user_id: serverId };
          saveSessionToDB(updatedSession);
          console.log(`✅ Session storage updated for user ID change: ${clientId} -> ${serverId}`);
        }

        // Update AuthContext
        if (authContextUpdateFunction) {
          await authContextUpdateFunction(serverId);
          console.log(`✅ AuthContext updated for user ID change: ${clientId} -> ${serverId}`);
        }
      } catch (error) {
        console.error('❌ Failed to update session/AuthContext:', error);
        // Don't fail the entire mapping process for this
      }
    }

    // Step 3: Update foreign key references in other tables
    await updateForeignKeyReferences(entityType, clientId, serverId);

    // Step 4: Update sync queue entries
    await updateSyncQueueReferences(entityType, clientId, serverId);

    console.log(`📝 ID mapping completed: ${entityType} ${clientId} -> ${serverId}`);
    return true;

  } catch (error) {
    console.error(`❌ ID mapping failed for ${entityType} ${clientId} -> ${serverId}:`, error);
    return false;
  }
};

/**
 * Update foreign key references when an entity ID changes
 */
const updateForeignKeyReferences = async (entityType: string, oldId: string, newId: string) => {
  try {
    // Define foreign key relationships
    const foreignKeyUpdates: { table: string; column: string; condition?: string }[] = [];

    switch (entityType.toLowerCase()) {
      case 'user':
        foreignKeyUpdates.push(
          { table: 'registrations', column: 'user_id' },
          { table: 'supplies', column: 'user_id' },
          { table: 'tasks', column: 'created_by' },
          { table: 'task_assignments', column: 'user_id' },
          { table: 'locations', column: 'user_id' },
          { table: 'alerts', column: 'user_id' },
          { table: 'sessions', column: 'user_id' },
          { table: 'notifications', column: 'user_id' }
        );
        break;

      case 'location':
        foreignKeyUpdates.push(
          { table: 'registrations', column: 'location_id' },
          { table: 'supplies', column: 'location_id' },
          { table: 'alerts', column: 'location_id' }
        );
        break;

      case 'task':
        foreignKeyUpdates.push(
          { table: 'task_assignments', column: 'task_id' }
        );
        break;

      // Add more cases as needed for other entity types
    }

    // Execute foreign key updates
    for (const update of foreignKeyUpdates) {
      const result = db.runSync(
        `UPDATE ${update.table} SET ${update.column} = ? WHERE ${update.column} = ?`,
        [newId, oldId]
      );
      
      if (result.changes > 0) {
        console.log(`✅ Updated ${result.changes} foreign key references in ${update.table}.${update.column}`);
      }
    }

  } catch (error) {
    console.error(`❌ Failed to update foreign key references for ${entityType}:`, error);
    throw error;
  }
};

/**
 * Update sync queue entries when an entity ID changes
 */
const updateSyncQueueReferences = async (entityType: string, oldId: string, newId: string) => {
  try {
    // Update sync queue entries for this entity
    const result = db.runSync(
      `UPDATE sync_queue SET entity_id = ? WHERE entity_type = ? AND entity_id = ?`,
      [newId, entityType, oldId]
    );

    if (result.changes > 0) {
      console.log(`✅ Updated ${result.changes} sync queue entries for ${entityType}`);
    }

    // Update sync queue created_by field if this is a user ID change
    if (entityType.toLowerCase() === 'user') {
      const createdByResult = db.runSync(
        `UPDATE sync_queue SET created_by = ? WHERE created_by = ?`,
        [newId, oldId]
      );

      if (createdByResult.changes > 0) {
        console.log(`✅ Updated ${createdByResult.changes} sync queue created_by references`);
      }
    }

    // Update conflict data that might reference the old ID
    const conflictResult = db.runSync(
      `UPDATE sync_queue SET latest_data = REPLACE(latest_data, '"${oldId}"', '"${newId}"') 
       WHERE entity_type = ? AND status = 'conflict' AND latest_data LIKE '%"${oldId}"%'`,
      [entityType]
    );

    if (conflictResult.changes > 0) {
      console.log(`✅ Updated ${conflictResult.changes} conflict data entries for ${entityType}`);
    }

  } catch (error) {
    console.error(`❌ Failed to update sync queue references for ${entityType}:`, error);
    throw error;
  }
};

// Singleton pattern to prevent multiple sync instances
let isSyncRunning = false;
let syncPromise: Promise<boolean> | null = null;

// Accept userId as a parameter
export const processSyncQueue = async (userId: string): Promise<void> => {
  if (isSyncRunning) {
    console.log('⏳ Sync already in progress, waiting for completion...');
    if (syncPromise) {
      const success = await syncPromise;
      if (success) {
        console.log('✅ Sync (waited) successful, running downsync...');
        await downsyncAllDataForUser(userId);
      } else {
        console.warn('⚠️ Sync (waited) failed, skipping downsync.');
      }
    }
    return;
  }

  isSyncRunning = true;
  syncPromise = performSync(userId);

  try {
    const success = await syncPromise;
    if (success) {
      console.log('✅ Sync successful, running downsync...');
      await downsyncAllDataForUser(userId);
    } else {
      console.warn('⚠️ Sync failed or had conflict, skipping downsync.');
    }
  } finally {
    isSyncRunning = false;
    syncPromise = null;
  }
};
// The actual sync logic separated into its own function
export const performSync = async (userId: string): Promise<boolean> => {
  try {
    const pendingItems = await getPendingSyncItems(userId);

    // Priority order for syncing entities
    const priorityOrder = ['user', 'location', 'registration', 'supply', 'task', 'task_assignment', 'alert'];

    const sortedItems = pendingItems.sort(
      (a, b) => priorityOrder.indexOf(a.entity_type) - priorityOrder.indexOf(b.entity_type)
    );

    let allSuccess = true; // Track overall sync success

    for (const item of sortedItems) {
      try {
        const result = await syncEntity(item.entity_type, item.entity_id);

        if (result.success) {
          // Handle ID mapping if needed
          if (result.idMappingRequired && result.clientId && result.serverId) {
            const mappingSuccess = await handleIdMapping(
              item.entity_type,
              result.clientId,
              result.serverId
            );

            if (!mappingSuccess) {
              console.warn(`⚠️ ID mapping failed but sync succeeded for ${item.entity_type} ${item.entity_id}`);
            }
          }

          await markSyncSuccess(item.sync_id);
          await markEntitySynced(item.entity_type, item.entity_id);

        } else if (result.status === 409 && result.conflict_field && result.latest_data) {
          // Conflict - mark conflict and treat as failure for downsync logic
          await makeConflict(
            item.sync_id,
            result.conflict_field,
            result.latest_data,
            result.allowed_strategies
          );

          if (result.idMappingRequired && result.clientId && result.serverId) {
            console.log(`📝 Conflict with ID mapping: ${result.entityType} ${result.clientId} -> ${result.serverId}`);
          }

          allSuccess = false; // conflict means not fully successful

        } else {
          await markSyncFailed(item.sync_id);
          allSuccess = false; // failure means overall failure
        }

      } catch (error) {
        console.error(`❌ Sync failed for ${item.entity_type} (${item.entity_id}):`, error);
        await markSyncFailed(item.sync_id);
        allSuccess = false; // error means overall failure
      }
    }

    return allSuccess;

  } catch (error) {
    console.error('❌ Sync Queue Processing failed:', error);
    return false; // error means failure
  }
};
