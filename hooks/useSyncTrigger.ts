import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useCallback } from 'react';
import { processSyncQueue } from '@/services/sync/syncQueueProcessor';
import { useAuth } from '@/context/AuthContext';

// Fix for Timer type in React Native
type TimerType = ReturnType<typeof setTimeout>;

// Global singleton to prevent multiple sync trigger instances
let syncTriggerInstanceCount = 0;
let globalIntervalRef: TimerType | null = null;

export const useSyncTrigger = () => {
    const { user, loading } = useAuth();
    const intervalRef = useRef<TimerType | null>(null);
    const instanceId = useRef(++syncTriggerInstanceCount);

    // Function to run the sync process
    const runSync = useCallback(() => {
        if (user?.user_id) {
            console.log(`🔄 [Instance ${instanceId.current}] Triggering sync process...`);
            processSyncQueue(user.user_id)
                .then(() => console.log(`✅ [Instance ${instanceId.current}] Sync completed`))
                .catch(err => console.error(`❌ [Instance ${instanceId.current}] Sync error:`, err));
        }
    }, [user?.user_id]);

    useEffect(() => {
        if (loading || !user?.user_id) return;
        
        // Only allow the first instance to set up intervals and network listeners
        if (instanceId.current > 1) {
            console.log(`⚠️ [Instance ${instanceId.current}] Multiple sync trigger instances detected! Skipping setup.`);
            return;
        }
        
        console.log(`🎯 [Instance ${instanceId.current}] Setting up sync triggers (singleton)`);
        
        let isOnline = false;
        
        // Set up network listener
        const unsubscribe = NetInfo.addEventListener(state => {
            const wasOffline = !isOnline;
            isOnline = !!(state.isConnected && state.isInternetReachable !== false);
            
            // Trigger sync when we go from offline to online
            if (wasOffline && isOnline && user.user_id) {
                runSync();
            }
        });
        
        // Set up periodic sync (every 2 minutes) - use global ref to prevent duplicates
        if (globalIntervalRef) clearInterval(globalIntervalRef);
        globalIntervalRef = setInterval(() => {
            if (isOnline && user.user_id) {
                runSync();
            }
        }, 120000); // Every 2 minutes
        
        // Initial sync on mount (only for first instance)
        NetInfo.fetch().then(state => {
            isOnline = !!(state.isConnected && state.isInternetReachable !== false);
            if (isOnline) {
                runSync();
            }
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
    }, [user?.user_id, loading, runSync]);

    // Return the sync trigger function so it can be called manually if needed
    return { triggerSync: runSync };
};