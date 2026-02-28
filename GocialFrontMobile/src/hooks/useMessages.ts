import { useState, useEffect, useCallback } from 'react';
import { messagesService } from '../services/messages';
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
      const data = await messagesService.getConversations();
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
      const data = await messagesService.getUnreadCount();
      setUnreadCount(data.count || 0);
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
      await messagesService.sendMessage(recipientId, content);
      fetchConversations(); // Refresh
    } catch {
      // Silent
    }
  }, [fetchConversations]);

  const markAsRead = useCallback(async (partnerId: number) => {
    try {
      await messagesService.markAsRead(partnerId);
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
      const data = await messagesService.getMessages(partnerId);
      const list = Array.isArray(data) ? data : data.messages || [];
      setMessages(list);
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
      const newMsg = await messagesService.sendMessage(partnerId, content);
      setMessages((prev) => [...prev, newMsg]);
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
