// services/sync/pullSyncManager.ts
import {
  pullAllDataFromServer,
  pullUsersFromServer,
  pullLocationsFromServer,
  pullSuppliesFromServer,
  pullTasksFromServer,
  pullRegistrationsFromServer,
  pullTaskAssignmentsFromServer,
  pullAlertsFromServer,
  pullNotificationsFromServer,
} from '../api/apiClient';
import {
  processBulkPullData,
  pullAndInsertUsers,
  pullAndInsertLocations,
  pullAndInsertSupplies,
  pullAndInsertTasks,
  pullAndInsertRegistrations,
  pullAndInsertTaskAssignments,
  pullAndInsertAlerts,
  pullAndInsertNotifications,
  PullResult,
} from './handlers/pullDataHandler';
import { showNotification } from '../../utils/notificationManager';

export interface PullSyncResult {
  success: boolean;
  results: { [key: string]: PullResult };
  errors: string[];
  totalInserted: number;
  totalUpdated: number;
  totalConflicts: number;
  totalDuplicatesResolved: number;
}

/**
 * Pull all data from server using bulk endpoint with smart conflict resolution
 */
export const performBulkPullSync = async (userId: string): Promise<PullSyncResult> => {
  const syncResult: PullSyncResult = {
    success: false,
    results: {},
    errors: [],
    totalInserted: 0,
    totalUpdated: 0,
    totalConflicts: 0,
    totalDuplicatesResolved: 0,
  };

  try {
    console.log('🔄 Starting smart bulk pull sync...');
    showNotification('Starting data sync...', 'info', 'Sync');

    // Pull all data from server
    const response = await pullAllDataFromServer(userId);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to pull data from server');
    }

    // Process and insert data into local database with smart conflict resolution
    const results = processBulkPullData(response.data, userId);
    syncResult.results = results;

    // Calculate totals
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalConflicts = 0;
    let totalDuplicatesResolved = 0;
    let hasErrors = false;

    for (const [entityType, result] of Object.entries(results)) {
      totalInserted += result.inserted;
      totalUpdated += result.updated;
      totalConflicts += result.conflicts;
      totalDuplicatesResolved += result.duplicatesResolved;
      
      if (!result.success) {
        hasErrors = true;
        syncResult.errors.push(`${entityType}: ${result.errors.join(', ')}`);
      }
    }

    syncResult.totalInserted = totalInserted;
    syncResult.totalUpdated = totalUpdated;
    syncResult.totalConflicts = totalConflicts;
    syncResult.totalDuplicatesResolved = totalDuplicatesResolved;
    syncResult.success = !hasErrors;

    // Show success notification with smart pull stats
    let message = `Sync completed! ${totalInserted} new items, ${totalUpdated} updated`;
    if (totalConflicts > 0) {
      message += `, ${totalConflicts} conflicts handled`;
    }
    if (totalDuplicatesResolved > 0) {
      message += `, ${totalDuplicatesResolved} duplicates resolved`;
    }
    
    showNotification(message, syncResult.success ? 'success' : 'warning', 'Smart Sync Complete');

    console.log('✅ Smart bulk pull sync completed:', {
      success: syncResult.success,
      inserted: totalInserted,
      updated: totalUpdated,
      conflicts: totalConflicts,
      duplicatesResolved: totalDuplicatesResolved,
      errors: syncResult.errors.length,
    });

    return syncResult;

  } catch (error: any) {
    console.error('❌ Smart bulk pull sync failed:', error);
    syncResult.errors.push(error.message);
    showNotification(`Sync failed: ${error.message}`, 'error', 'Sync Error');
    return syncResult;
  }
};

/**
 * Pull specific entity type from server with smart conflict resolution
 */
export const performEntityPullSync = async (
  userId: string,
  entityType: string
): Promise<PullSyncResult> => {
  const syncResult: PullSyncResult = {
    success: false,
    results: {},
    errors: [],
    totalInserted: 0,
    totalUpdated: 0,
    totalConflicts: 0,
    totalDuplicatesResolved: 0,
  };

  try {
    console.log(`🔄 Starting ${entityType} smart pull sync...`);
    
    let response;
    let result: PullResult;

    switch (entityType) {
      case 'users':
        response = await pullUsersFromServer(userId);
        result = pullAndInsertUsers(response.data, userId);
        break;

      case 'locations':
        response = await pullLocationsFromServer(userId);
        result = pullAndInsertLocations(response.data, userId);
        break;

      case 'supplies':
        response = await pullSuppliesFromServer(userId);
        result = pullAndInsertSupplies(response.data, userId);
        break;

      case 'tasks':
        response = await pullTasksFromServer(userId);
        result = pullAndInsertTasks(response.data, userId);
        break;

      case 'registrations':
        response = await pullRegistrationsFromServer(userId);
        result = pullAndInsertRegistrations(response.data, userId);
        break;

      case 'task_assignments':
        response = await pullTaskAssignmentsFromServer(userId);
        result = pullAndInsertTaskAssignments(response.data, userId);
        break;

      case 'alerts':
        response = await pullAlertsFromServer(userId);
        result = pullAndInsertAlerts(response.data, userId);
        break;

      case 'notifications':
        response = await pullNotificationsFromServer(userId);
        result = pullAndInsertNotifications(response.data, userId);
        break;

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    if (!response.success) {
      throw new Error(response.message || `Failed to pull ${entityType} from server`);
    }

    syncResult.results[entityType] = result;
    syncResult.totalInserted = result.inserted;
    syncResult.totalUpdated = result.updated;
    syncResult.totalConflicts = result.conflicts;
    syncResult.totalDuplicatesResolved = result.duplicatesResolved;
    syncResult.success = result.success;

    if (!result.success) {
      syncResult.errors = result.errors;
    }

    console.log(`✅ ${entityType} smart pull sync completed:`, {
      success: result.success,
      inserted: result.inserted,
      updated: result.updated,
      conflicts: result.conflicts,
      duplicatesResolved: result.duplicatesResolved,
      errors: result.errors.length,
    });

    return syncResult;

  } catch (error: any) {
    console.error(`❌ ${entityType} smart pull sync failed:`, error);
    syncResult.errors.push(error.message);
    return syncResult;
  }
};

/**
 * Check if pull sync is needed based on last sync time
 */
export const isPullSyncNeeded = (lastSyncTime?: string): boolean => {
  if (!lastSyncTime) return true;

  const now = new Date();
  const lastSync = new Date(lastSyncTime);
  const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

  // Pull sync needed if more than 1 hour since last sync
  return hoursSinceLastSync > 1;
};

/**
 * Get summary of smart pull sync results for display
 */
export const getPullSyncSummary = (syncResult: PullSyncResult): string => {
  if (!syncResult.success) {
    return `Sync failed: ${syncResult.errors.join(', ')}`;
  }

  const summary = [];
  
  if (syncResult.totalInserted > 0) {
    summary.push(`${syncResult.totalInserted} new items`);
  }
  
  if (syncResult.totalUpdated > 0) {
    summary.push(`${syncResult.totalUpdated} updated`);
  }

  if (syncResult.totalConflicts > 0) {
    summary.push(`${syncResult.totalConflicts} conflicts handled`);
  }

  if (syncResult.totalDuplicatesResolved > 0) {
    summary.push(`${syncResult.totalDuplicatesResolved} duplicates resolved`);
  }

  if (summary.length === 0) {
    return 'No changes found';
  }

  return `Smart sync completed: ${summary.join(', ')}`;
};
