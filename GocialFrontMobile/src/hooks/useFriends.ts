import { useState, useEffect, useCallback } from 'react';
import { friendService } from '../services/friends';
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
      const data = await friendService.getFriends();
      const list = Array.isArray(data) ? data : data.friends || [];
      setFriends(list as any);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Impossible de charger les amis.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await friendService.getRequests();
      const list = Array.isArray(data) ? data : data.received || [];
      setRequests(list as any);
    } catch {
      // Silent
    }
  }, []);

  const fetchBlocked = useCallback(async () => {
    try {
      const data = await friendService.getBlocked();
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
      await friendService.acceptRequest(friendshipId);
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      fetchFriends(); // Refresh friends list
    } catch {
      // Silent
    }
  }, [fetchFriends]);

  const rejectRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendService.rejectRequest(friendshipId);
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    } catch {
      // Silent
    }
  }, []);

  const removeFriend = useCallback(async (friendshipId: number) => {
    try {
      await friendService.removeFriend(friendshipId);
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
    } catch {
      // Silent
    }
  }, []);

  const blockUser = useCallback(async (userId: number) => {
    try {
      await friendService.blockUser(userId);
      fetchBlocked();
      fetchFriends();
    } catch {
      // Silent
    }
  }, [fetchBlocked, fetchFriends]);

  const unblockUser = useCallback(async (userId: number) => {
    try {
      await friendService.unblockUser(userId);
      setBlocked((prev) => prev.filter((b) => b.id !== userId));
    } catch {
      // Silent
    }
  }, []);

  const sendRequest = useCallback(async (userId: number) => {
    try {
      await friendService.sendRequest(userId);
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
