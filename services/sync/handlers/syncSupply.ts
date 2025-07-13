// services/sync/handlers/syncSupply.ts
import { getSupplyById } from '@/services/models/SuppliesModel';
import { sendSupplyToServer } from '@/services/api/apiClient';

export const syncSupply = async (supply_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
  allowed_strategies?: string[];
}> => {
  try {
    const supply = getSupplyById(supply_id);
    if (!supply) {
      console.warn('❌ Supply not found in local DB:', supply_id);
      return { success: false };
    }

    await sendSupplyToServer(supply);
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during supply sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
        allowed_strategies: error.response.data.allowed_strategies,
      };
    }

    console.error('📛 Supply sync failed:', error.message);
    return { success: false };
  }
};
