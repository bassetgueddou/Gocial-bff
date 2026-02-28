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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters: Record<string, any> = {};
      if (mode) {
        filters.mode = mode;
      }

      const data = await activityService.getActivities(filters);
      const list = Array.isArray(data) ? data : data.activities || [];

      setActivities(list);
      // Top 3 by likes for the carousel
      const sorted = [...list].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      setTopActivities(sorted.slice(0, 3));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Impossible de charger les activités.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    if (autoFetch) {
      fetchActivities();
    }
  }, [autoFetch, fetchActivities]);

  const refresh = useCallback(() => fetchActivities(true), [fetchActivities]);

  const toggleLike = useCallback(async (activityId: number) => {
    try {
      // Optimistic UI update
      setActivities((prev) =>
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
        ),
      );
      setTopActivities((prev) =>
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
        ),
      );

      const activity = activities.find((a) => a.id === activityId);
      if (activity?.is_liked) {
        await activityService.unlikeActivity(activityId);
      } else {
        await activityService.likeActivity(activityId);
      }
    } catch {
      // Revert on failure
      fetchActivities();
    }
  }, [activities, fetchActivities]);

  return {
    activities,
    topActivities,
    loading,
    refreshing,
    error,
    refresh,
    toggleLike,
    fetchActivities,
  };
};
