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
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Abort controller ref for cleanup
  const abortRef = useRef<AbortController | null>(null);

  // ⚠️ RÈGLE DEPS : Refs pour stabiliser fetchActivities — ne jamais mettre d'objet entier en dépendance
  const pageRef = useRef(1);
  const modeRef = useRef(mode);
  const filtersRef = useRef(filters);
  const activitiesRef = useRef<Activity[]>([]);

  // Sync refs after each render (intentionally no deps)
  useEffect(() => {
    modeRef.current = mode;
    filtersRef.current = filters;
  });
  // Sync activitiesRef synchronously for immediate access in toggleLike
  activitiesRef.current = activities;

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

      // ⚠️ RÈGLE DEPS : Lire depuis les refs — garde fetchActivities stable
      const currentMode = modeRef.current;
      const currentFilters = filtersRef.current;

      // Build API filter params from mode + filters
      const apiFilters: Record<string, string | number | boolean> = {};

      const effectiveMode = currentMode ?? currentFilters?.mode;
      if (effectiveMode) {
        apiFilters.type = effectiveMode;
      }
      if (currentFilters?.category) {
        apiFilters.category = currentFilters.category;
      }
      if (currentFilters?.search) {
        apiFilters.search = currentFilters.search;
      }
      if (currentFilters?.dateFrom) {
        apiFilters.date = currentFilters.dateFrom;
      }
      if (currentFilters?.latitude != null && currentFilters?.longitude != null) {
        apiFilters.lat = currentFilters.latitude;
        apiFilters.lng = currentFilters.longitude;
      }
      if (currentFilters?.radius != null) {
        apiFilters.radius = currentFilters.radius;
      }
      if (currentFilters?.girlsOnly) {
        apiFilters.girls_only = true;
      }
      if (currentFilters?.freeOnly) {
        apiFilters.free_only = true;
      }
      if (currentFilters?.hostType && currentFilters.hostType !== 'all') {
        apiFilters.host_type = currentFilters.hostType;
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
  }, [fetchLikedActivities]);

  // ⚠️ RÈGLE DEPS : clé sérialisée = seules des primitives dans les dépendances
  const filtersKey = JSON.stringify([
    mode, filters?.mode, filters?.category, filters?.search,
    filters?.dateFrom, filters?.latitude, filters?.longitude,
    filters?.radius, filters?.girlsOnly, filters?.freeOnly, filters?.hostType,
  ]);

  // UN SEUL useEffect pour le fetch — élimine la cascade double-useEffect
  useEffect(() => {
    if (autoFetch) {
      pageRef.current = 1;
      fetchActivities(false, 1);
    }
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [filtersKey, autoFetch, fetchActivities]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    setHasMore(true);
    return fetchActivities(true, 1);
  }, [fetchActivities]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchActivities(false, nextPage);
  }, [hasMore, loadingMore, loading, fetchActivities]);

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

      // ⚠️ RÈGLE DEPS : Lire depuis le ref — évite activities dans les deps
      const activity = activitiesRef.current.find((a) => a.id === activityId);
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
  }, [fetchActivities, fetchLikedActivities]);

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
