import { api } from './api';

export const FarmService = {
  getMyFarms: async () => {
    return api.get('/farms/my-farms');
  },

  /** Create farm with a file attachment (organic cert) — multipart FormData */
  createFarm: async (formData: FormData) => {
    return api.post('/farms', formData);
  },

  /** Create farm without file — plain JSON so Zod number() validation works */
  createFarmJson: async (data: {
    farmName: string;
    province: string;
    district: string;
    addressLine: string;
    city: string;
    latitude: number;
    longitude: number;
    extentValue: number;
    extentUnit?: string;
    ownershipType: string;
    irrigationType: string;
    isOrganicCertified?: boolean;
    primaryCrops?: string[];
    notes?: string;
  }) => {
    return api.post('/farms', data);
  },

  getFarmById: async (id: string) => {
    return api.get(`/farms/${id}`);
  },

  updateFarm: async (id: string, data: any) => {
    return api.patch(`/farms/${id}`, data);
  },

  deactivateFarm: async (id: string) => {
    return api.patch(`/farms/${id}/deactivate`, {});
  },

  reactivateFarm: async (id: string) => {
    return api.patch(`/farms/${id}/reactivate`, {});
  },

  deleteFarm: async (id: string) => {
    return api.delete(`/farms/${id}`);
  },
};
