import { useState, useEffect, useCallback, useRef } from 'react';
import { activityService } from '../services/activities';
import type { Activity, ActivityFilterState } from '../types';

interface UseActivitiesOptions {
  mode?: 'real' | 'visio';
  filters?: Partial<ActivityFilterState>;
  autoFetch?: boolean;
}

export const useActivities = (options: UseActivitiesOptions = {}) => {
  const { mode, filters, autoFetch = true } = options;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topActivities, setTopActivities] = useState<Activity[]>([]);
  const [likedActivities, setLikedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Abort controller ref for cleanup
  const abortRef = useRef<AbortController | null>(null);

  const fetchLikedActivities = useCallback(async () => {
    try {
      const data = await activityService.getLikedActivities();
      setLikedActivities(data.activities || []);
    } catch {
      // Silently fail -- liked activities are not critical
    }
  }, []);

  const fetchActivities = useCallback(async (isRefresh = false, pageToFetch = 1) => {
    // Cancel previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Build API filter params from mode + filters
      const apiFilters: Record<string, string | number | boolean> = {};

      // mode prop takes precedence, then filters.mode
      const effectiveMode = mode ?? filters?.mode;
      if (effectiveMode) {
        apiFilters.type = effectiveMode;
      }
      if (filters?.category) {
        apiFilters.category = filters.category;
      }
      if (filters?.search) {
        apiFilters.search = filters.search;
      }
      if (filters?.dateFrom) {
        apiFilters.date = filters.dateFrom;
      }
      if (filters?.latitude != null && filters?.longitude != null) {
        apiFilters.lat = filters.latitude;
        apiFilters.lng = filters.longitude;
      }
      if (filters?.radius != null) {
        apiFilters.radius = filters.radius;
      }
      if (filters?.girlsOnly) {
        apiFilters.girls_only = true;
      }
      if (filters?.freeOnly) {
        apiFilters.free_only = true;
      }
      if (filters?.hostType && filters.hostType !== 'all') {
        apiFilters.host_type = filters.hostType;
      }

      apiFilters.page = pageToFetch;

      const [data] = await Promise.allSettled([
        activityService.getActivities(apiFilters),
        pageToFetch === 1 ? fetchLikedActivities() : Promise.resolve(),
      ]);

      if (data.status === 'fulfilled') {
        const list = data.value.activities || [];
        const hasNextPage = data.value.has_next ?? false;
        setHasMore(hasNextPage);

        if (pageToFetch === 1) {
          setActivities(list);
          // Top 3 by likes for the carousel
          const sorted = [...list].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
          setTopActivities(sorted.slice(0, 3));
        } else {
          setActivities((prev) => [...prev, ...list]);
        }
      } else {
        setError('Impossible de charger les activités.');
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      setError(apiErr?.response?.data?.error || 'Impossible de charger les activités.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [mode, filters?.mode, filters?.category, filters?.search, filters?.dateFrom, filters?.latitude, filters?.longitude, filters?.radius, filters?.girlsOnly, filters?.freeOnly, filters?.hostType, fetchLikedActivities]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [mode, filters?.mode, filters?.category, filters?.search, filters?.dateFrom, filters?.latitude, filters?.longitude, filters?.radius, filters?.girlsOnly, filters?.freeOnly, filters?.hostType]);

  useEffect(() => {
    if (autoFetch) {
      fetchActivities(false, page);
    }

    return () => {
      // Cleanup: abort in-flight request on unmount or deps change
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [autoFetch, fetchActivities, page]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    return fetchActivities(true, 1);
  }, [fetchActivities]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setPage((prev) => prev + 1);
  }, [hasMore, loadingMore, loading]);

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
    loadingMore,
    refreshing,
    error,
    refresh,
    toggleLike,
    fetchActivities,
    fetchLikedActivities,
    loadMore,
    hasMore,
  };
};
