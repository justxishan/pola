import { api } from './api';

export const DeliveryService = {
  getAvailableRadarTrips: async (lat: number, lng: number, radiusKm: number = 25) => {
    return api.get(`/delivery/available?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`);
  },

  acceptTrip: async (orderId: string) => {
    return api.post(`/delivery/trips/${orderId}/accept`);
  },

  updateLiveLocation: async (lat: number, lng: number) => {
    return api.post('/delivery/location', { latitude: lat, longitude: lng });
  },

  confirmHandoverDelivery: async (orderId: string, handoverOtp: string, photoProofUrl?: string) => {
    return api.post(`/delivery/trips/${orderId}/deliver`, { handoverOtp, photoProofUrl });
  },

  getMyDeliveryTrips: async () => {
    return api.get('/delivery/trips/history');
  },
};
