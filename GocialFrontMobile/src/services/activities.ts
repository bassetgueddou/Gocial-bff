import api from './api';
import type { Activity, CreateActivityData, Participation } from '../types';

interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  pages: number;
  current_page: number;
  has_next: boolean;
}

interface ActivityFilters {
  type?: 'real' | 'visio';
  category?: string;
  date?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  girls_only?: boolean;
  free_only?: boolean;
  page?: number;
  per_page?: number;
}

interface ParticipantsResponse {
  validated: Array<{ user: any; message: string; requested_at: string; validated_at: string | null }>;
  pending: Array<{ user: any; message: string; requested_at: string; validated_at: string | null }>;
  rejected: Array<{ user: any; message: string; requested_at: string; validated_at: string | null }>;
}

export const activityService = {
  getActivities: async (filters: ActivityFilters = {}): Promise<ActivitiesResponse> => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.date) params.append('date', filters.date);
    if (filters.lat !== undefined) params.append('lat', String(filters.lat));
    if (filters.lng !== undefined) params.append('lng', String(filters.lng));
    if (filters.radius) params.append('radius', String(filters.radius));
    if (filters.girls_only) params.append('girls_only', 'true');
    if (filters.free_only) params.append('free_only', 'true');
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await api.get(`/api/activities/?${params.toString()}`);
    return response.data;
  },

  getActivity: async (id: number): Promise<Activity> => {
    const response = await api.get(`/api/activities/${id}`);
    return response.data;
  },

  createActivity: async (data: CreateActivityData): Promise<{ message: string; activity: Activity }> => {
    const response = await api.post('/api/activities/', data);
    return response.data;
  },

  updateActivity: async (id: number, data: Partial<CreateActivityData>): Promise<{ message: string; activity: Activity }> => {
    const response = await api.put(`/api/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/activities/${id}`);
    return response.data;
  },

  // Participation
  requestParticipation: async (activityId: number, message?: string): Promise<{ message: string; status: string; participation_id: number }> => {
    const response = await api.post(`/api/activities/${activityId}/participate`, { message });
    return response.data;
  },

  cancelParticipation: async (activityId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/activities/${activityId}/participate`);
    return response.data;
  },

  handleParticipation: async (activityId: number, userId: number, action: 'accept' | 'reject'): Promise<{ message: string }> => {
    const response = await api.put(`/api/activities/${activityId}/participants/${userId}`, { action });
    return response.data;
  },

  getParticipants: async (activityId: number): Promise<ParticipantsResponse> => {
    const response = await api.get(`/api/activities/${activityId}/participants`);
    return response.data;
  },

  // Likes
  likeActivity: async (activityId: number): Promise<{ message: string }> => {
    const response = await api.post(`/api/activities/${activityId}/like`);
    return response.data;
  },

  unlikeActivity: async (activityId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/activities/${activityId}/like`);
    return response.data;
  },

  getLikedActivities: async (page = 1): Promise<ActivitiesResponse> => {
    const response = await api.get(`/api/activities/liked?page=${page}`);
    return response.data;
  },

  // My activities
  getHostedActivities: async (page = 1, includePast = false): Promise<ActivitiesResponse> => {
    const response = await api.get(`/api/activities/hosting?page=${page}&include_past=${includePast}`);
    return response.data;
  },

  getMyParticipations: async (page = 1, status = 'validated', includePast = false): Promise<ActivitiesResponse> => {
    const response = await api.get(`/api/activities/participating?page=${page}&status=${status}&include_past=${includePast}`);
    return response.data;
  },
};
