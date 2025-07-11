import { getPendingSyncItems, markSyncSuccess, markSyncFailed, makeConflict  } from '@/services/models/SyncQueueModel';
import { markEntitySynced } from '@/services/models/GenericModel';
import { syncEntity } from './entityDispatchers';


export const processSyncQueue = async () => {
  try {
    const pendingItems = await getPendingSyncItems();

    // ✅ Enforce order: sync parent entities first
    const priorityOrder = ['user', 'location', 'registration', 'supply', 'task', 'task_assignment', 'alert'];

    const sortedItems = pendingItems.sort((a, b) => {
      return priorityOrder.indexOf(a.entity_type) - priorityOrder.indexOf(b.entity_type);
    });

    for (const item of sortedItems) {
      try {
        const result = await syncEntity(item.entity_type, item.entity_id);

        if (result.success) {
          await markSyncSuccess(item.sync_id);
          await markEntitySynced(item.entity_type, item.entity_id);
        } else if (result.status === 409 && result.conflict_field && result.latest_data) {
          await makeConflict(item.sync_id, result.conflict_field, result.latest_data);
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
