import { Request, Response, NextFunction } from 'express';
import { DistributionCenter } from '../models/DistributionCenter.model.js';

export class DcController {
  /**
   * Get all active Distribution Centers
   */
  static async getDistributionCenters(req: Request, res: Response, next: NextFunction) {
    try {
      const centers = await DistributionCenter.find({ isActive: true }).sort({ isMainHub: -1, name: 1 });
      res.status(200).json({
        success: true,
        data: { centers, distributionCenters: centers },
      });
    } catch (error) {
      next(error);
    }
  }
}
