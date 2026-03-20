import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { ActivityFilterState } from '../types';

const defaultFilters: ActivityFilterState = {
  search: '',
  category: null,
  dateFrom: null,
  dateTo: null,
  latitude: null,
  longitude: null,
  radius: null,
  mode: 'real',
  sort: null,
  hostId: null,
  girlsOnly: false,
  freeOnly: false,
  hostType: 'all',
};

interface FilterContextType {
  filters: ActivityFilterState;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setDateRange: (dateFrom: string | null, dateTo: string | null) => void;
  setLocation: (latitude: number | null, longitude: number | null, radius: number | null) => void;
  setMode: (mode: 'real' | 'visio') => void;
  setSort: (sort: string | null) => void;
  setHostId: (hostId: number | null) => void;
  setGirlsOnly: (girlsOnly: boolean) => void;
  setFreeOnly: (freeOnly: boolean) => void;
  setHostType: (hostType: 'all' | 'person' | 'pro' | 'asso') => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<ActivityFilterState>(defaultFilters);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setDateRange = useCallback((dateFrom: string | null, dateTo: string | null) => {
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }));
  }, []);

  const setLocation = useCallback((latitude: number | null, longitude: number | null, radius: number | null) => {
    setFilters((prev) => ({ ...prev, latitude, longitude, radius }));
  }, []);

  const setMode = useCallback((mode: 'real' | 'visio') => {
    setFilters((prev) => ({ ...prev, mode }));
  }, []);

  const setSort = useCallback((sort: string | null) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const setHostId = useCallback((hostId: number | null) => {
    setFilters((prev) => ({ ...prev, hostId }));
  }, []);

  const setGirlsOnly = useCallback((girlsOnly: boolean) => {
    setFilters((prev) => ({ ...prev, girlsOnly }));
  }, []);

  const setFreeOnly = useCallback((freeOnly: boolean) => {
    setFilters((prev) => ({ ...prev, freeOnly }));
  }, []);

  const setHostType = useCallback((hostType: 'all' | 'person' | 'pro' | 'asso') => {
    setFilters((prev) => ({ ...prev, hostType }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((prev) => ({ ...defaultFilters, mode: prev.mode }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.category !== null ||
      filters.dateFrom !== null ||
      filters.dateTo !== null ||
      filters.latitude !== null ||
      filters.radius !== null ||
      filters.sort !== null ||
      filters.hostId !== null ||
      filters.girlsOnly !== false ||
      filters.freeOnly !== false ||
      filters.hostType !== 'all'
    );
  }, [filters]);

  const value = useMemo(
    () => ({
      filters,
      setSearch,
      setCategory,
      setDateRange,
      setLocation,
      setMode,
      setSort,
      setHostId,
      setGirlsOnly,
      setFreeOnly,
      setHostType,
      resetFilters,
      hasActiveFilters,
    }),
    [filters, setSearch, setCategory, setDateRange, setLocation, setMode, setSort, setHostId, setGirlsOnly, setFreeOnly, setHostType, resetFilters, hasActiveFilters],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
