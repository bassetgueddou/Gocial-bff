import { useState, useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { friendService } from '../services/friends';
import type { Friendship } from '../types';

interface BlockedUser {
  id: number;
  pseudo: string | null;
  first_name: string | null;
  avatar_url: string | null;
  blocked_at: string;
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await friendService.getFriends();
      const list = Array.isArray(data) ? data : data.friends || [];
      setFriends(list as Friendship[]);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      setError(apiErr?.response?.data?.error || 'Impossible de charger les amis.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await friendService.getRequests();
      if (Array.isArray(data)) {
        setReceivedRequests(data as Friendship[]);
        setSentRequests([]);
      } else {
        setReceivedRequests((data.received || []) as Friendship[]);
        setSentRequests((data.sent || []) as Friendship[]);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger les demandes d\'amis', position: 'top', topOffset: 60 });
    }
  }, []);

  const fetchBlocked = useCallback(async () => {
    try {
      const data = await friendService.getBlocked();
      const list = Array.isArray(data) ? data : data.blocked || [];
      setBlocked(list as BlockedUser[]);
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger les utilisateurs bloqués', position: 'top', topOffset: 60 });
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
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'accepter la demande', position: 'top', topOffset: 60 });
    }
  }, [fetchFriends]);

  const rejectRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendService.rejectRequest(friendshipId);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== friendshipId));
      setSentRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de rejeter la demande', position: 'top', topOffset: 60 });
    }
  }, []);

  const removeFriend = useCallback(async (friendshipId: number) => {
    try {
      await friendService.removeFriend(friendshipId);
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de supprimer l\'ami', position: 'top', topOffset: 60 });
    }
  }, []);

  const blockUser = useCallback(async (userId: number) => {
    try {
      await friendService.blockUser(userId);
      fetchBlocked();
      fetchFriends();
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de bloquer l\'utilisateur', position: 'top', topOffset: 60 });
    }
  }, [fetchBlocked, fetchFriends]);

  const unblockUser = useCallback(async (userId: number) => {
    try {
      await friendService.unblockUser(userId);
      setBlocked((prev) => prev.filter((b) => b.id !== userId));
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de débloquer l\'utilisateur', position: 'top', topOffset: 60 });
    }
  }, []);

  const sendRequest = useCallback(async (userId: number) => {
    try {
      await friendService.sendRequest(userId);
      fetchRequests();
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'envoyer la demande d\'ami', position: 'top', topOffset: 60 });
    }
  }, [fetchRequests]);

  const cancelRequest = useCallback(async (friendshipId: number) => {
    try {
      await friendService.cancelRequest(friendshipId);
      setSentRequests((prev) => prev.filter((r) => (r.friendship_id || r.id) !== friendshipId));
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'annuler la demande d\'ami', position: 'top', topOffset: 60 });
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
