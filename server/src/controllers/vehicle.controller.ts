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
}
