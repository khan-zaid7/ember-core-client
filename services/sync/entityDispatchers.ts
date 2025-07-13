// services/sync/entityDispatchers.ts

import { syncUser } from './handlers/syncUser';
import { syncRegistration } from './handlers/syncRegistration';
import { syncSupply } from './handlers/syncSupply';
import { syncTask } from './handlers/syncTask';
import { syncTaskAssignment } from './handlers/syncTaskAssignment';
import { syncLocation } from './handlers/syncLocation';
// import { syncAlert } from './handlers/syncAlert';

export const syncEntity = async (
    entity_type: string,
    entity_id: string
): Promise<{
    success: boolean;
    status?: number;
    conflict_field?: string;
    latest_data?: any;
    allowed_strategies?: string[];
}> => {
    switch (entity_type) {
        case 'user':
            return await syncUser(entity_id);
        case 'registration':
          return await syncRegistration(entity_id);
        case 'supply':
          return await syncSupply(entity_id);
        case 'task':
          return await syncTask(entity_id);
        case 'task_assignment':
          return await syncTaskAssignment(entity_id);
        case 'location':
          return await syncLocation(entity_id);
        // case 'alert':
        //   return await syncAlert(entity_id);

        default:
            console.warn(`⚠️ Unknown entity_type: ${entity_type}`);
            return { success: false };
    }
};
