import { cloudinary } from '../config/cloudinary.config.js';
import { UploadApiResponse } from 'cloudinary';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.util.js';

export class CloudinaryService {
  /**
   * Upload a memory buffer (from multer) directly to Cloudinary
   */
  static uploadBuffer(
    buffer: Buffer,
    folder: string = 'pola/uploads',
    resourceType: 'image' | 'raw' | 'auto' = 'auto'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          format: resourceType === 'image' ? 'webp' : undefined,
        },
        (error, result) => {
          if (error || !result) {
            logger.error(`Cloudinary upload failed: ${error?.message}`);
            return reject(new AppError('Failed to upload file to Cloudinary', 500));
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  }
}
