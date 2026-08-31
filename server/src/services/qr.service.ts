import QRCode from 'qrcode';
import { logger } from '../utils/logger.util.js';

export class QrService {
  /**
   * Generate a QR Code as a Base64 PNG Data URL
   */
  static async generateQrDataUrl(data: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 6,
        color: {
          dark: '#1b4332', // Dark forest green
          light: '#ffffff',
        },
      });
      return dataUrl;
    } catch (error: any) {
      logger.error(`Failed to generate QR code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a QR Code as a Buffer
   */
  static async generateQrBuffer(data: string): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 6,
      });
      return buffer;
    } catch (error: any) {
      logger.error(`Failed to generate QR buffer: ${error.message}`);
      throw error;
    }
  }
}
