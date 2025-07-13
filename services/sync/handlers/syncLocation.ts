// services/sync/handlers/syncLocation.ts
import { getLocationById } from '@/services/models/LocationsModel';
import { sendLocationToServer } from '@/services/api/apiClient';

export const syncLocation = async (location_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
  allowed_strategies?: string[];
}> => {
  try {
    const location = getLocationById(location_id);
    if (!location) {
      console.warn('❌ Location not found in local DB:', location_id);
      return { success: false };
    }

    await sendLocationToServer(location);
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during location sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
        allowed_strategies: error.response.data.allowed_strategies,
      };
    }

    console.error('📛 Location sync failed:', error.message);
    return { success: false };
  }
};
