import { api } from './api';

export const NotificationService = {
  getMyNotifications: async () => {
    return api.get('/notifications');
  },

  markAsRead: async (id: string | 'all') => {
    return api.patch(`/notifications/${id}/read`);
  },

  deleteNotification: async (id: string) => {
    return api.delete(`/notifications/${id}`);
  },

  deleteNotifications: async (ids?: string[], all?: boolean) => {
    return api.delete('/notifications', { data: { ids, all } });
  },
};
