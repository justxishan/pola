import { api } from './api';

export const FarmService = {
  getMyFarms: async () => {
    return api.get('/farms/my-farms');
  },

  /** Create farm with a file attachment (organic cert) — multipart/form-data */
  createFarm: async (formData: FormData) => {
    return api.post('/farms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

  deleteFarm: async (id: string) => {
    return api.delete(`/farms/${id}`);
  },
};
