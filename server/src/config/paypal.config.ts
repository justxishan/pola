import { env } from './env.config.js';
import { logger } from '../utils/logger.util.js';

const PAYPAL_BASE_URL =
  env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export const getPayPalAccessToken = async (): Promise<string> => {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    return cachedAccessToken.token;
  }

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal Client ID or Secret is not configured.');
  }

  const auth = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`PayPal OAuth token failure: ${errorText}`);
    throw new Error(`Failed to generate PayPal access token: ${response.statusText}`);
  }

  const data: any = await response.json();
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedAccessToken.token;
};

export const createPayPalOrder = async (
  amountUSD: number,
  orderReferenceId: string,
  description: string = 'Pola Agricultural Marketplace Order'
): Promise<any> => {
  const token = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderReferenceId,
          description,
          amount: {
            currency_code: 'USD',
            value: amountUSD.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Pola Marketplace (පොළ)',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${env.CLIENT_URL}/checkout/success`,
        cancel_url: `${env.CLIENT_URL}/checkout/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error(`PayPal Create Order Error: ${err}`);
    throw new Error('Failed to create PayPal order');
  }

  return response.json();
};

export const capturePayPalOrder = async (orderId: string): Promise<any> => {
  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    logger.error(`PayPal Capture Order Error: ${err}`);
    throw new Error('Failed to capture PayPal payment');
  }

  return response.json();
};
