import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { processSyncQueue } from '@/services/sync/syncQueueProcessor';
import { useAuth } from '@/context/AuthContext';


export const useSyncTrigger = () => {
    const { user, loading } = useAuth();
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (loading || !user?.user_id) return;
        let isOnline = false;
        const unsubscribe = NetInfo.addEventListener(state => {
            isOnline = !!(state.isConnected && state.isInternetReachable);
            if (isOnline && user.user_id) {
                processSyncQueue(user.user_id);
            }
        });
        // Timer-based retry
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (isOnline && user.user_id) {
                processSyncQueue(user.user_id);
            }
        }, 30000); // 30 seconds
        return () => {
            unsubscribe();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user?.user_id, loading]);
};