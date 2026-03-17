import { useState, useEffect, useCallback } from 'react';
import { friendService } from '../services/friends';
import type { Friendship } from '../types';

export const useFriends = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
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
      if (Array.isArray(data)) {
        setReceivedRequests(data as any);
        setSentRequests([]);
      } else {
        setReceivedRequests((data.received || []) as any);
        setSentRequests((data.sent || []) as any);
      }
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
      setReceivedRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      fetchFriends(); // Refresh friends list
    } catch {
      // Silent
    }
  }, [fetchFriends]);

  const rejectRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendService.rejectRequest(friendshipId);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      setSentRequests((prev) => prev.filter((r) => r.id !== friendshipId));
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

  const cancelRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendService.cancelRequest(friendshipId);
      setSentRequests((prev) => prev.filter((r) => (r.friendship_id || r.id) !== friendshipId));
    } catch {
      // Silent
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchFriends();
    fetchRequests();
    fetchBlocked();
  }, [fetchFriends, fetchRequests, fetchBlocked]);

  return {
    friends,
    requests: { received: receivedRequests, sent: sentRequests },
    blocked,
    loading,
    error,
    refresh: refreshAll,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sendRequest,
  };
};
