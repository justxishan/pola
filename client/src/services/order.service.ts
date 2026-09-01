import { api } from './api';

export const OrderService = {
  checkout: async (data: {
    items: { productId: string; quantity: number; unitPrice?: number }[];
    deliveryAddress: any;
    recipientName?: string;
    recipientPhone?: string;
    deliveryInstructions?: string;
    customerNotes?: string;
    paymentMethod?: string;
  }) => {
    return api.post('/orders/checkout', data);
  },

  capturePayment: async (orderId: string, paypalOrderId: string) => {
    return api.post('/orders/capture-paypal', { orderId, paypalOrderId });
  },

  getMyOrders: async () => {
    return api.get('/orders/my-orders');
  },

  getCustomerOrders: async () => {
    return api.get('/orders/my-orders');
  },

  getFarmerOrders: async (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    return api.get(`/orders/farmer-orders${params.toString() ? '?' + params.toString() : ''}`);
  },

  getOrderById: async (id: string) => {
    return api.get(`/orders/${id}`);
  },

  updateOrderStatus: async (id: string, status: string, note?: string, handoverOtp?: string) => {
    return api.patch(`/orders/${id}/status`, { status, note, handoverOtp });
  },

  cancelOrder: async (id: string, reason?: string) => {
    return api.post(`/orders/${id}/cancel`, { reason });
  },

  downloadInvoice: (id: string) => {
    window.open(`${api.defaults.baseURL}/orders/${id}/invoice`, '_blank');
  },

  downloadInvoicePdf: (id: string) => {
    window.open(`${api.defaults.baseURL}/orders/${id}/invoice`, '_blank');
  },
};
