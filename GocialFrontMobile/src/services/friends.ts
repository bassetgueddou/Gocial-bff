import api from './api';
import type { Friendship, UserPublic } from '../types';

interface FriendsResponse {
  friends: Array<{ friendship_id: number; user: UserPublic; since: string }>;
  total: number;
  pages: number;
  current_page: number;
}

interface FriendRequestsResponse {
  received: Array<{ friendship_id: number; user: UserPublic; requested_at: string }>;
  sent: Array<{ friendship_id: number; user: UserPublic; requested_at: string }>;
}

export const friendService = {
  getFriends: async (page = 1, perPage = 30): Promise<FriendsResponse> => {
    const response = await api.get(`/api/friends/?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  getRequests: async (): Promise<FriendRequestsResponse> => {
    const response = await api.get('/api/friends/requests');
    return response.data;
  },

  sendRequest: async (userId: number): Promise<{ message: string; friendship_id: number }> => {
    const response = await api.post(`/api/friends/request/${userId}`);
    return response.data;
  },

  acceptRequest: async (friendshipId: number): Promise<{ message: string }> => {
    const response = await api.post(`/api/friends/request/${friendshipId}/accept`);
    return response.data;
  },

  rejectRequest: async (friendshipId: number): Promise<{ message: string }> => {
    const response = await api.post(`/api/friends/request/${friendshipId}/reject`);
    return response.data;
  },

  cancelRequest: async (friendshipId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/friends/request/${friendshipId}/cancel`);
    return response.data;
  },

  removeFriend: async (friendId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/friends/${friendId}`);
    return response.data;
  },

  blockUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.post(`/api/friends/block/${userId}`);
    return response.data;
  },

  unblockUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/friends/block/${userId}`);
    return response.data;
  },

  getBlocked: async (): Promise<{ blocked: Array<{ user: UserPublic; blocked_at: string }> }> => {
    const response = await api.get('/api/friends/blocked');
    return response.data;
  },

  getStatus: async (userId: number): Promise<{ status: string; friendship_id: number | null }> => {
    const response = await api.get(`/api/friends/status/${userId}`);
    return response.data;
  },
};
