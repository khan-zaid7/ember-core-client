// services/api/apiClient.ts
import axios from 'axios';
import { insertNotification, checkExistingConflictNotification } from '../models/NotificationModel';
import { generateUUID } from '../../utils/generateUUID';
import { showNotification } from '../../utils/notificationManager';

// const API_BASE_URL = 'http://localhost:5000/api/sync'; 
const API_BASE_URL = 'https://ember-core-server.onrender.com/api/sync'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Helper function to handle conflict errors and create notifications
const handleConflictError = (error: any, entityType: string, entityData: any) => {
  if (error.response?.status === 409) {
    const errorMessage = `A conflict was detected while syncing ${entityType}: ${error.response.data?.message || 'Data already exists or has been modified'}`;
    
    // Create a unique conflict key based on entity type and ID
    // This helps us avoid duplicate notifications for the same conflict
    const entityId = entityData.id || entityData[`${entityType}_id`] || '';
    const conflictKey = `${entityType}_${entityId}_conflict`;
    
    // Create a notification for the conflict
    const notification = {
      notification_id: generateUUID(),
      user_id: entityData.user_id || '',
      title: 'Sync Conflict',
      message: errorMessage,
      type: 'warning',
      entity_type: entityType,
      entity_id: entityId,
      received_at: new Date().toISOString(),
      read: 0, // Keep as unread
      synced: 1, // This notification doesn't need to be synced as it's about a sync issue
      archived: 0,
      sync_status_message: `UI_SHOWN_${conflictKey}` // Include the conflict key to identify this specific conflict
    };
    
    // Check if we've already notified about this specific conflict in this session
    const hasExistingConflict = checkExistingConflictNotification(
      entityData.user_id || '',
      entityType,
      entityId,
      conflictKey
    );
    
    // Only notify if we haven't seen this exact conflict recently (within a day)
    if (!hasExistingConflict) {
      // Save to database
      insertNotification(notification);
      
      // Show immediate UI notification
      showNotification(errorMessage, 'warning', 'Sync Conflict');
    } else {
      console.log(`Skipping duplicate conflict notification for ${entityType} ${entityId}`);
    }
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
  throw error;
};

export const sendUserToServer = async (user: any) => {
  try {
    

    const response = await axios.post(`${API_BASE_URL}/user`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5s timeout
    });

    console.log('✅ User synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'user', user);
    }
    throw error;
  }
};

// 🧩 REGISTRATION
export const sendRegistrationToServer = async (registration: any) => {
  try {
    
    const response = await axiosInstance.post('/registration', registration);
    console.log('✅ Registration synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'registration', registration);
    }
    throw error;
  }
};

// 🧩 LOCATION
export const sendLocationToServer = async (location: any) => {
  try {
    
    const response = await axiosInstance.post('/location', location);
    console.log('✅ Location synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'location', location);
    }
    throw error;
  }
};

// 🧩 SUPPLY
export const sendSupplyToServer = async (supply: any) => {
  try {
    
    const response = await axiosInstance.post('/supply', supply);
    console.log('✅ Supply synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'supply', supply);
    }
    throw error;
  }
};

// 🧩 TASK
export const sendTaskToServer = async (task: any) => {
  try {
    
    const response = await axiosInstance.post('/task', task);
    console.log('✅ Task synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'task', task);
    }
    throw error;
  }
};

// 🧩 TASK ASSIGNMENT
export const sendTaskAssignmentToServer = async (assignment: any) => {
  try {
    
    const response = await axiosInstance.post('/task-assignment', assignment);
    console.log('✅ Task Assignment synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'task_assignment', assignment);
    }
    throw error;
  }
};

// 🧩 ALERT
export const sendAlertToServer = async (alert: any) => {
  try {
    
    const response = await axiosInstance.post('/alert', alert);
    console.log('✅ Alert synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'alert', alert);
    }
    throw error;
  }
};
// 🧩 NOTIFICATION
export const sendNotificationToServer = async (notification: any) => {
  try {
    
    const response = await axiosInstance.post('/notification', notification);
    console.log('✅ Notification synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'notification', notification);
    }
    throw error;
  }
};

// ===============================
// 🔄 CONFLICT RESOLUTION FUNCTIONS
// ===============================

interface ConflictResolutionRequest {
  resolution_strategy: 'client_wins' | 'server_wins' | 'merge' | 'update_data';
  clientData: any;
}

interface ConflictResolutionResponse {
  success: boolean;
  message: string;
  status: 'resolved' | 'error';
  resolvedData?: any;
}

// Generic conflict resolution function
const resolveConflict = async (
  entityType: string,
  entityId: string,
  entityIdField: string,
  request: ConflictResolutionRequest
): Promise<ConflictResolutionResponse> => {
  try {
    const payload = {
      [entityIdField]: entityId,
      resolution_strategy: request.resolution_strategy,
      clientData: request.clientData
    };

    const response = await axiosInstance.post(`/${entityType}/resolve-conflict`, payload);
    
    console.log(`✅ ${entityType} conflict resolved:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ ${entityType} conflict resolution failed:`, error.response?.data || error);
    
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || `Failed to resolve ${entityType} conflict`,
        status: 'error'
      };
    }
    
    throw error;
  }
};

// 🧩 USER CONFLICT RESOLUTION
export const resolveUserConflict = async (
  userId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'update_data',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('user', userId, 'user_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 REGISTRATION CONFLICT RESOLUTION
export const resolveRegistrationConflict = async (
  registrationId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('registration', registrationId, 'registration_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 SUPPLY CONFLICT RESOLUTION
export const resolveSupplyConflict = async (
  supplyId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('supply', supplyId, 'supply_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 TASK CONFLICT RESOLUTION
export const resolveTaskConflict = async (
  taskId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('task', taskId, 'task_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 TASK ASSIGNMENT CONFLICT RESOLUTION
export const resolveTaskAssignmentConflict = async (
  assignmentId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('task-assignment', assignmentId, 'assignment_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 LOCATION CONFLICT RESOLUTION
export const resolveLocationConflict = async (
  locationId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('location', locationId, 'location_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 ALERT CONFLICT RESOLUTION
export const resolveAlertConflict = async (
  alertId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('alert', alertId, 'alert_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🧩 NOTIFICATION CONFLICT RESOLUTION
export const resolveNotificationConflict = async (
  notificationId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  return resolveConflict('notification', notificationId, 'notification_id', {
    resolution_strategy: strategy,
    clientData
  });
};

// 🔄 UNIFIED CONFLICT RESOLUTION FUNCTION
// This function automatically determines the correct resolver based on entity type
export const resolveEntityConflict = async (
  entityType: string,
  entityId: string,
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'update_data',
  clientData: any
): Promise<ConflictResolutionResponse> => {
  switch (entityType.toLowerCase()) {
    case 'user':
      return resolveUserConflict(entityId, strategy, clientData);
    
    case 'registration':
      return resolveRegistrationConflict(entityId, strategy as any, clientData);
    
    case 'supply':
      return resolveSupplyConflict(entityId, strategy as any, clientData);
    
    case 'task':
      return resolveTaskConflict(entityId, strategy as any, clientData);
    
    case 'task_assignment':
      return resolveTaskAssignmentConflict(entityId, strategy as any, clientData);
    
    case 'location':
      return resolveLocationConflict(entityId, strategy as any, clientData);
    
    case 'alert':
      return resolveAlertConflict(entityId, strategy as any, clientData);
    
    case 'notification':
      return resolveNotificationConflict(entityId, strategy as any, clientData);
    
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
};