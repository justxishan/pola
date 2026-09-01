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
};
