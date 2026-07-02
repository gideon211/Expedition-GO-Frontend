/**
 * @file contexts/NotificationContext.jsx
 * @description Global notification state. Tracks unread count, notification list,
 *   and listens for real-time push events via Socket.IO.
 *
 * Provides:
 *   - unreadCount: number — live unread badge count
 *   - notifications: Array — last fetched notifications
 *   - fetchNotifications: (params?) => Promise — refresh from backend
 *   - markRead: (id) => Promise — mark single as read (updates local state optimistically)
 *   - markAllRead: () => Promise — mark all as read
 *   - deleteNotif: (id) => Promise — delete a notification
 *   - loading: boolean
 *
 * @see hooks/useSocket.js — Socket.IO connection
 * @see api/notifications.js — REST API
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/api/notifications';
import { useSocketEvent, initSocket, disconnectSocket } from '@/hooks/useSocket';
import { useAuth } from '@/components/auth/AuthProvider';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const initRef = useRef(false);

  // Connect Socket.IO when user authenticates, disconnect on logout
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setUnreadCount(0);
      setNotifications([]);
      initRef.current = false;
      return;
    }

    if (!initRef.current) {
      initRef.current = true;
      initSocket();
    }
  }, [user]);

  // Initial fetch and unread count when user logs in
  useEffect(() => {
    if (!user) return;
    loadNotifications({ limit: 5 });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for real-time push notifications
  useSocketEvent('notification', (data) => {
    // Prepend the new notification to the top
    setNotifications((prev) => [data, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);
  });

  const loadNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await fetchNotifications(params);
      setNotifications(result.notifications || []);
      setUnreadCount(result.pagination?.unreadCount ?? 0);
      setPagination(result.pagination || null);
    } catch {
      // Silently fail — will surface in the bell dropdown if needed
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id) => {
    // Optimistically update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationRead(id);
    } catch {
      // Revert on failure — refetch to be safe
      loadNotifications({ limit: pagination?.limit || 20 });
    }
  }, [loadNotifications, pagination?.limit]);

  const markAllRead = useCallback(async () => {
    const prevCount = unreadCount;
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const result = await markAllNotificationsRead();
      return result;
    } catch {
      setUnreadCount(prevCount);
      loadNotifications({ limit: pagination?.limit || 20 });
      return null;
    }
  }, [unreadCount, loadNotifications, pagination?.limit]);

  const deleteNotif = useCallback(async (id) => {
    const wasUnread = notifications.find((n) => n.id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await deleteNotification(id);
    } catch {
      loadNotifications({ limit: pagination?.limit || 20 });
    }
  }, [notifications, loadNotifications, pagination?.limit]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      pagination,
      fetchNotifications: loadNotifications,
      markRead,
      markAllRead,
      deleteNotif,
    }),
    [notifications, unreadCount, loading, pagination, loadNotifications, markRead, markAllRead, deleteNotif]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
