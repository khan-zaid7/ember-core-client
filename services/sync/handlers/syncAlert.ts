// // services/sync/handlers/syncAlert.ts
// import { getAlertById } from '@/services/models/AlertModel';
// import { sendAlertToServer } from '@/services/api/apiClient';

// export const syncAlert = async (alert_id: string): Promise<{
//   success: boolean;
//   status?: number;
//   conflict_field?: string;
//   latest_data?: any;
// }> => {
//   try {
//     const alert = getAlertById(alert_id);
//     if (!alert) {
//       console.warn('❌ Alert not found in local DB:', alert_id);
//       return { success: false };
//     }

//     console.log('✅ Alert data being sent:', alert);
//     await sendAlertToServer(alert);
//     return { success: true };

//   } catch (error: any) {
//     if (error.response?.status === 409) {
//       console.warn('⚠️ Conflict during alert sync:', error.response.data);
//       return {
//         success: false,
//         status: 409,
//         conflict_field: error.response.data.conflict_field,
//         latest_data: error.response.data.latest_data,
//       };
//     }

//     console.error('📛 Alert sync failed:', error.message);
//     return { success: false };
//   }
// };
