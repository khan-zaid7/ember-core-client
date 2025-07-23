import { generateUUID } from './../../utils/generateUUID';
// services/sync/downSyncQueueProcessor.ts

import axios from 'axios';
import { User, reconcileUserAfterServerUpdate } from '../models/UserModel';
import { reconcileTaskAfterServerUpdate, Task } from '../models/TaskModel';
import { TaskAssignment, reconcileTaskAssignmentAfterServerUpdate } from '../models/TaskAssignmentModel';
import { Supply, reconcileSupplyAfterServerUpdate } from '../models/SuppliesModel';
import { Registration, reconcileRegistrationAfterServerUpdate } from '../models/RegistrationModel';
import { Location, reconcileLocationAfterServerUpdate } from '../models/LocationsModel';
import { insertNotification } from '../models/NotificationModel';
import { showNotification } from '@/utils/notificationManager';


const API_BASE_URL = 'https://ember-core-server.onrender.com/api/down-sync';

const downsyncAxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});


/**
 * Master function to downsync all relevant data for a specific user.
 */
export const downsyncAllDataForUser = async (userId: string) => {
  try {
    console.log(`🚀 Starting full downsync for user ${userId}...`);

    await fetchUserFromServer(userId);
    await fetchAllLocationsFromServer();
    await fetchTasksCreatedByUserFromServer(userId);
    await fetchTaskAssignmentsForUserFromServer(userId);
    await fetchAllSuppliesFromServer();
    await fetchRegisteredPatientsForUserFromServer(userId);
    await fetchAllFieldworkersFromServer();

    console.log('✅ Full downsync completed successfully.');
  } catch (error) {
    console.error('❌ Full downsync failed:', error);
    throw error;
  }
};

/**
 * Fetches the current user's profile data from the server.
 */
export const fetchUserFromServer = async (userId: string) => {
    try {
        console.log(`⬇️ Fetching user profile for ${userId} from server...`);
        const response = await downsyncAxiosInstance.get(`/users/${userId}`);
        const serverUserData: User = response.data.user; // Assuming response.data.user matches your User interface

        console.log('✅ User profile fetched:', serverUserData);

        // Use the previous function to update the local user
        await reconcileUserAfterServerUpdate(serverUserData);
        console.log(`✨ User ${userId} successfully fetched and reconciled locally.`);

        // No return statement needed
    } catch (error) {
        console.error(`❌ Failed to fetch user profile for ${userId}:`, error);
        throw error;
    }
};

/**
 * Fetches all locations from the server.
 */
export const fetchAllLocationsFromServer = async (): Promise<Location[]> => {
  try {
    console.log('⬇️ Fetching all locations from server...');
    const response = await downsyncAxiosInstance.get<{ locations: Location[] }>('/locations');
    const locations = response.data.locations;
    console.log('✅ Locations fetched:', locations.length);

    // Reconcile each location locally
    for (const location of locations) {
      await reconcileLocationAfterServerUpdate(location);
    }

    return locations;
  } catch (error) {
    console.error('❌ Failed to fetch all locations:', error);
    throw error;
  }
};
/**
 * Fetches all tasks created by a specific user from the server.
 */

export const fetchTasksCreatedByUserFromServer = async (userId: string) => {
  try {
    console.log(`⬇️ Fetching tasks created by ${userId} from server...`);
    const response = await downsyncAxiosInstance.get(`/tasks/created-by/${userId}`);

    const tasks: Task[] = response.data.tasks || [];
    console.log(`✅ Tasks created by user fetched: ${tasks.length}`);

    // Reconcile each task locally
    for (const task of tasks) {
      try {
        await reconcileTaskAfterServerUpdate(task);
      } catch (err) {
        console.error(`❌ Failed to reconcile task ${task.task_id}:`, err);
      }
    }

    return tasks;
  } catch (error) {
    console.error(`❌ Failed to fetch tasks created by ${userId}:`, error);
    throw error;
  }
};


export const fetchTaskAssignmentsForUserFromServer = async (userId: string) => {
  try {
    console.log(`⬇️ Fetching task assignments for ${userId} from server...`);
    const response = await downsyncAxiosInstance.get(`/task-assignments/by-user/${userId}`);

    const assignments: TaskAssignment[] = response.data.assignments || [];
    console.log(`✅ Task assignments fetched: ${assignments.length}`);

    let notificationDelay = 0; // ms delay to stagger notifications

    for (const assignment of assignments) {
      try {
        // Reconcile the embedded task object first (if present)
        if (assignment.task) {
          try {
            await reconcileTaskAfterServerUpdate(assignment.task);
            console.log('yes a task got created!')
          } catch (err) {
            console.error(`⚠️ Failed to reconcile task ${assignment.task.task_id} from assignment:`, err);
          }
        }

        // Then reconcile the task assignment itself
        const result = await reconcileTaskAssignmentAfterServerUpdate(assignment);

        // Determine if this assignment is newly added or updated to notify user
        if (result?.isNew || result?.shouldNotify) {
          const notification = {
            notification_id: generateUUID(),
            user_id: assignment.user_id,
            title: 'New Task Assigned',
            message: assignment.task?.title
              ? `You have been assigned to: ${assignment.task.title}`
              : `You have been assigned to task: ${assignment.task_id}`,
            type: 'info',
            entity_type: 'task_assignment',
            entity_id: assignment.assignment_id,
            received_at: new Date().toISOString(),
            read: 0,
            synced: 1,
            archived: 0,
            sync_status_message: `UI_SHOWN_task_assignment_${assignment.assignment_id}`
          };

          setTimeout(() => {
            insertNotification(notification);
            showNotification(notification.message, 'info', notification.title);
            console.log(`🔔 Notification shown for task assignment: ${assignment.assignment_id}`);
          }, notificationDelay);

          notificationDelay += 500; // Increase delay for next notification
        }
      } catch (err) {
        console.error(`❌ Failed to reconcile assignment ${assignment.assignment_id}:`, err);
      }
    }

    return assignments;
  } catch (error) {
    console.error(`❌ Failed to fetch task assignments for ${userId}:`, error);
    throw error;
  }
};


/**
 * Fetches all supplies from the server.
 */


export const fetchAllSuppliesFromServer = async (): Promise<Supply[]> => {
  try {
    console.log('⬇️ Fetching all supplies from server...');
    const response = await downsyncAxiosInstance.get<{ supplies: Supply[] }>('/supplies');
    const supplies = response.data.supplies;
    console.log('✅ Supplies fetched:', supplies.length);

    for (const supply of supplies) {
      await reconcileSupplyAfterServerUpdate(supply);
    }
    console.log('✨ All supplies reconciled locally.');
    return supplies;
  } catch (error) {
    console.error('❌ Failed to fetch all supplies:', error);
    throw error;
  }
};
/**
 * Fetches all registered patients (registrations) for a specific user from the server.
 */
export const fetchRegisteredPatientsForUserFromServer = async (userId: string): Promise<Registration[]> => {
  try {
    console.log(`⬇️ Fetching registered patients for ${userId} from server...`);
    const response = await downsyncAxiosInstance.get(`/registrations/by-user/${userId}`);

    const serverRegistrations: Registration[] = response.data.patients;

    console.log('✅ Registered patients fetched:', serverRegistrations.length);

    // Reconcile each registration locally
    for (const reg of serverRegistrations) {
      await reconcileRegistrationAfterServerUpdate(reg);
    }

    return serverRegistrations;
  } catch (error) {
    console.error(`❌ Failed to fetch registered patients for ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetches all fieldworkers from the server and reconciles them locally.
 */
export const fetchAllFieldworkersFromServer = async (): Promise<void> => {
  try {
    console.log('⬇️ Fetching all fieldworkers from server...');
    const response = await downsyncAxiosInstance.get('/users/field-workers');
    // Assuming your backend API supports filtering by role via query param, adjust if different

    const serverFieldworkers: User[] = response.data.users; 
    // Assuming the API response shape is { users: User[] }

    if (!Array.isArray(serverFieldworkers)) {
      throw new Error('Invalid server response format for fieldworkers');
    }

    console.log(`✅ Fetched ${serverFieldworkers.length} fieldworkers.`);

    // Reconcile each user with local DB
    for (const user of serverFieldworkers) {
      await reconcileUserAfterServerUpdate(user);
    }

    console.log('✨ All fieldworkers successfully reconciled locally.');
  } catch (error) {
    console.error('❌ Failed to fetch fieldworkers:', error);
    throw error;
  }
};