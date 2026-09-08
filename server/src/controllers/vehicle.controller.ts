import { Request, Response, NextFunction } from 'express';
import { Vehicle } from '../models/Vehicle.model.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { validateSriLankanPlate, VerificationStatus } from '@pola/shared';

export class VehicleController {
  /**
   * Register a new vehicle
   */
  static async registerVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.userId;
      const {
        registrationPlate,
        vehicleType,
        makeModel,
        yearOfManufacture,
        maxPayloadKg,
        hasColdChain,
        minTemperatureCelsius,
        revenueLicenseExpiry,
        insuranceExpiry,
      } = req.body;

      const plateCheck = validateSriLankanPlate(registrationPlate);
      if (!plateCheck.isValid) {
        throw new AppError('Invalid Sri Lankan vehicle license plate format', 400);
      }

      const existing = await Vehicle.findOne({
        registrationPlate: plateCheck.normalizedPlate,
      });
      if (existing) {
        throw new AppError('A vehicle with this registration plate is already registered', 400);
      }

      const vehicle = await Vehicle.create({
        ownerId,
        registrationPlate: plateCheck.normalizedPlate,
        vehicleType,
        makeModel,
        yearOfManufacture,
        maxPayloadKg,
        hasColdChain: hasColdChain || false,
        minTemperatureCelsius,
        revenueLicenseExpiry,
        insuranceExpiry,
        status: VerificationStatus.PENDING,
      });

      res.status(201).json({
        success: true,
        message: 'Vehicle registered and submitted for verification',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all vehicles belonging to the authenticated driver/fleet company
   */
  static async getMyVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.userId;
      const vehicles = await Vehicle.find({ ownerId });

      res.status(200).json({
        success: true,
        data: { vehicles },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload vehicle documents (CR Book & Revenue License)
   */
  static async uploadDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.userId;
      const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId });
      if (!vehicle) throw new AppError('Vehicle not found or unauthorized', 404);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files?.crBook && files.crBook[0]) {
        const upload = await CloudinaryService.uploadBuffer(files.crBook[0].buffer, 'pola/vehicles', 'raw');
        vehicle.crBookDoc = upload.secure_url;
      }
      if (files?.revenueLicense && files.revenueLicense[0]) {
        const upload = await CloudinaryService.uploadBuffer(
          files.revenueLicense[0].buffer,
          'pola/vehicles',
          'raw'
        );
        vehicle.revenueLicenseDoc = upload.secure_url;
      }

      await vehicle.save();

      res.status(200).json({
        success: true,
        message: 'Vehicle documents uploaded successfully',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get all vehicles awaiting verification
   */
  static async getPendingVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await Vehicle.find({ status: VerificationStatus.PENDING })
        .populate('ownerId', 'fullName email phone')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { vehicles },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Verify or reject a vehicle
   */
  static async verifyVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { approved, rejectionReason } = req.body;
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) throw new AppError('Vehicle not found', 404);

      vehicle.status = approved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;
      if (!approved && rejectionReason) {
        vehicle.rejectionReason = rejectionReason;
      }
      await vehicle.save();

      res.status(200).json({
        success: true,
        message: `Vehicle ${approved ? 'verified' : 'rejected'} successfully`,
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vehicle operational status (active / maintenance / suspended)
   */
  static async updateOperationalStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.userId;
      const { id } = req.params;
      const { operationalStatus } = req.body;

      if (!['active', 'maintenance', 'suspended'].includes(operationalStatus)) {
        throw new AppError('Invalid operational status', 400);
      }

      const vehicle = await Vehicle.findOne({ _id: id, ownerId });
      if (!vehicle) throw new AppError('Vehicle not found or unauthorized', 404);

      vehicle.operationalStatus = operationalStatus;
      await vehicle.save();

      res.status(200).json({
        success: true,
        message: `Vehicle operational status updated to ${operationalStatus}`,
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Company Fleet: Assign driver to company-owned vehicle
   */
  static async assignDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.user!.userId;
      const { id } = req.params;
      const { driverId } = req.body;

      const vehicle = await Vehicle.findOne({ _id: id, ownerId: companyId });
      if (!vehicle) throw new AppError('Company vehicle not found or unauthorized', 404);

      vehicle.assignedDriverId = driverId ? (driverId as any) : undefined;
      await vehicle.save();

      res.status(200).json({
        success: true,
        message: driverId ? 'Driver assigned to vehicle successfully' : 'Driver unassigned from vehicle',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }
}
