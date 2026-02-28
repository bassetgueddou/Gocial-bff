import api from './api';
import type { Conversation, Message } from '../types';

interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  pages: number;
  current_page: number;
  has_next: boolean;
}

interface MessagesResponse {
  partner: any;
  messages: Array<{
    id: number;
    content: string;
    sent_by_me: boolean;
    sent_at: string;
    is_read: boolean;
    message_type: string;
  }>;
  total: number;
  pages: number;
  current_page: number;
  has_more: boolean;
}

export const messageService = {
  getConversations: async (page = 1): Promise<ConversationsResponse> => {
    const response = await api.get(`/api/messages/conversations?page=${page}`);
    return response.data;
  },

  getRequests: async (): Promise<{ requests: any[] }> => {
    const response = await api.get('/api/messages/requests');
    return response.data;
  },

  getMessages: async (partnerId: number, page = 1): Promise<MessagesResponse> => {
    const response = await api.get(`/api/messages/with/${partnerId}?page=${page}`);
    return response.data;
  },

  sendMessage: async (
    recipientId: number,
    content: string,
    type = 'text',
  ): Promise<{ message: string; data: any }> => {
    const response = await api.post(`/api/messages/send/${recipientId}`, {
      content,
      type,
    });
    return response.data;
  },

  acceptRequest: async (senderId: number): Promise<{ message: string }> => {
    const response = await api.post(`/api/messages/requests/${senderId}/accept`);
    return response.data;
  },

  deleteRequest: async (
    senderId: number,
    block = false,
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/api/messages/requests/${senderId}`, {
      data: { block },
    });
    return response.data;
  },

  deleteMessage: async (messageId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/messages/${messageId}`);
    return response.data;
  },

  markAsRead: async (
    partnerId: number,
  ): Promise<{ message: string; count: number }> => {
    const response = await api.post(`/api/messages/read/${partnerId}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<{
    total_unread: number;
    requests_unread: number;
    direct_unread: number;
  }> => {
    const response = await api.get('/api/messages/unread-count');
    return response.data;
  },
};
