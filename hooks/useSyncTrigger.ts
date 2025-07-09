import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import {processSyncQueue} from '@/services/sync/syncQueueProcessor';


export const useSyncTrigger = () => {
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable){
                processSyncQueue(); 
            }
        })
        return () => unsubscribe();
    }, []);
};