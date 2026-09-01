import { api } from './api';

export const DeliveryService = {
  getAvailableRadarTrips: async (lat?: number, lng?: number, radiusKm: number = 25) => {
    const params = new URLSearchParams({ radiusKm: String(radiusKm) });
    if (lat !== undefined) params.append('lat', String(lat));
    if (lng !== undefined) params.append('lng', String(lng));
    return api.get(`/delivery/radar?${params.toString()}`);
  },

  acceptTrip: async (orderId: string, vehicleId?: string) => {
    return api.post(`/delivery/trips/${orderId}/accept`, { vehicleId });
  },

  /** Advance transit status (e.g. from assigned_for_delivery -> out_for_delivery) */
  updateTransitStatus: async (orderId: string, status: string, note?: string) => {
    return api.patch(`/delivery/trips/${orderId}/status`, { status, note });
  },

  updateLiveLocation: async (lat: number, lng: number, isOnline?: boolean) => {
    return api.post('/delivery/location', { latitude: lat, longitude: lng, isOnline });
  },

  /** Submit proof of delivery with OTP handover and optional photo */
  confirmHandoverDelivery: async (orderId: string, handoverOtp: string, podPhotoFile?: File) => {
    const formData = new FormData();
    formData.append('handoverOtp', handoverOtp);
    if (podPhotoFile) formData.append('podPhoto', podPhotoFile);
    return api.post(`/delivery/trips/${orderId}/pod`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Get driver's current active (out_for_delivery) trip */
  getActiveTrip: async () => {
    return api.get('/delivery/trips/active');
  },

  /** Get completed trip history */
  getMyDeliveryTrips: async () => {
    return api.get('/delivery/trips/history');
  },

  /** Get earnings stats + completed trips for earnings page */
  getEarnings: async () => {
    return api.get('/delivery/earnings');
  },
};
