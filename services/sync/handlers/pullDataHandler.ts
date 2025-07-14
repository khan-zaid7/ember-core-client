// services/sync/handlers/pullDataHandler.ts
import { db } from '../../db';
import { smartUpsertPulledData, SmartPullResult } from './smartPullHandler';

export interface PullDataResponse {
  success: boolean;
  message: string;
  data: any[];
}

export interface PullResult {
  success: boolean;
  inserted: number;
  updated: number;
  conflicts: number;
  duplicatesResolved: number;
  errors: string[];
}

/**
 * Convert SmartPullResult to PullResult
 */
const convertSmartResult = (smartResult: SmartPullResult): PullResult => {
  return {
    success: smartResult.success,
    inserted: smartResult.inserted,
    updated: smartResult.updated,
    conflicts: smartResult.conflicts,
    duplicatesResolved: smartResult.duplicatesResolved,
    errors: smartResult.errors
  };
};

/**
 * Smart upsert function that uses intelligent conflict resolution
 */
export const upsertPulledData = (
  tableName: string,
  data: any[],
  primaryKey: string,
  currentUserId: string
): PullResult => {
  console.log(`🧠 Starting smart pull for ${tableName} with ${data.length} items`);
  
  const smartResult = smartUpsertPulledData(tableName, data, primaryKey, currentUserId);
  return convertSmartResult(smartResult);
};

/**
 * Pull and insert users (universal data) - with smart conflict resolution
 */
export const pullAndInsertUsers = (usersData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('users', usersData, 'user_id', currentUserId);
};

/**
 * Pull and insert locations (universal data) - with smart conflict resolution
 */
export const pullAndInsertLocations = (locationsData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('locations', locationsData, 'location_id', currentUserId);
};

/**
 * Pull and insert supplies (universal data) - with smart conflict resolution
 */
export const pullAndInsertSupplies = (suppliesData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('supplies', suppliesData, 'supply_id', currentUserId);
};

/**
 * Pull and insert tasks (universal data) - with smart conflict resolution
 */
export const pullAndInsertTasks = (tasksData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('tasks', tasksData, 'task_id', currentUserId);
};

/**
 * Pull and insert registrations (user-specific data) - with smart conflict resolution
 */
export const pullAndInsertRegistrations = (registrationsData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('registrations', registrationsData, 'registration_id', currentUserId);
};

/**
 * Pull and insert task assignments (user-specific data) - with smart conflict resolution
 */
export const pullAndInsertTaskAssignments = (taskAssignmentsData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('task_assignments', taskAssignmentsData, 'assignment_id', currentUserId);
};

/**
 * Pull and insert alerts (user-specific data) - with smart conflict resolution
 */
export const pullAndInsertAlerts = (alertsData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('alerts', alertsData, 'alert_id', currentUserId);
};

/**
 * Pull and insert notifications (user-specific data) - with smart conflict resolution
 */
export const pullAndInsertNotifications = (notificationsData: any[], currentUserId: string): PullResult => {
  return upsertPulledData('notifications', notificationsData, 'notification_id', currentUserId);
};

/**
 * Process bulk pull data and insert into appropriate tables with smart conflict resolution
 */
export const processBulkPullData = (bulkData: any, currentUserId: string): { [key: string]: PullResult } => {
  const results: { [key: string]: PullResult } = {};

  console.log('🧠 Starting smart bulk pull processing...');

  if (bulkData.users) {
    results.users = pullAndInsertUsers(bulkData.users, currentUserId);
  }

  if (bulkData.locations) {
    results.locations = pullAndInsertLocations(bulkData.locations, currentUserId);
  }

  if (bulkData.supplies) {
    results.supplies = pullAndInsertSupplies(bulkData.supplies, currentUserId);
  }

  if (bulkData.tasks) {
    results.tasks = pullAndInsertTasks(bulkData.tasks, currentUserId);
  }

  if (bulkData.registrations) {
    results.registrations = pullAndInsertRegistrations(bulkData.registrations, currentUserId);
  }

  if (bulkData.task_assignments) {
    results.task_assignments = pullAndInsertTaskAssignments(bulkData.task_assignments, currentUserId);
  }

  if (bulkData.alerts) {
    results.alerts = pullAndInsertAlerts(bulkData.alerts, currentUserId);
  }

  if (bulkData.notifications) {
    results.notifications = pullAndInsertNotifications(bulkData.notifications, currentUserId);
  }

  // Log summary
  const totalConflicts = Object.values(results).reduce((sum, r) => sum + r.conflicts, 0);
  const totalDuplicates = Object.values(results).reduce((sum, r) => sum + r.duplicatesResolved, 0);
  
  if (totalConflicts > 0 || totalDuplicates > 0) {
    console.log(`🧠 Smart pull completed: ${totalConflicts} conflicts handled, ${totalDuplicates} duplicates resolved`);
  }

  return results;
};
