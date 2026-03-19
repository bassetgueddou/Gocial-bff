import { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activities';
import type { Activity } from '../types';

interface UseActivitiesOptions {
  mode?: 'real' | 'visio';
  autoFetch?: boolean;
}

export const useActivities = (options: UseActivitiesOptions = {}) => {
  const { mode, autoFetch = true } = options;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topActivities, setTopActivities] = useState<Activity[]>([]);
  const [likedActivities, setLikedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLikedActivities = useCallback(async () => {
    try {
      const data = await activityService.getLikedActivities();
      setLikedActivities(data.activities || []);
    } catch {
      // Silently fail — liked activities are not critical
    }
  }, []);

  const fetchActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters = mode ? { type: mode } : {};

      const [data] = await Promise.allSettled([
        activityService.getActivities(filters),
        fetchLikedActivities(),
      ]);

      if (data.status === 'fulfilled') {
        const list = data.value.activities || [];
        setActivities(list);
        // Top 3 by likes for the carousel
        const sorted = [...list].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        setTopActivities(sorted.slice(0, 3));
      } else {
        setError('Impossible de charger les activités.');
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      setError(apiErr?.response?.data?.error || 'Impossible de charger les activités.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, fetchLikedActivities]);

  useEffect(() => {
    if (autoFetch) {
      fetchActivities();
    }
  }, [autoFetch, fetchActivities]);

  const refresh = useCallback(() => fetchActivities(true), [fetchActivities]);

  const toggleLike = useCallback(async (activityId: number) => {
    const optimisticUpdate = (prev: Activity[]) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              is_liked: !a.is_liked,
              likes_count: a.is_liked
                ? (a.likes_count || 1) - 1
                : (a.likes_count || 0) + 1,
            }
          : a,
      );

    try {
      // Optimistic UI update
      setActivities(optimisticUpdate);
      setTopActivities(optimisticUpdate);
      setLikedActivities(optimisticUpdate);

      const activity = activities.find((a) => a.id === activityId);
      if (activity?.is_liked) {
        await activityService.unlikeActivity(activityId);
      } else {
        await activityService.likeActivity(activityId);
      }
      // Refresh liked activities to keep the list in sync
      fetchLikedActivities();
    } catch {
      // Revert on failure
      fetchActivities();
    }
  }, [activities, fetchActivities, fetchLikedActivities]);

  return {
    activities,
    topActivities,
    likedActivities,
    loading,
    refreshing,
    error,
    refresh,
    toggleLike,
    fetchActivities,
    fetchLikedActivities,
  };
};
