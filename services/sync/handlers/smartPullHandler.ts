// services/sync/handlers/smartPullHandler.ts
import { db } from '../../db';
import { insertNotification } from '../../models/NotificationModel';
import { generateUUID } from '../../../utils/generateUUID';

export interface SmartPullResult {
  success: boolean;
  inserted: number;
  updated: number;
  conflicts: number;
  duplicatesResolved: number;
  errors: string[];
}

export interface ConflictItem {
  entityType: string;
  localData: any;
  serverData: any;
  conflictType: 'data_mismatch' | 'duplicate_user' | 'unsync_vs_server';
}

/**
 * Smart pull handler that checks for conflicts before blindly replacing data
 */
export const smartUpsertPulledData = (
  tableName: string,
  data: any[],
  primaryKey: string,
  currentUserId: string
): SmartPullResult => {
  const result: SmartPullResult = {
    success: true,
    inserted: 0,
    updated: 0,
    conflicts: 0,
    duplicatesResolved: 0,
    errors: []
  };

  if (!data || data.length === 0) {
    return result;
  }

  try {
    db.runSync('BEGIN TRANSACTION');

    for (const serverItem of data) {
      try {
        const conflict = detectConflict(tableName, serverItem, primaryKey, currentUserId);
        
        if (conflict) {
          // Handle conflict appropriately
          const conflictResolved = handleSmartConflict(conflict, tableName, primaryKey, currentUserId);
          if (conflictResolved) {
            result.conflicts++;
          } else {
            result.errors.push(`Unresolved conflict for ${tableName} ${serverItem[primaryKey]}`);
          }
        } else {
          // No conflict - safe to upsert
          const upsertResult = safeUpsert(tableName, serverItem, primaryKey);
          if (upsertResult.inserted) {
            result.inserted++;
          } else if (upsertResult.updated) {
            result.updated++;
          }
        }
      } catch (error: any) {
        result.errors.push(`Error processing ${tableName} ${serverItem[primaryKey]}: ${error.message}`);
        result.success = false;
      }
    }

    db.runSync('COMMIT');
    console.log(`🧠 Smart pull completed for ${tableName}:`, result);

  } catch (error: any) {
    db.runSync('ROLLBACK');
    result.success = false;
    result.errors.push(`Transaction failed: ${error.message}`);
    console.error(`❌ Smart pull failed for ${tableName}:`, error);
  }

  return result;
};

/**
 * Detect conflicts between server data and local data
 */
const detectConflict = (
  tableName: string,
  serverItem: any,
  primaryKey: string,
  currentUserId: string
): ConflictItem | null => {
  // Check for existing record by primary key
  const existingRecord = db.getFirstSync(
    `SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`,
    [serverItem[primaryKey]]
  );

  if (existingRecord) {
    // Record exists - check if local has unsynced changes
    if ((existingRecord as any).synced === 0) {
      // Local has unsynced changes - this is a conflict
      return {
        entityType: tableName,
        localData: existingRecord,
        serverData: serverItem,
        conflictType: 'unsync_vs_server'
      };
    }

    // Check if data actually differs (beyond timestamps)
    if (hasDataDifferences(existingRecord, serverItem, tableName)) {
      return {
        entityType: tableName,
        localData: existingRecord,
        serverData: serverItem,
        conflictType: 'data_mismatch'
      };
    }
  }

  // Special case: Check for duplicate users (same email, different user_id)
  if (tableName === 'users') {
    const duplicateUser = db.getFirstSync(
      `SELECT * FROM users WHERE email = ? AND user_id != ?`,
      [serverItem.email, serverItem.user_id]
    );

    if (duplicateUser) {
      return {
        entityType: tableName,
        localData: duplicateUser,
        serverData: serverItem,
        conflictType: 'duplicate_user'
      };
    }
  }

  // Special case: Check for supplies with similar names (fuzzy match)
  if (tableName === 'supplies') {
    const similarSupply = findSimilarSupply(serverItem);
    if (similarSupply) {
      return {
        entityType: tableName,
        localData: similarSupply,
        serverData: serverItem,
        conflictType: 'data_mismatch'
      };
    }
  }

  return null;
};

/**
 * Handle smart conflict resolution
 */
const handleSmartConflict = (
  conflict: ConflictItem,
  tableName: string,
  primaryKey: string,
  currentUserId: string
): boolean => {
  console.log(`🔍 Handling conflict for ${tableName}:`, conflict.conflictType);

  switch (conflict.conflictType) {
    case 'duplicate_user':
      return handleDuplicateUser(conflict, currentUserId);
    
    case 'unsync_vs_server':
      return handleUnsyncedConflict(conflict, tableName, primaryKey, currentUserId);
    
    case 'data_mismatch':
      return handleDataMismatch(conflict, tableName, primaryKey, currentUserId);
    
    default:
      return false;
  }
};

/**
 * Handle duplicate user scenario
 */
const handleDuplicateUser = (conflict: ConflictItem, currentUserId: string): boolean => {
  const localUser = conflict.localData;
  const serverUser = conflict.serverData;

  console.log(`🔄 Resolving duplicate user: Local ID ${localUser.user_id} vs Server ID ${serverUser.user_id}`);

  // If the current user is the local user, update their ID to match server
  if (localUser.user_id === currentUserId) {
    // Update local user_id to match server
    updateUserIdEverywhere(localUser.user_id, serverUser.user_id);
    
    // Update user record with server data
    db.runSync(
      `UPDATE users SET 
        user_id = ?, name = ?, email = ?, phone_number = ?, role = ?, 
        location = ?, updated_at = ?, image_url = ?, synced = 1,
        sync_status_message = 'ID updated from duplicate resolution'
      WHERE user_id = ?`,
      [
        serverUser.user_id, serverUser.name, serverUser.email, serverUser.phone_number,
        serverUser.role, serverUser.location, serverUser.updated_at, serverUser.image_url,
        localUser.user_id
      ]
    );

    console.log(`✅ User ID updated: ${localUser.user_id} → ${serverUser.user_id}`);
    return true;
  } else {
    // Different user - just update with server data
    db.runSync(
      `UPDATE users SET 
        name = ?, email = ?, phone_number = ?, role = ?, location = ?, 
        updated_at = ?, image_url = ?, synced = 1,
        sync_status_message = 'Updated from server'
      WHERE user_id = ?`,
      [
        serverUser.name, serverUser.email, serverUser.phone_number, serverUser.role,
        serverUser.location, serverUser.updated_at, serverUser.image_url,
        localUser.user_id
      ]
    );
    return true;
  }
};

/**
 * Handle unsynced local changes vs server data
 */
const handleUnsyncedConflict = (
  conflict: ConflictItem,
  tableName: string,
  primaryKey: string,
  currentUserId: string
): boolean => {
  console.log(`⚠️ Unsynced conflict in ${tableName}:`, conflict.localData[primaryKey]);

  // Create notification for user to resolve manually
  const notification = {
    notification_id: generateUUID(),
    user_id: currentUserId,
    title: 'Sync Conflict Detected',
    message: `Your local changes to ${tableName} conflict with server data. Please review and resolve.`,
    type: 'warning',
    entity_type: tableName,
    entity_id: conflict.localData[primaryKey],
    received_at: new Date().toISOString(),
    read: 0,
    synced: 1,
    archived: 0,
    sync_status_message: 'CONFLICT_REQUIRES_RESOLUTION'
  };

  insertNotification(notification);

  // Keep local data for now - don't overwrite unsynced changes
  console.log(`🔒 Keeping local unsynced data for ${tableName} ${conflict.localData[primaryKey]}`);
  return true;
};

/**
 * Handle data mismatch conflicts
 */
const handleDataMismatch = (
  conflict: ConflictItem,
  tableName: string,
  primaryKey: string,
  currentUserId: string
): boolean => {
  const localItem = conflict.localData;
  const serverItem = conflict.serverData;

  console.log(`🔀 Data mismatch in ${tableName}:`, localItem[primaryKey]);

  // Check timestamps to determine which is newer
  const localTime = new Date(localItem.updated_at || localItem.created_at || '1970-01-01');
  const serverTime = new Date(serverItem.updated_at || serverItem.created_at || '1970-01-01');

  if (serverTime > localTime) {
    // Server data is newer - use server data
    console.log(`📥 Server data is newer, updating local ${tableName}`);
    safeUpsert(tableName, serverItem, primaryKey);
    return true;
  } else {
    // Local data is newer or same - keep local
    console.log(`📤 Local data is newer, keeping local ${tableName}`);
    return true;
  }
};

/**
 * Update user_id references across all tables
 */
const updateUserIdEverywhere = (oldUserId: string, newUserId: string): void => {
  const tables = [
    'registrations', 'supplies', 'tasks', 'task_assignments', 
    'locations', 'alerts', 'notifications'
  ];

  for (const table of tables) {
    try {
      db.runSync(`UPDATE ${table} SET user_id = ? WHERE user_id = ?`, [newUserId, oldUserId]);
      console.log(`✅ Updated user_id references in ${table}`);
    } catch (error) {
      console.error(`❌ Failed to update user_id in ${table}:`, error);
    }
  }
};

/**
 * Check if two records have actual data differences
 */
const hasDataDifferences = (local: any, server: any, tableName: string): boolean => {
  const ignoreFields = ['synced', 'sync_status_message', 'updated_at', 'created_at'];
  
  // Get all fields from both records
  const allFields = [...new Set([...Object.keys(local), ...Object.keys(server)])];
  
  for (const field of allFields) {
    if (ignoreFields.includes(field)) continue;
    
    if (local[field] !== server[field]) {
      console.log(`🔍 Data difference in ${tableName}.${field}: "${local[field]}" vs "${server[field]}"`);
      return true;
    }
  }
  
  return false;
};

/**
 * Find similar supplies (fuzzy matching)
 */
const findSimilarSupply = (serverItem: any): any | null => {
  const supplies = db.getAllSync(`SELECT * FROM supplies WHERE supply_id != ?`, [serverItem.supply_id]);
  
  for (const supply of supplies) {
    const supplyItem = supply as any;
    // Check if names are similar (basic fuzzy matching)
    const similarity = calculateSimilarity(supplyItem.item_name, serverItem.item_name);
    if (similarity > 0.7) { // 70% similarity threshold
      console.log(`🔍 Similar supply found: "${supplyItem.item_name}" vs "${serverItem.item_name}" (${Math.round(similarity * 100)}% match)`);
      return supply;
    }
  }
  
  return null;
};

/**
 * Calculate string similarity (basic implementation)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Basic Levenshtein distance calculation
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Calculate Levenshtein distance
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Safe upsert without conflicts
 */
const safeUpsert = (tableName: string, item: any, primaryKey: string): { inserted: boolean; updated: boolean } => {
  const existingRecord = db.getFirstSync(
    `SELECT ${primaryKey} FROM ${tableName} WHERE ${primaryKey} = ?`,
    [item[primaryKey]]
  );

  if (existingRecord) {
    // Update existing record
    const updateFields = Object.keys(item)
      .filter(key => key !== primaryKey)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const updateValues = Object.keys(item)
      .filter(key => key !== primaryKey)
      .map(key => item[key]) as any[];

    db.runSync(
      `UPDATE ${tableName} SET ${updateFields}, synced = 1, sync_status_message = 'Updated from smart pull' WHERE ${primaryKey} = ?`,
      [...updateValues, item[primaryKey]]
    );
    
    return { inserted: false, updated: true };
  } else {
    // Insert new record
    const fields = Object.keys(item).join(', ');
    const placeholders = Object.keys(item).map(() => '?').join(', ');
    const values = Object.values(item) as any[];

    db.runSync(
      `INSERT INTO ${tableName} (${fields}, synced, sync_status_message) VALUES (${placeholders}, 1, 'Inserted from smart pull')`,
      values
    );
    
    return { inserted: true, updated: false };
  }
};
