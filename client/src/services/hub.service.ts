import { api } from './api';

export const HubService = {
  getMyHubDropoffs: async () => {
    return api.get('/hubs/my-dropoffs');
  },

  getAllHubs: async (district?: string, province?: string) => {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (province) params.append('province', province);
    const query = params.toString();
    return api.get(`/hubs${query ? `?${query}` : ''}`);
  },

  getHubById: async (id: string) => {
    return api.get(`/hubs/${id}`);
  },

  getMySchedule: async () => {
    return api.get('/hubs/my-schedule');
  },

  acceptHubRun: async (hubId: string, vehicleId?: string) => {
    return api.post('/hubs/runs/accept', { hubId, vehicleId });
  },

  submitIntakeGrading: async (payload: {
    orderId: string;
    productId: string;
    confirmedQuantity: number;
    assignedGrade: string;
    criteriaNotes?: string;
  }) => {
    return api.post('/hubs/intake-grading', payload);
  },

  departForDc: async (hubId: string) => {
    return api.post('/hubs/runs/depart', { hubId });
  },

  confirmDcArrival: async (hubId: string, dcConfirmationCode?: string) => {
    return api.post('/hubs/runs/confirm-arrival', { hubId, dcConfirmationCode });
  },

  adminOverrideStatus: async (orderId: string, newStatus: string, reason?: string) => {
    return api.patch(`/hubs/orders/${orderId}/override-status`, { newStatus, reason });
  },
};
