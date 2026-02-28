import { useState, useEffect, useCallback } from 'react';
import { friendsService } from '../services/friends';
import type { Friendship } from '../types';

export const useFriends = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await friendsService.getFriends();
      const list = Array.isArray(data) ? data : data.friends || [];
      setFriends(list);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Impossible de charger les amis.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await friendsService.getRequests();
      const list = Array.isArray(data) ? data : data.requests || [];
      setRequests(list);
    } catch {
      // Silent
    }
  }, []);

  const fetchBlocked = useCallback(async () => {
    try {
      const data = await friendsService.getBlocked();
      const list = Array.isArray(data) ? data : data.blocked || [];
      setBlocked(list);
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    fetchBlocked();
  }, [fetchFriends, fetchRequests, fetchBlocked]);

  const acceptRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendsService.acceptRequest(friendshipId);
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      fetchFriends(); // Refresh friends list
    } catch {
      // Silent
    }
  }, [fetchFriends]);

  const rejectRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendsService.rejectRequest(friendshipId);
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    } catch {
      // Silent
    }
  }, []);

  const removeFriend = useCallback(async (friendshipId: number) => {
    try {
      await friendsService.removeFriend(friendshipId);
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
    } catch {
      // Silent
    }
  }, []);

  const blockUser = useCallback(async (userId: number) => {
    try {
      await friendsService.blockUser(userId);
      fetchBlocked();
      fetchFriends();
    } catch {
      // Silent
    }
  }, [fetchBlocked, fetchFriends]);

  const unblockUser = useCallback(async (userId: number) => {
    try {
      await friendsService.unblockUser(userId);
      setBlocked((prev) => prev.filter((b) => b.id !== userId));
    } catch {
      // Silent
    }
  }, []);

  const sendRequest = useCallback(async (userId: number) => {
    try {
      await friendsService.sendRequest(userId);
      fetchRequests();
    } catch {
      // Silent
    }
  }, [fetchRequests]);

  return {
    friends,
    requests,
    blocked,
    loading,
    error,
    refresh: fetchFriends,
    acceptRequest,
    rejectRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sendRequest,
  };
};
