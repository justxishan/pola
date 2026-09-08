import { api } from './api';

export const RatingService = {
  submitRating: async (data: any) => {
    return api.post('/ratings', data);
  },

  getTargetRatings: async (targetUserId?: string, productId?: string) => {
    const params = new URLSearchParams();
    if (targetUserId) params.append('targetUserId', targetUserId);
    if (productId) params.append('productId', productId);
    return api.get(`/ratings?${params.toString()}`);
  },

  checkOrderRating: async (orderId?: string, orderIds?: string[]) => {
    const params = new URLSearchParams();
    if (orderId) params.append('orderId', orderId);
    if (orderIds && orderIds.length > 0) params.append('orderIds', orderIds.join(','));
    return api.get(`/ratings/check?${params.toString()}`);
  },
};
