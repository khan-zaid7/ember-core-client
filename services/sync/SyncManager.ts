// services/sync/SyncManager.ts
import { processSyncQueue } from './syncQueueProcessor';
import { performBulkPullSync, isPullSyncNeeded } from './pullSyncManager';
import { getConflictItems } from '../models/SyncQueueModel';
import { showNotification } from '../../utils/notificationManager';

/**
 * Sync states for the centralized sync manager
 */
export enum SyncState {
  IDLE = 'idle',
  PUSH_IN_PROGRESS = 'push_in_progress',
  CONFLICT_PENDING = 'conflict_pending',
  PULL_IN_PROGRESS = 'pull_in_progress',
}

/**
 * Centralized Sync Manager
 * 
 * This is the ONLY place that orchestrates push and pull sync operations.
 * All triggers (timer, network, manual) should call runSync() from this manager.
 */
class SyncManager {
  private currentState: SyncState = SyncState.IDLE;
  private conflictPending: boolean = false;
  private lastPullSyncTime: string | null = null;
  private currentUserId: string | null = null;

  /**
   * Get the current sync state
   */
  public getSyncState(): SyncState {
    return this.currentState;
  }

  /**
   * Check if there are pending conflicts that would block sync
   */
  public hasPendingConflict(): boolean {
    return this.conflictPending;
  }

  /**
   * Check if sync is currently running
   */
  public isSyncing(): boolean {
    return this.currentState !== SyncState.IDLE;
  }

  /**
   * Reset conflict flags after manual resolution
   * This should be called after user resolves conflicts manually
   */
  public reset(): void {
    console.log('🔄 SyncManager: Resetting conflict flags');
    this.conflictPending = false;
    
    // If we were in conflict pending state, move back to idle
    if (this.currentState === SyncState.CONFLICT_PENDING) {
      this.currentState = SyncState.IDLE;
    }
  }

  /**
   * Check for existing conflicts in the sync queue
   */
  private async checkExistingConflicts(userId: string): Promise<boolean> {
    try {
      const conflictItems = getConflictItems(userId);
      const hasConflicts = conflictItems.length > 0;
      
      if (hasConflicts) {
        console.log(`⚠️ SyncManager: Found ${conflictItems.length} existing conflicts`);
        this.conflictPending = true;
        this.currentState = SyncState.CONFLICT_PENDING;
      }
      
      return hasConflicts;
    } catch (error) {
      console.error('❌ SyncManager: Error checking existing conflicts:', error);
      return false;
    }
  }

  /**
   * Main sync orchestration method
   * 
   * This is the ONLY method that should be called by triggers.
   * It handles the complete sync flow: push -> check conflicts -> pull
   */
  public async runSync(userId: string): Promise<void> {
    // Prevent re-entrance
    if (this.isSyncing()) {
      console.log('⏳ SyncManager: Sync already in progress, skipping...');
      return;
    }

    // Store current user ID
    this.currentUserId = userId;

    // Check for existing conflicts before starting
    const hasExistingConflicts = await this.checkExistingConflicts(userId);
    if (hasExistingConflicts) {
      console.log('🚫 SyncManager: Cannot sync - pending conflicts must be resolved first');
      showNotification(
        'Please resolve sync conflicts before syncing',
        'warning',
        'Sync Blocked'
      );
      return;
    }

    console.log('🚀 SyncManager: Starting sync process...');

    try {
      // STEP 1: Push Phase
      await this.runPushPhase(userId);
      
      // STEP 2: Check if push created any conflicts
      if (this.conflictPending) {
        console.log('🚫 SyncManager: Push conflicts detected, skipping pull phase');
        showNotification(
          'Sync conflicts detected. Please resolve them before continuing.',
          'warning',
          'Sync Conflicts'
        );
        return;
      }

      // STEP 3: Pull Phase (only if no conflicts)
      await this.runPullPhase(userId);

      console.log('✅ SyncManager: Sync completed successfully');

    } catch (error) {
      console.error('❌ SyncManager: Sync failed:', error);
      this.currentState = SyncState.IDLE;
      showNotification(
        `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        'Sync Error'
      );
    }
  }

  /**
   * Run the push phase of sync
   */
  private async runPushPhase(userId: string): Promise<void> {
    console.log('📤 SyncManager: Starting push phase...');
    this.currentState = SyncState.PUSH_IN_PROGRESS;

    try {
      // Run the push sync (processSyncQueue)
      await processSyncQueue(userId);
      
      // Check if push created any conflicts
      const hasConflicts = await this.checkExistingConflicts(userId);
      if (hasConflicts) {
        console.log('⚠️ SyncManager: Push phase completed with conflicts');
        this.currentState = SyncState.CONFLICT_PENDING;
        this.conflictPending = true;
      } else {
        console.log('✅ SyncManager: Push phase completed successfully');
      }

    } catch (error) {
      console.error('❌ SyncManager: Push phase failed:', error);
      this.currentState = SyncState.IDLE;
      throw error;
    }
  }

  /**
   * Run the pull phase of sync
   */
  private async runPullPhase(userId: string): Promise<void> {
    // Only run pull if needed (based on time since last pull)
    if (!isPullSyncNeeded(this.lastPullSyncTime || undefined)) {
      console.log('⏭️ SyncManager: Pull sync skipped (recent sync)');
      this.currentState = SyncState.IDLE;
      return;
    }

    console.log('📥 SyncManager: Starting pull phase...');
    this.currentState = SyncState.PULL_IN_PROGRESS;

    try {
      // Run the pull sync
      const pullResult = await performBulkPullSync(userId);
      
      if (pullResult.success) {
        this.lastPullSyncTime = new Date().toISOString();
        console.log('✅ SyncManager: Pull phase completed successfully');
        console.log(`📊 SyncManager: Pull stats - ${pullResult.totalInserted} inserted, ${pullResult.totalUpdated} updated, ${pullResult.totalConflicts} conflicts handled, ${pullResult.totalDuplicatesResolved} duplicates resolved`);
      } else {
        console.error('❌ SyncManager: Pull phase failed:', pullResult.errors);
        throw new Error(`Pull sync failed: ${pullResult.errors.join(', ')}`);
      }

    } catch (error) {
      console.error('❌ SyncManager: Pull phase failed:', error);
      throw error;
    } finally {
      this.currentState = SyncState.IDLE;
    }
  }

  /**
   * Manual pull sync method (for UI that needs pull-only)
   * This should be used sparingly and only when specifically needed
   */
  public async runPullOnly(userId: string): Promise<void> {
    // Check if we're already syncing
    if (this.isSyncing()) {
      console.log('⏳ SyncManager: Sync in progress, cannot run pull-only');
      return;
    }

    // Store current user ID
    this.currentUserId = userId;

    console.log('📥 SyncManager: Starting pull-only sync...');
    
    try {
      await this.runPullPhase(userId);
      console.log('✅ SyncManager: Pull-only sync completed');
    } catch (error) {
      console.error('❌ SyncManager: Pull-only sync failed:', error);
      showNotification(
        `Pull sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        'Pull Sync Error'
      );
    }
  }

  /**
   * Get sync status information for UI
   */
  public getSyncStatus(): {
    state: SyncState;
    hasPendingConflict: boolean;
    isSyncing: boolean;
    lastPullSyncTime: string | null;
  } {
    return {
      state: this.currentState,
      hasPendingConflict: this.conflictPending,
      isSyncing: this.isSyncing(),
      lastPullSyncTime: this.lastPullSyncTime,
    };
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
