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
