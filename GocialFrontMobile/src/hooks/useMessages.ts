import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messages';
import type { Conversation, Message } from '../types';

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getConversations();
      const list = Array.isArray(data) ? data : data.conversations || [];
      setConversations(list);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Impossible de charger les conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await messageService.getUnreadCount();
      setUnreadCount(data.total_unread || 0);
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  const sendMessage = useCallback(async (recipientId: number, content: string) => {
    try {
      await messageService.sendMessage(recipientId, content);
      fetchConversations(); // Refresh
    } catch {
      // Silent
    }
  }, [fetchConversations]);

  const markAsRead = useCallback(async (partnerId: number) => {
    try {
      await messageService.markAsRead(partnerId);
      fetchUnreadCount();
    } catch {
      // Silent
    }
  }, [fetchUnreadCount]);

  return {
    conversations,
    unreadCount,
    loading,
    error,
    refresh: fetchConversations,
    sendMessage,
    markAsRead,
  };
};

export const useConversation = (partnerId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getMessages(partnerId);
      const list = Array.isArray(data) ? data : data.messages || [];
      setMessages(list as any);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const send = useCallback(async (content: string) => {
    try {
      const newMsg = await messageService.sendMessage(partnerId, content);
      setMessages((prev) => [...prev, newMsg?.data ?? newMsg] as any);
    } catch {
      // Silent
    }
  }, [partnerId]);

  return {
    messages,
    loading,
    error,
    refresh: fetchMessages,
    send,
  };
};
