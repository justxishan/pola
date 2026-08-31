import { api } from './api';

export const FarmService = {
  getMyFarms: async () => {
    return api.get('/farms/my-farms');
  },

  createFarm: async (formData: FormData) => {
    return api.post('/farms', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
