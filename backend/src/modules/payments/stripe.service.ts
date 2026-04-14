import Stripe from 'stripe';
import { env } from '@/core/env';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY tanımlı değil');
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
  }
  return _stripe;
}

export async function createStripePaymentIntent(params: {
  amount: number; // cents
  currency: string;
  metadata: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    metadata: params.metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function verifyStripeWebhook(
  payload: Buffer | string,
  signature: string,
): Promise<Stripe.Event> {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET tanımlı değil');
  return getStripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}

export async function getStripePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.retrieve(id);
}
