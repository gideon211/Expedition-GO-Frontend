/**
 * @file api/notifications.js
 * @description Notification API functions. All endpoints require authentication.
 *
 * Endpoints:
 *   GET    /notifications          — list notifications (paginated, filterable)
 *   PATCH  /notifications/:id/read — mark single notification as read
 *   PATCH  /notifications/mark-all-read — mark all as read
 *   DELETE /notifications/:id      — delete a notification
 */
import { apiRequest, unwrap } from './client';

/**
 * Get the authenticated user's notifications.
 *
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {boolean} [params.unreadOnly=false]
 * @returns {Promise<{notifications: Array, pagination: Object}>}
 */
export async function fetchNotifications(params = {}) {
  const data = await apiRequest('/notifications', { params, auth: true });
  return unwrap(data);
}

/**
 * Mark a single notification as read.
 *
 * @param {string} id — notification ID
 * @returns {Promise<void>}
 */
export async function markNotificationRead(id) {
  await apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
    auth: true,
  });
}

/**
 * Mark all of the user's notifications as read.
 *
 * @returns {Promise<{updatedCount: number}>}
 */
export async function markAllNotificationsRead() {
  const data = await apiRequest('/notifications/mark-all-read', {
    method: 'PATCH',
    auth: true,
  });
  return unwrap(data);
}

/**
 * Delete a notification.
 *
 * @param {string} id — notification ID
 * @returns {Promise<void>}
 */
export async function deleteNotification(id) {
  await apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
