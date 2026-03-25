import { api } from './api';

export interface Notification {
  _id: string;
  title: string;
  cover: string;
  newChaptersCount: number;
  lastChapterNumber: number;
  lastChapterTitle: string;
  updatedAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<{ notifications: Notification[]; totalUnread: number }> {
    const res = await fetch(`${api.baseUrl}/api/notifications`, {
      headers: api.getAuthHeader(),
    });
    if (!res.ok) throw new Error('فشل جلب الإشعارات');
    return res.json();
  },

  async markAllAsRead(): Promise<void> {
    const res = await fetch(`${api.baseUrl}/api/notifications/mark-read`, {
      method: 'POST',
      headers: api.getAuthHeader(),
    });
    if (!res.ok) throw new Error('فشل تحديث الإشعارات');
  },
};