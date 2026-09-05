import { api } from './api';

export const NotificationService = {
  getMyNotifications: async (portal?: 'customer' | 'farmer' | 'delivery' | 'admin') => {
    const params = portal ? `?portal=${portal}` : '';
    return api.get(`/notifications${params}`);
  },

  markAsRead: async (id: string | 'all', portal?: 'customer' | 'farmer' | 'delivery' | 'admin') => {
    const params = portal ? `?portal=${portal}` : '';
    return api.patch(`/notifications/${id}/read${params}`);
  },

  deleteNotification: async (id: string) => {
    return api.delete(`/notifications/${id}`);
  },

  deleteNotifications: async (ids?: string[], all?: boolean) => {
    return api.delete('/notifications', { data: { ids, all } });
  },
};
