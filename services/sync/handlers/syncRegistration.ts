// services/sync/handlers/syncRegistration.ts
import { getRegistrationById } from '@/services/models/RegistrationModel';
import { sendRegistrationToServer } from '@/services/api/apiClient';

export const syncRegistration = async (registration_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
}> => {
  try {
    const registration = getRegistrationById(registration_id);
    if (!registration) {
      console.warn('❌ Registration not found in local DB:', registration_id);
      return { success: false };
    }

    await sendRegistrationToServer(registration);
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during registration sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
      };
    }

    console.error('📛 Registration sync failed:', error.message);
    return { success: false };
  }
};
