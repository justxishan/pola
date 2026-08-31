import { VerificationStatus } from '../enums/VehicleType.enum.js';

export interface NicDetails {
  nicNumber: string;
  isOldFormat: boolean;
  birthYear?: number;
  birthDate?: string;
  gender?: 'male' | 'female';
  isValid: boolean;
}

export interface KycSubmission {
  userId: string;
  nicNumber: string;
  nicFrontImage: string;
  nicBackImage: string;
  selfieImage?: string;
  businessRegNumber?: string;
  businessRegDoc?: string;
  organicCertificateDoc?: string;
  drivingLicenseNumber?: string;
  drivingLicenseImage?: string;
  vehicleRegistrationNumber?: string;
  vehicleCrDoc?: string;
  status: VerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
