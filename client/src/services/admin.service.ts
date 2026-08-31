import { api } from './api';

export const AdminService = {
  getExecutiveDashboardKpis: async () => {
    return api.get('/admin/dashboard/kpis');
  },

  getKycVerificationQueue: async () => {
    return api.get('/admin/kyc/queue');
  },

  approveKycUser: async (userId: string) => {
    return api.patch(`/admin/kyc/${userId}/approve`);
  },

  rejectKycUser: async (userId: string, reason: string) => {
    return api.patch(`/admin/kyc/${userId}/reject`, { reason });
  },

  getLankaPayWithdrawalQueue: async () => {
    return api.get('/admin/payouts/queue');
  },

  processBankWithdrawal: async (id: string, bankReferenceNumber: string) => {
    return api.patch(`/admin/payouts/${id}/process`, { bankReferenceNumber });
  },

  forceReassignOrder: async (orderId: string, deliveryPartnerId: string, reason: string) => {
    return api.post('/admin/orders/force-reassign', { orderId, deliveryPartnerId, reason });
  },
};
