import api from './api';
import type { User, Activity } from '../types';

interface SearchUsersResponse {
  users: User[];
  total: number;
  pages: number;
  current_page: number;
  has_next: boolean;
}

interface UserActivitiesResponse {
  activities: Activity[];
  total: number;
  pages: number;
  current_page: number;
}

export const userService = {
  getUser: async (
    userId: number,
  ): Promise<{ user: User; friendship_status?: string; friendship_id?: number }> => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put('/api/users/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: {
    uri: string;
    type: string;
    name: string;
  }): Promise<{ message: string; avatar_url: string }> => {
    const formData = new FormData();
    formData.append('file', file as any);

    const response = await api.post('/api/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  searchUsers: async (
    query: string,
    type?: string,
    city?: string,
    page = 1,
  ): Promise<SearchUsersResponse> => {
    const params = new URLSearchParams({ q: query, page: String(page) });
    if (type) params.append('type', type);
    if (city) params.append('city', city);

    const response = await api.get(`/api/users/search?${params.toString()}`);
    return response.data;
  },

  getUserActivities: async (
    userId: number,
    page = 1,
    includePast = false,
  ): Promise<UserActivitiesResponse> => {
    const response = await api.get(
      `/api/users/${userId}/activities?page=${page}&include_past=${includePast}`,
    );
    return response.data;
  },

  deactivateAccount: async (password: string): Promise<{ message: string }> => {
    const response = await api.post('/api/users/deactivate', { password });
    return response.data;
  },

  deleteAccount: async (
    password: string,
    confirmation: string,
  ): Promise<{ message: string }> => {
    const response = await api.delete('/api/users/delete', {
      data: { password, confirmation },
    });
    return response.data;
  },
};
