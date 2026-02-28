import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notifications';
import type { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsService.getNotifications();
      const list = Array.isArray(data) ? data : data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.is_read).length);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notifId: number) => {
    try {
      await notificationsService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silent
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Silent
    }
  }, []);

  const deleteNotification = useCallback(async (notifId: number) => {
    try {
      await notificationsService.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch {
      // Silent
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
