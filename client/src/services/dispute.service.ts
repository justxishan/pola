import { api } from './api';

export const DisputeService = {
  /** Open a new dispute (customer/buyer) */
  createDispute: async (
    orderId: string,
    reason: string,
    description: string,
    evidencePhotos?: File[]
  ) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('reason', reason);
    formData.append('description', description);
    if (evidencePhotos) {
      evidencePhotos.forEach((f) => formData.append('evidencePhotos', f));
    }
    return api.post('/disputes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Get disputes raised by the authenticated user */
  getMyDisputes: async () => {
    return api.get('/disputes/my-disputes');
  },

  /** Admin: get all open disputes */
  getAllDisputes: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/disputes${params}`);
  },

  getDisputeById: async (id: string) => {
    return api.get(`/disputes/${id}`);
  },

  /** Admin: adjudicate a dispute */
  adjudicateDispute: async (
    id: string,
    decision: 'full_refund' | 'partial_refund' | 'reject' | 'replace',
    notes: string,
    refundAmount?: number
  ) => {
    return api.patch(`/disputes/${id}/adjudicate`, { decision, notes, refundAmount });
  },
};
