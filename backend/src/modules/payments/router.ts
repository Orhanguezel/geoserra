import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyStripeWebhook } from './stripe.service';
import { verifyPayPalWebhookSignature, capturePayPalOrder } from './paypal.service';
import { repoGetAnalysisByPaymentId, repoUpdateAnalysis } from '@/modules/analyses/repository';
import { AnalysisService } from '@/services/analysis.service';

export async function registerPayments(app: FastifyInstance) {
  /** POST /api/v1/payments/webhook/stripe */
  app.post('/webhook/stripe', {
    config: { rawBody: true } as any,
  }, handleStripeWebhook);

  /** POST /api/v1/payments/webhook/paypal */
  app.post('/webhook/paypal', handlePayPalWebhook);

  /** POST /api/v1/payments/paypal/capture/:orderId */
  app.post('/paypal/capture/:orderId', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } } as any,
  }, handlePayPalCapture);
}

async function handleStripeWebhook(req: FastifyRequest, reply: FastifyReply) {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) return reply.code(400).send({ error: 'Missing stripe-signature' });

  let event: any;
  try {
    const rawBody = (req as any).rawBody ?? req.body;
    event = await verifyStripeWebhook(rawBody, sig);
  } catch (err: any) {
    req.log?.error?.(err, 'stripe_webhook_verify_failed');
    return reply.code(400).send({ error: 'Invalid signature' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    await onPaymentSuccess({
      payment_id: intent.id,
      provider: 'stripe',
      amount: String(intent.amount / 100),
    });
  }

  return reply.send({ received: true });
}

async function handlePayPalWebhook(req: FastifyRequest, reply: FastifyReply) {
  const headers = req.headers as Record<string, string>;
  const body = JSON.stringify(req.body);

  const valid = await verifyPayPalWebhookSignature(headers, body);
  if (!valid) return reply.code(400).send({ error: 'Invalid signature' });

  const event = req.body as any;

  if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = event.resource?.id;
    if (orderId) {
      await onPaymentSuccess({ payment_id: orderId, provider: 'paypal', amount: event.resource?.amount?.value ?? '0' });
    }
  }

  return reply.send({ received: true });
}

async function handlePayPalCapture(req: FastifyRequest, reply: FastifyReply) {
  const { orderId } = req.params as { orderId: string };

  try {
    const result = await capturePayPalOrder(orderId);
    await onPaymentSuccess({
      payment_id: orderId,
      provider: 'paypal',
      amount: result.amount,
    });
    return reply.send({ ok: true });
  } catch (err: any) {
    req.log?.error?.(err, 'paypal_capture_failed');
    return reply.code(500).send({ error: 'CAPTURE_FAILED' });
  }
}

async function onPaymentSuccess(params: {
  payment_id: string;
  provider: 'stripe' | 'paypal';
  amount: string;
}) {
  const analysis = await repoGetAnalysisByPaymentId(params.payment_id);
  if (!analysis) return;
  if (analysis.status === 'completed' || analysis.status === 'processing') return;

  await repoUpdateAnalysis(analysis.id, {
    status: 'processing',
    payment_currency: 'USD',
    payment_amount: params.amount,
  });

  // Tam analizi başlat (asenkron)
  AnalysisService.runFullAnalysis(analysis.id, analysis.url as string, analysis.email).catch((err) =>
    console.error('[PaymentWebhook] runFullAnalysis failed:', err),
  );
}
