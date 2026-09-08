import { CloudinaryService } from '../services/cloudinary.service.js';

/**
 * Upload multiple Multer files to Cloudinary in parallel
 */
export async function uploadFilesToCloudinary(
  files: Express.Multer.File[] | undefined,
  folder: string = 'pola/uploads'
): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) =>
    CloudinaryService.uploadBuffer(file.buffer, folder, 'image')
  );
  const results = await Promise.all(uploadPromises);
  return results.map((r) => r.secure_url);
}

/**
 * Upload a single Multer file to Cloudinary
 */
export async function uploadSingleFileToCloudinary(
  file: Express.Multer.File | undefined,
  folder: string = 'pola/uploads',
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<string | undefined> {
  if (!file) return undefined;
  const result = await CloudinaryService.uploadBuffer(file.buffer, folder, resourceType);
  return result.secure_url;
}
