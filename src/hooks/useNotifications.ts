import { useCallback, useState } from 'react';
import type { Notification } from '../types/notification';
import { mockNotifications } from '../types/notification';

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const getLatest = useCallback(
    (count: number = 10) => {
      // Separar não lidas e lidas
      const unread = notifications
        .filter((n) => !n.isRead)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const read = notifications
        .filter((n) => n.isRead)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Não lidas primeiro, depois lidas
      return [...unread, ...read].slice(0, count);
    },
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  }, []);

  const getNotificationById = useCallback(
    (id: string) => {
      return notifications.find((n) => n.id === id);
    },
    [notifications],
  );

  return {
    notifications,
    getUnreadCount,
    getLatest,
    markAsRead,
    markAllAsRead,
    getNotificationById,
  };
}
