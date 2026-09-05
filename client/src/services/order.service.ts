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

  getFarmerOrders: async (filters?: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number | string;
    maxAmount?: number | string;
    sortBy?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.minAmount !== undefined && filters.minAmount !== '') params.append('minAmount', String(filters.minAmount));
    if (filters?.maxAmount !== undefined && filters.maxAmount !== '') params.append('maxAmount', String(filters.maxAmount));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
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
