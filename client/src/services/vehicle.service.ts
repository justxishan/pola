import { api } from './api';

export const VehicleService = {
  getMyVehicles: async () => {
    return api.get('/vehicles/my-vehicles');
  },

  registerVehicle: async (data: {
    vehicleType: string;
    registrationPlate?: string;
    licensePlate?: string;
    makeModel?: string;
    maxPayloadKg?: number;
    capacityKg?: number;
    hasColdChain?: boolean;
    hasColdStorage?: boolean;
    yearOfManufacture?: number;
  }) => {
    const payload = {
      vehicleType: data.vehicleType,
      registrationPlate: data.registrationPlate || data.licensePlate,
      makeModel: data.makeModel || 'Standard Commercial',
      maxPayloadKg: data.maxPayloadKg ?? data.capacityKg ?? 500,
      hasColdChain: data.hasColdChain ?? data.hasColdStorage ?? false,
      yearOfManufacture: data.yearOfManufacture,
    };
    return api.post('/vehicles', payload);
  },

  uploadVehicleDocs: async (vehicleId: string, formData: FormData) => {
    return api.post(`/vehicles/${vehicleId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
