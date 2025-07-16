import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useCallback } from 'react';
import { processSyncQueue } from '@/services/sync/syncQueueProcessor';
import { performBulkPullSync, isPullSyncNeeded } from '@/services/sync/pullSyncManager';
import { useAuth } from '@/context/AuthContext';

// Fix for Timer type in React Native
type TimerType = ReturnType<typeof setTimeout>;

// Global singleton to prevent multiple sync trigger instances
let syncTriggerInstanceCount = 0;
let globalIntervalRef: TimerType | null = null;
let lastPullSyncTime: string | null = null;

export const useSyncTrigger = () => {
    const { user, loading } = useAuth();
    const intervalRef = useRef<TimerType | null>(null);
    const instanceId = useRef(++syncTriggerInstanceCount);
    const userIdRef = useRef<string | null>(null);
    
    // Update userIdRef when user changes
    useEffect(() => {
        userIdRef.current = user?.user_id || null;
    }, [user?.user_id]);

    // Create stable sync functions that don't depend on user prop
    const runSyncStable = useCallback(async () => {
        const currentUserId = userIdRef.current;
        console.log(`🚀 [Instance ${instanceId.current}] runSync called! user_id: ${currentUserId || 'null'}`);
        
        if (currentUserId) {
            console.log(`🔄 [Instance ${instanceId.current}] Triggering sync process...`);
            
            try {
                // First, push any pending changes to server
                console.log(`📤 [Instance ${instanceId.current}] Starting push sync...`);
                await processSyncQueue(currentUserId);
                console.log(`✅ [Instance ${instanceId.current}] Push sync completed`);
                
                // Then, pull data from server if needed
                if (isPullSyncNeeded(lastPullSyncTime || undefined)) {
                    console.log(`🔄 [Instance ${instanceId.current}] Starting pull sync...`);
                    const pullResult = await performBulkPullSync(currentUserId);
                    
                    if (pullResult.success) {
                        lastPullSyncTime = new Date().toISOString();
                        console.log(`✅ [Instance ${instanceId.current}] Smart pull sync completed: ${pullResult.totalInserted} inserted, ${pullResult.totalUpdated} updated, ${pullResult.totalConflicts} conflicts handled, ${pullResult.totalDuplicatesResolved} duplicates resolved`);
                    } else {
                        console.error(`❌ [Instance ${instanceId.current}] Smart pull sync failed:`, pullResult.errors);
                    }
                } else {
                    console.log(`⏭️ [Instance ${instanceId.current}] Pull sync skipped (recent sync)`);
                }
                
            } catch (error) {
                console.error(`❌ [Instance ${instanceId.current}] Sync error:`, error);
            }
        } else {
            console.log(`⚠️ [Instance ${instanceId.current}] No user_id found, skipping sync`);
        }
    }, []);

    // Function to run only pull sync (can be called manually)
    const runPullSyncStable = useCallback(async () => {
        const currentUserId = userIdRef.current;
        if (currentUserId) {
            console.log(`� [Instance ${instanceId.current}] Triggering pull sync...`);
            
            try {
                const pullResult = await performBulkPullSync(currentUserId);
                
                if (pullResult.success) {
                    lastPullSyncTime = new Date().toISOString();
                    console.log(`✅ [Instance ${instanceId.current}] Smart pull sync completed: ${pullResult.totalInserted} inserted, ${pullResult.totalUpdated} updated, ${pullResult.totalConflicts} conflicts handled, ${pullResult.totalDuplicatesResolved} duplicates resolved`);
                } else {
                    console.error(`❌ [Instance ${instanceId.current}] Smart pull sync failed:`, pullResult.errors);
                }
                
                return pullResult;
            } catch (error) {
                console.error(`❌ [Instance ${instanceId.current}] Pull sync error:`, error);
                throw error;
            }
        }
    }, []);

    // Function to run the sync process (push + pull) - for external calls
    const runSync = useCallback(async () => {
        const currentUserId = user?.user_id;
        console.log(`🚀 [Instance ${instanceId.current}] runSync called! user_id: ${currentUserId || 'null'}`);
        
        if (currentUserId) {
            console.log(`🔄 [Instance ${instanceId.current}] Triggering sync process...`);
            
            try {
                // First, push any pending changes to server
                console.log(`📤 [Instance ${instanceId.current}] Starting push sync...`);
                await processSyncQueue(currentUserId);
                console.log(`✅ [Instance ${instanceId.current}] Push sync completed`);
                
                // Then, pull data from server if needed
                if (isPullSyncNeeded(lastPullSyncTime || undefined)) {
                    console.log(`🔄 [Instance ${instanceId.current}] Starting pull sync...`);
                    const pullResult = await performBulkPullSync(currentUserId);
                    
                    if (pullResult.success) {
                        lastPullSyncTime = new Date().toISOString();
                        console.log(`✅ [Instance ${instanceId.current}] Smart pull sync completed: ${pullResult.totalInserted} inserted, ${pullResult.totalUpdated} updated, ${pullResult.totalConflicts} conflicts handled, ${pullResult.totalDuplicatesResolved} duplicates resolved`);
                    } else {
                        console.error(`❌ [Instance ${instanceId.current}] Smart pull sync failed:`, pullResult.errors);
                    }
                } else {
                    console.log(`⏭️ [Instance ${instanceId.current}] Pull sync skipped (recent sync)`);
                }
                
            } catch (error) {
                console.error(`❌ [Instance ${instanceId.current}] Sync error:`, error);
            }
        } else {
            console.log(`⚠️ [Instance ${instanceId.current}] No user_id found, skipping sync`);
        }
    }, [user?.user_id]);

    // Function to run only pull sync (can be called manually)
    const runPullSync = useCallback(async () => {
        if (user?.user_id) {
            console.log(`🔄 [Instance ${instanceId.current}] Triggering pull sync...`);
            
            try {
                const pullResult = await performBulkPullSync(user.user_id);
                
                if (pullResult.success) {
                    lastPullSyncTime = new Date().toISOString();
                    console.log(`✅ [Instance ${instanceId.current}] Smart pull sync completed: ${pullResult.totalInserted} inserted, ${pullResult.totalUpdated} updated, ${pullResult.totalConflicts} conflicts handled, ${pullResult.totalDuplicatesResolved} duplicates resolved`);
                } else {
                    console.error(`❌ [Instance ${instanceId.current}] Smart pull sync failed:`, pullResult.errors);
                }
                
                return pullResult;
            } catch (error) {
                console.error(`❌ [Instance ${instanceId.current}] Pull sync error:`, error);
                throw error;
            }
        }
    }, [user?.user_id]);

    useEffect(() => {
        console.log(`🔍 [Instance ${instanceId.current}] Sync trigger conditions: loading=${loading}, user_id=${user?.user_id || 'null'}`);
        
        if (loading || !user?.user_id) return;
        
        // Only allow the first instance to set up intervals and network listeners
        if (instanceId.current > 1) {
            console.log(`⚠️ [Instance ${instanceId.current}] Multiple sync trigger instances detected! Skipping setup.`);
            return;
        }
        
        console.log(`🎯 [Instance ${instanceId.current}] Setting up sync triggers (singleton)`);
        console.log(`🔥 [Instance ${instanceId.current}] USER IS LOGGED IN! Starting sync setup...`);
        
        let isOnline = false;
        const currentUserId = user.user_id; // Capture user ID to avoid closure issues
        
        // Set up network listener
        const unsubscribe = NetInfo.addEventListener(state => {
            const wasOffline = !isOnline;
            // Handle null isInternetReachable - treat as reachable if connected
            isOnline = !!(state.isConnected && (state.isInternetReachable !== false));
            
            // Trigger sync when we go from offline to online
            if (wasOffline && isOnline && currentUserId) {
                runSyncStable();
            }
        });
        
        // Set up periodic sync (every 2 minutes) - use global ref to prevent duplicates
        if (globalIntervalRef) clearInterval(globalIntervalRef);
        globalIntervalRef = setInterval(() => {
            if (isOnline && currentUserId) {
                runSyncStable();
            }
        }, 120000); // Every 2 minutes
        
        // Initial sync on mount (only for first instance)
        console.log(`🌐 [Instance ${instanceId.current}] Checking network state for initial sync...`);
        NetInfo.fetch().then(state => {
            // Handle null isInternetReachable - treat as reachable if connected
            isOnline = !!(state.isConnected && (state.isInternetReachable !== false));
            console.log(`📡 [Instance ${instanceId.current}] Network state: connected=${state.isConnected}, reachable=${state.isInternetReachable}, online=${isOnline}`);
            
            if (isOnline) {
                console.log(`🚀 [Instance ${instanceId.current}] Network is online, triggering initial sync...`);
                runSyncStable();
            } else {
                console.log(`📵 [Instance ${instanceId.current}] Network is offline, skipping initial sync`);
            }
        }).catch(error => {
            console.error(`❌ [Instance ${instanceId.current}] Network check failed:`, error);
        });
        
        // Cleanup function
        return () => {
            console.log(`🧹 [Instance ${instanceId.current}] Cleaning up sync triggers`);
            unsubscribe();
            
            // Only cleanup global interval if this is the first instance
            if (instanceId.current === 1 && globalIntervalRef) {
                clearInterval(globalIntervalRef);
                globalIntervalRef = null;
            }
        };
    }, [user?.user_id, loading]); // Remove runSync from dependencies

    // Return the sync trigger functions so they can be called manually if needed
    return { 
        triggerSync: runSync,
        triggerPullSync: runPullSync 
    };
};