import { useAuth } from '@/context/AuthContext';
import { processSyncQueue } from '@/services/sync/syncQueueProcessor';

export const useProcessSyncQueue = () => {
  const { user } = useAuth();

  const runSyncQueue = async () => {
    if (user && user.user_id) {
      await processSyncQueue(user.user_id);
    } else {
      console.warn('No user found in context. Cannot process sync queue.');
    }
  };

  return { runSyncQueue };
};
