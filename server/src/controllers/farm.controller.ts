import { Request, Response, NextFunction } from 'express';
import { Farm } from '../models/Farm.model.js';
import { Product } from '../models/Product.model.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { uploadSingleFileToCloudinary } from '../utils/uploadFiles.util.js';
import { AppError } from '../middleware/error.middleware.js';

export class FarmController {
  /**
   * Create a new Farm entry
   */
  static async createFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        farmName, province, district, addressLine, city, latitude, longitude,
        extentValue, extentUnit, ownershipType, irrigationType, primaryCrops,
        isOrganicCertified, notes,
      } = req.body;

      const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
      const verificationDocFile = files?.verificationDoc?.[0];
      const organicCertFile = files?.organicCertificate?.[0];

      if (!verificationDocFile) {
        throw new AppError('A land ownership / permit verification document is required to register a farm', 400);
      }

      const verificationDoc = await uploadSingleFileToCloudinary(verificationDocFile, 'pola/farm_verification_docs', 'raw');

      let organicCertificateDoc: string | undefined;
      let organicFlag = isOrganicCertified === 'true' || isOrganicCertified === true;
      if (organicCertFile) {
        organicCertificateDoc = await uploadSingleFileToCloudinary(organicCertFile, 'pola/organic_certs', 'raw');
        if (organicCertificateDoc) organicFlag = true;
      }

      const farm = await Farm.create({
        farmerId: req.user!.userId,
        farmName, province, district, addressLine, city,
        gps: (latitude !== undefined && longitude !== undefined && !isNaN(Number(latitude)) && !isNaN(Number(longitude)))
          ? { latitude: Number(latitude), longitude: Number(longitude) } : undefined,
        extentValue, extentUnit, ownershipType, irrigationType, primaryCrops,
        isOrganicCertified: organicFlag,
        organicCertificateDoc,
        verificationDoc,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Farm registered successfully and submitted for admin verification',
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
      const farms = await Farm.find({ farmerId: req.user!.userId }).sort({ isActive: -1, createdAt: -1 });
      res.status(200).json({ success: true, data: { farms } });
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

      const { isActive, verificationStatus, farmerId, verificationDoc, ...allowedUpdates } = req.body;
      Object.assign(farm, allowedUpdates);
      if (req.body.latitude && req.body.longitude) {
        farm.gps = { latitude: req.body.latitude, longitude: req.body.longitude };
      }
      await farm.save();

      res.status(200).json({ success: true, message: 'Farm updated successfully', data: { farm } });
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

  /**
   * Deactivate a farm — crops stay in the DB, just hidden from marketplace
   */
  static async deactivateFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await Farm.findOne({ _id: req.params.id, farmerId: req.user!.userId });
      if (!farm) throw new AppError('Farm not found or unauthorized', 404);
      if (!farm.isActive) throw new AppError('Farm is already deactivated', 409);

      farm.isActive = false;
      await farm.save();

      res.status(200).json({
        success: true,
        message: `Farm "${farm.farmName}" deactivated. Its crop listings are hidden from the marketplace but not deleted.`,
        data: { farm },
      });
    } catch (error) {
      next(error);
    }
  }

  static async reactivateFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await Farm.findOne({ _id: req.params.id, farmerId: req.user!.userId });
      if (!farm) throw new AppError('Farm not found or unauthorized', 404);
      if (farm.isActive) throw new AppError('Farm is already active', 409);

      farm.isActive = true;
      await farm.save();

      res.status(200).json({
        success: true,
        message: `Farm "${farm.farmName}" reactivated.`,
        data: { farm },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Permanently delete a farm. Only allowed once deactivated, and only if it has
   * no crop listing history (harvested crop records must never be deleted).
   */
  static async deleteFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await Farm.findOne({ _id: req.params.id, farmerId: req.user!.userId });
      if (!farm) throw new AppError('Farm not found or unauthorized', 404);
      if (farm.isActive) throw new AppError('Deactivate the farm before deleting it', 400);

      const cropCount = await Product.countDocuments({ farmId: farm._id });
      if (cropCount > 0) {
        throw new AppError(
          'This farm has crop listing history and cannot be permanently deleted. It will remain in your deactivated farms list.',
          409
        );
      }

      await farm.deleteOne();
      res.status(200).json({ success: true, message: `Farm "${farm.farmName}" deleted.` });
    } catch (error) {
      next(error);
    }
  }
}
