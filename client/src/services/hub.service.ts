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
};
