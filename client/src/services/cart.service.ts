import { api } from './api';

export interface CartItemPayload {
  productId: string;
  title: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  image?: string;
  farmerName?: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export const CartService = {
  getSavedCart: async () => {
    return api.get('/cart');
  },

  saveCart: async (items: CartItemPayload[]) => {
    return api.put('/cart', { items });
  },

  clearSavedCart: async () => {
    return api.delete('/cart');
  },

  validateCart: async (items: { productId: string; quantity: number }[], deliveryDistrict?: string) => {
    return api.post('/cart/validate', { items, deliveryDistrict });
  },
};
