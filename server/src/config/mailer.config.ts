import nodemailer from 'nodemailer';
import { env } from './env.config.js';
import { logger } from '../utils/logger.util.js';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const verifyMailerConnection = async (): Promise<boolean> => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('⚠️ SMTP Credentials not provided. Email delivery disabled.');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('📧 SMTP Mailer connection verified successfully.');
    return true;
  } catch (error: any) {
    logger.warn(`⚠️ SMTP Mailer verification warning: ${error.message}`);
    return false;
  }
};

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });
    logger.info(`✉️ Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error: any) {
    logger.error(`❌ Failed to send email to ${options.to}: ${error.message}`);
    throw error;
  }
};
