import api from './api';
import type { Notification } from '../types';

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  pages: number;
  current_page: number;
  has_next: boolean;
}

export const notificationService = {
  getNotifications: async (
    page = 1,
    unreadOnly = false,
  ): Promise<NotificationsResponse> => {
    const response = await api.get(
      `/api/notifications/?page=${page}&unread_only=${unreadOnly}`,
    );
    return response.data;
  },

  markAsRead: async (notifId: number): Promise<{ message: string }> => {
    const response = await api.post(`/api/notifications/${notifId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string; count: number }> => {
    const response = await api.post('/api/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notifId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/notifications/${notifId}`);
    return response.data;
  },

  clearAll: async (): Promise<{ message: string; count: number }> => {
    const response = await api.delete('/api/notifications/clear');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread: number }> => {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
  },

  updateFcmToken: async (token: string): Promise<{ message: string }> => {
    const response = await api.put('/api/notifications/fcm-token', { token });
    return response.data;
  },
};
