import { api } from './api';

export const WishlistService = {
  /**
   * Get authenticated user's wishlist with populated products
   */
  getWishlist: async () => {
    return api.get('/wishlist');
  },

  /**
   * Add a product to the user's wishlist
   */
  addToWishlist: async (productId: string) => {
    return api.post(`/wishlist/${productId}`);
  },

  /**
   * Remove a product from the user's wishlist
   */
  removeFromWishlist: async (productId: string) => {
    return api.delete(`/wishlist/${productId}`);
  },
};
