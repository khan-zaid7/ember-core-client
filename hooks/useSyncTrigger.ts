import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useCallback } from 'react';
import { processSyncQueue } from '@/services/sync/syncQueueProcessor';
import { useAuth } from '@/context/AuthContext';
// Fix for Timer type in React Native
type TimerType = ReturnType<typeof setTimeout>;

export const useSyncTrigger = () => {
    const { user, loading } = useAuth();
    const intervalRef = useRef<TimerType | null>(null);

    // Function to run the sync process
    const runSync = useCallback(() => {
        if (user?.user_id) {
            console.log('🔄 Triggering sync process...');
            processSyncQueue(user.user_id)
                .then(() => console.log('✅ Sync completed'))
                .catch(err => console.error('❌ Sync error:', err));
        }
    }, [user?.user_id]);

    useEffect(() => {
        if (loading || !user?.user_id) return;
        
        let isOnline = false;
        
        // Set up network listener
        const unsubscribe = NetInfo.addEventListener(state => {
            const wasOffline = !isOnline;
            isOnline = !!(state.isConnected && state.isInternetReachable);
            
            // Trigger sync when we go from offline to online
            if (wasOffline && isOnline && user.user_id) {
                runSync();
            }
        });
        
        // Set up periodic sync (every 2 minutes)
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (isOnline && user.user_id) {
                runSync();
            }
        }, 120000); // Every 2 minutes
        
        // Initial sync on mount
        NetInfo.fetch().then(state => {
            isOnline = !!(state.isConnected && state.isInternetReachable);
            if (isOnline) {
                runSync();
            }
        });
        
        // Cleanup function
        return () => {
            unsubscribe();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [user?.user_id, loading, runSync]);

    // Return the sync trigger function so it can be called manually if needed
    return { triggerSync: runSync };
};