import { env } from '@/core/env';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

let _token: string | null = null;
let _tokenExpiry = 0;

async function getPayPalToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL } = env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials tanımlı değil');
  }

  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);

  const data = (await res.json()) as PayPalTokenResponse;
  _token = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 60s buffer
  return _token;
}

export async function createPayPalOrder(params: {
  amount_usd: number;
  description: string;
  custom_id: string; // analysis_id
}): Promise<PayPalOrderResponse> {
  const token = await getPayPalToken();

  const res = await fetch(`${env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: params.amount_usd.toFixed(2),
          },
          description: params.description,
          custom_id: params.custom_id,
        },
      ],
      application_context: {
        brand_name: 'GeoSerra',
        return_url: `${env.FRONTEND_URL}/thank-you`,
        cancel_url: `${env.FRONTEND_URL}/pricing`,
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal order create error: ${res.status} ${err}`);
  }

  return res.json() as Promise<PayPalOrderResponse>;
}

export async function capturePayPalOrder(orderId: string): Promise<{ custom_id: string; amount: string }> {
  const token = await getPayPalToken();

  const res = await fetch(`${env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture error: ${res.status} ${err}`);
  }

  const data = await res.json() as any;
  const unit = data.purchase_units?.[0];
  return {
    custom_id: unit?.custom_id ?? '',
    amount: unit?.payments?.captures?.[0]?.amount?.value ?? '0',
  };
}

export async function verifyPayPalWebhookSignature(headers: Record<string, string>, body: string): Promise<boolean> {
  if (!env.PAYPAL_WEBHOOK_ID) return false;

  const token = await getPayPalToken();

  const res = await fetch(`${env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return false;
  const result = (await res.json()) as { verification_status: string };
  return result.verification_status === 'SUCCESS';
}
