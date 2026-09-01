import { api } from './api';

export const AdminService = {
  getExecutiveDashboardKpis: async () => {
    return api.get('/admin/dashboard');
  },

  // ── KYC Queue ────────────────────────────────────────────────────────────
  getKycVerificationQueue: async (role?: string) => {
    const params = role ? `?role=${role}` : '';
    return api.get(`/admin/kyc/queue${params}`);
  },

  /** Approve KYC — maps to PATCH /admin/kyc/:id/review with status=verified */
  approveKycUser: async (userId: string) => {
    return api.patch(`/admin/kyc/${userId}/review`, { status: 'verified' });
  },

  /** Reject KYC — maps to PATCH /admin/kyc/:id/review with status=rejected */
  rejectKycUser: async (userId: string, reason: string) => {
    return api.patch(`/admin/kyc/${userId}/review`, { status: 'rejected', rejectionReason: reason });
  },

  // ── Withdrawal Queue ──────────────────────────────────────────────────────
  getLankaPayWithdrawalQueue: async () => {
    return api.get('/admin/withdrawals/queue');
  },

  processBankWithdrawal: async (id: string, bankReferenceNumber: string) => {
    return api.post(`/admin/withdrawals/${id}/process`, { bankReferenceNumber });
  },

  rejectBankWithdrawal: async (id: string, rejectionReason: string) => {
    return api.post(`/admin/withdrawals/${id}/reject`, { rejectionReason });
  },

  // ── Order Oversight ───────────────────────────────────────────────────────
  getAllOrders: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return api.get('/admin/orders', { params });
  },

  forceReassignOrder: async (orderId: string, driverId: string, reason: string) => {
    return api.post(`/admin/orders/${orderId}/reassign`, { driverId, reason });
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  getAuditLogs: async (page: number = 1, action?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (action) params.append('action', action);
    return api.get(`/admin/audit-logs?${params.toString()}`);
  },

  // ── User Management ───────────────────────────────────────────────────────
  getUsers: async (filters?: { role?: string; status?: string; search?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    return api.get(`/admin/users?${params.toString()}`);
  },

  suspendUser: async (userId: string) => {
    return api.patch(`/admin/users/${userId}/suspend`);
  },

  reactivateUser: async (userId: string) => {
    return api.patch(`/admin/users/${userId}/reactivate`);
  },

  // ── Platform Config ───────────────────────────────────────────────────────
  getPlatformConfig: async () => {
    return api.get('/admin/platform-config');
  },

  updatePlatformConfig: async (data: {
    platformCommissionPercent?: number;
    collectorCommissionPercent?: number;
    gradeMultipliers?: { A?: number; B?: number; C?: number; rejected?: number };
    leg1FlatFeeLkr?: number;
    leg2BaseFeeLkr?: number;
  }) => {
    return api.patch('/admin/platform-config', data);
  },
};
