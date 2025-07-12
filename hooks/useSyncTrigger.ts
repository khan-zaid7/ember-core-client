import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { processSyncQueue } from '@/services/sync/syncQueueProcessor';
import { useAuth } from '@/context/AuthContext';


export const useSyncTrigger = () => {
    const { user } = useAuth();
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable && user?.user_id) {
                processSyncQueue(user.user_id); 
            }
        });
        return () => unsubscribe();
    }, [user?.user_id]);
};