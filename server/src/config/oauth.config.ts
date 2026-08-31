import { OAuth2Client } from 'google-auth-library';
import { env } from './env.config.js';
import { logger } from '../utils/logger.util.js';

export const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface GooglePayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export const verifyGoogleIdToken = async (idToken: string): Promise<GooglePayload> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token payload');
    }

    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error: any) {
    logger.error(`Google token verification error: ${error.message}`);
    throw new Error('Failed to verify Google Identity token');
  }
};
