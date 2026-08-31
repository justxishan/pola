import { Request, Response, NextFunction } from 'express';
import { Farm } from '../models/Farm.model.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';

export class FarmController {
  /**
   * Create a new Farm entry
   */
  static async createFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        farmName,
        province,
        district,
        addressLine,
        city,
        latitude,
        longitude,
        extentValue,
        extentUnit,
        ownershipType,
        irrigationType,
        primaryCrops,
        isOrganicCertified,
        notes,
      } = req.body;

      const farm = await Farm.create({
        farmerId: req.user!.userId,
        farmName,
        province,
        district,
        addressLine,
        city,
        gps: { latitude, longitude },
        extentValue,
        extentUnit,
        ownershipType,
        irrigationType,
        primaryCrops,
        isOrganicCertified,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Farm registered successfully',
        data: { farm },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all farms belonging to the authenticated farmer
   */
  static async getMyFarms(req: Request, res: Response, next: NextFunction) {
    try {
      const farms = await Farm.find({ farmerId: req.user!.userId, isActive: true });
      res.status(200).json({
        success: true,
        data: { farms },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Farm details by ID
   */
  static async getFarmById(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await Farm.findById(req.params.id);
      if (!farm) throw new AppError('Farm not found', 404);

      res.status(200).json({
        success: true,
        data: { farm },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update farm details
   */
  static async updateFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await Farm.findOne({ _id: req.params.id, farmerId: req.user!.userId });
      if (!farm) throw new AppError('Farm not found or unauthorized', 404);

      Object.assign(farm, req.body);
      if (req.body.latitude && req.body.longitude) {
        farm.gps = { latitude: req.body.latitude, longitude: req.body.longitude };
      }

      await farm.save();

      res.status(200).json({
        success: true,
        message: 'Farm updated successfully',
        data: { farm },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload organic certificate PDF/image for a farm
   */
  static async uploadOrganicCert(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await Farm.findOne({ _id: req.params.id, farmerId: req.user!.userId });
      if (!farm) throw new AppError('Farm not found or unauthorized', 404);

      if (!req.file) throw new AppError('No document file uploaded', 400);

      const result = await CloudinaryService.uploadBuffer(req.file.buffer, 'pola/organic_certs', 'raw');
      farm.isOrganicCertified = true;
      farm.organicCertificateDoc = result.secure_url;
      await farm.save();

      res.status(200).json({
        success: true,
        message: 'Organic certificate uploaded successfully',
        data: { docUrl: result.secure_url },
      });
    } catch (error) {
      next(error);
    }
  }
}
