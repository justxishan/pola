import { api } from './api';

export const NotificationService = {
  getMyNotifications: async () => {
    return api.get('/notifications');
  },

  markAsRead: async (id: string | 'all') => {
    return api.patch(`/notifications/${id}/read`);
  },
};
