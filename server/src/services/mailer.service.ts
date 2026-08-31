import { sendEmail } from '../config/mailer.config.js';
import { logger } from '../utils/logger.util.js';

export class MailerService {
  /**
   * Send 6-digit OTP Code for Login / Registration
   */
  static async sendOtpEmail(toEmail: string, otpCode: string, name: string = 'User') {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2d6a4f; margin: 0; font-size: 26px;">Pola (පොළ)</h1>
          <p style="color: #666666; font-size: 13px; margin: 4px 0 0 0;">Sri Lanka's Agricultural Marketplace</p>
        </div>
        <div style="padding: 16px; background-color: #f4fbf7; border-left: 4px solid #2d6a4f; border-radius: 4px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px 0; color: #1b4332;">Authentication Code</h3>
          <p style="margin: 0; color: #444444; font-size: 14px;">Hello ${name}, use the one-time password below to authenticate your Pola account. Valid for 10 minutes.</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d6a4f; padding: 12px 24px; background: #e8f5e9; border-radius: 8px; border: 1px dashed #2d6a4f;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 24px;">
          If you did not request this OTP, please ignore this email or contact Pola Security at support@pola.lk.
        </p>
      </div>
    `;

    return sendEmail({
      to: toEmail,
      subject: `Your Pola Verification Code: ${otpCode}`,
      html,
    });
  }

  /**
   * Send Order Placed / Status update email
   */
  static async sendOrderStatusEmail(
    toEmail: string,
    orderNumber: string,
    statusText: string,
    detailsText: string
  ) {
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2d6a4f;">Pola Order Update</h2>
        <p>Your order <strong>#${orderNumber}</strong> has an update:</p>
        <div style="padding: 12px; background: #f0fdf4; border-radius: 6px; font-weight: bold; color: #166534;">
          Status: ${statusText}
        </div>
        <p style="margin-top: 16px; color: #555;">${detailsText}</p>
        <p style="font-size: 12px; color: #999; margin-top: 24px;">Track your live produce delivery at pola.lk</p>
      </div>
    `;

    return sendEmail({
      to: toEmail,
      subject: `Update on your Pola Order #${orderNumber}`,
      html,
    });
  }
}
