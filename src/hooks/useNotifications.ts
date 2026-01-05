import { useCallback, useState } from 'react';
import type { Notification } from '../types/Notification';
import { mockNotifications } from '../types/Notification';

/**
 * Custom hook for managing user notifications
 *
 * @description
 * Provides state management and utilities for handling user notifications.
 * Currently uses mock data for demonstration purposes.
 * Features include:
 * - **Notification list**: Access to all notifications
 * - **Unread count**: Quick access to number of unread notifications
 * - **Sorting**: Latest notifications first, unread prioritized
 * - **Mark as read**: Individual or bulk marking
 * - **Search**: Find notifications by ID
 *
 * @returns {Object} Notification data and control functions
 * @returns {Notification[]} returns.notifications - Complete list of notifications
 * @returns {Function} returns.getUnreadCount - Get count of unread notifications
 * @returns {Function} returns.getLatest - Get latest N notifications (sorted)
 * @returns {Function} returns.markAsRead - Mark a specific notification as read
 * @returns {Function} returns.markAllAsRead - Mark all notifications as read
 * @returns {Function} returns.getNotificationById - Find notification by ID
 */
export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  /**
   * Get the count of unread notifications
   * @returns {number} Number of unread notifications
   */
  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  /**
   * Get the latest N notifications, sorted with unread first
   * @param {number} [count=10] - Maximum number of notifications to return
   * @returns {Notification[]} Array of notifications, unread first, then by date (newest first)
   */
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

  /**
   * Mark a specific notification as read
   * @param {string} id - ID of the notification to mark as read
   * @returns {void}
   */
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  }, []);

  /**
   * Mark all notifications as read
   * @returns {void}
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  }, []);

  /**
   * Find a notification by its ID
   * @param {string} id - ID of the notification to find
   * @returns {Notification | undefined} The notification if found, undefined otherwise
   */
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
