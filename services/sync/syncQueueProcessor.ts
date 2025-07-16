import { getPendingSyncItems, markSyncSuccess, markSyncFailed, makeConflict, getAllSyncItems  } from '@/services/models/SyncQueueModel';
import { markEntitySynced } from '@/services/models/GenericModel';
import { syncEntity } from './entityDispatchers';

/**
 * Handle ID mapping when server returns a different ID than client
 * This implements Option A - immediate ID updates
 */
const handleIdMapping = async (entityType: string, clientId: string, serverId: string) => {
  try {
    console.log(`🔄 Processing ID mapping: ${entityType} ${clientId} -> ${serverId}`);
    
    // TODO: Implement ID mapping logic based on entity type
    // For now, just log the mapping - we'll implement the actual mapping in the next step
    console.log(`📝 ID mapping logged: ${entityType} ${clientId} -> ${serverId}`);
    
    // In the next step, we'll add:
    // 1. Update local database records
    // 2. Update sync queue entries
    // 3. Update any references in other entities
    
    return true;
  } catch (error) {
    console.error(`❌ ID mapping failed for ${entityType} ${clientId} -> ${serverId}:`, error);
    return false;
  }
};

// Singleton pattern to prevent multiple sync instances
let isSyncRunning = false;
let syncPromise: Promise<void> | null = null;

// Accept userId as a parameter
export const processSyncQueue = async (userId: string): Promise<void> => {
  // Check if sync is already running
  if (isSyncRunning) {
    console.log('⏳ Sync already in progress, waiting for completion...');
    if (syncPromise) {
      await syncPromise; // Wait for existing sync to complete
    }
    return;
  }

  // Set sync running flag
  isSyncRunning = true;
  
  // Create the sync promise
  syncPromise = performSync(userId);
  
  try {
    await syncPromise;
  } finally {
    // Always reset flags when done
    isSyncRunning = false;
    syncPromise = null;
  }
};

// The actual sync logic separated into its own function
const performSync = async (userId: string): Promise<void> => {
  try {
    const pendingItems = await getPendingSyncItems(userId);

    // ✅ Enforce order: sync parent entities first
    const priorityOrder = ['user', 'location', 'registration', 'supply', 'task', 'task_assignment', 'alert'];

    const sortedItems = pendingItems.sort((a, b) => {
      return priorityOrder.indexOf(a.entity_type) - priorityOrder.indexOf(b.entity_type);
    });
    
    const temp = await getAllSyncItems(userId);
    for (const item of sortedItems) {
      try {
        const result = await syncEntity(item.entity_type, item.entity_id);

        if (result.success) {
          // Handle ID mapping if required
          if (result.idMappingRequired && result.clientId && result.serverId) {
            const mappingSuccess = await handleIdMapping(
              item.entity_type, 
              result.clientId!, // Type assertion - we checked above
              result.serverId!  // Type assertion - we checked above
            );
            
            if (!mappingSuccess) {
              console.warn(`⚠️ ID mapping failed but sync succeeded for ${item.entity_type} ${item.entity_id}`);
            }
          }
          
          await markSyncSuccess(item.sync_id);
          await markEntitySynced(item.entity_type, item.entity_id);
        } else if (result.status === 409 && result.conflict_field && result.latest_data) {
          // Store ID mapping info in conflict for later resolution
          await makeConflict(
            item.sync_id, 
            result.conflict_field!, // Type assertion - we checked above
            result.latest_data, 
            result.allowed_strategies
          );
          
          // Log ID mapping info for manual tracking (for now)
          if (result.idMappingRequired && result.clientId && result.serverId) {
            console.log(`📝 Conflict with ID mapping: ${result.entityType} ${result.clientId} -> ${result.serverId}`);
          }
        } else {
          await markSyncFailed(item.sync_id);
        }
      } catch (error) {
        console.error(`❌ Sync failed for ${item.entity_type} (${item.entity_id}):`, error);
        await markSyncFailed(item.sync_id);
      }
    }
  } catch (error) {
    console.error('❌ Sync Queue Processing failed:', error);
  }
};
