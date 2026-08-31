import { api } from './api';

export const OrderService = {
  checkout: async (data: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: any;
    customerNotes?: string;
  }) => {
    return api.post('/orders/checkout', data);
  },

  capturePayment: async (orderId: string, paypalOrderId: string) => {
    return api.post(`/orders/${orderId}/capture`, { paypalOrderId });
  },

  getMyOrders: async () => {
    return api.get('/orders/my-orders');
  },

  getFarmerOrders: async (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    return api.get(`/orders/farmer-orders${params.toString() ? '?' + params.toString() : ''}`);
  },

  getOrderById: async (id: string) => {
    return api.get(`/orders/${id}`);
  },

  cancelOrder: async (id: string, reason?: string) => {
    return api.post(`/orders/${id}/cancel`, { reason });
  },

  downloadInvoicePdf: (id: string) => {
    window.open(`${api.defaults.baseURL}/orders/${id}/invoice`, '_blank');
  },
};
