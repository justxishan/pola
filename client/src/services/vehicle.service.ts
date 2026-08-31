import { api } from './api';

export const VehicleService = {
  getMyVehicles: async () => {
    return api.get('/vehicles/my-vehicles');
  },

  registerVehicle: async (data: {
    vehicleType: string;
    licensePlate: string;
    capacityKg: number;
    hasColdStorage: boolean;
  }) => {
    return api.post('/vehicles', data);
  },

  uploadVehicleDocs: async (vehicleId: string, formData: FormData) => {
    return api.post(`/vehicles/${vehicleId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
