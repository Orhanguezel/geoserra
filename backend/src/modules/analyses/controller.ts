import type { FastifyRequest, FastifyReply } from 'fastify';
import { FreeAnalysisSchema, PaidAnalysisSchema } from './validation';
import {
  repoIsDomainLocked,
  repoLockDomain,
  repoCreateAnalysis,
  repoGetAnalysisById,
  repoUpdateAnalysis,
} from './repository';
import { AnalysisService } from '@/services/analysis.service';
import { createStripePaymentIntent } from '@/modules/payments/stripe.service';
import { createPayPalOrder } from '@/modules/payments/paypal.service';
import { PACKAGES } from '@/modules/payments/packages';

/** POST /api/v1/analyze/free */
export async function analyzeFree(req: FastifyRequest, reply: FastifyReply) {
  const parsed = FreeAnalysisSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });
  }

  const { url, email } = parsed.data;
  const domain = extractDomain(url);

  // Domain lock kontrolü
  const locked = await repoIsDomainLocked(domain);
  if (locked) {
    return reply.code(409).send({
      error: 'DOMAIN_ALREADY_ANALYZED',
      message: 'Bu domain için ücretsiz analiz hakkı kullanıldı.',
      domain,
    });
  }

  // Analiz kaydı oluştur
  const analysis = await repoCreateAnalysis({
    url,
    domain,
    email,
    status: 'processing',
    package_slug: 'free',
  });

  // Domain'i kilitle
  await repoLockDomain(domain);

  // Analizi asenkron başlat (non-blocking)
  AnalysisService.runFreeAnalysis(analysis.id, url).catch((err) => {
    req.log?.error?.(err, 'free_analysis_failed');
  });

  return reply.code(202).send({
    analysis_id: analysis.id,
    status: 'processing',
    message: 'Analiz başlatıldı. Sonuçları status endpoint ile takip edebilirsiniz.',
  });
}

/** POST /api/v1/analyze/paid */
export async function analyzePaid(req: FastifyRequest, reply: FastifyReply) {
  const parsed = PaidAnalysisSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });
  }

  const { url, email, package: pkg, payment_provider, locale } = parsed.data;
  const domain = extractDomain(url);
  const packageInfo = PACKAGES[pkg];

  if (!packageInfo) {
    return reply.code(400).send({ error: 'INVALID_PACKAGE' });
  }

  // Analiz kaydı oluştur (pending — ödeme bekleniyor)
  const analysis = await repoCreateAnalysis({
    url,
    domain,
    email,
    status: 'pending',
    package_slug: pkg,
  });

  try {
    if (payment_provider === 'stripe') {
      const intent = await createStripePaymentIntent({
        amount: packageInfo.price_usd_cents,
        currency: 'usd',
        metadata: {
          analysis_id: analysis.id,
          package: pkg,
          email,
          domain,
        },
      });

      await repoUpdateAnalysis(analysis.id, {
        payment_provider: 'stripe',
        payment_id: intent.id,
        payment_amount: String(packageInfo.price_usd_cents / 100),
      });

      return reply.code(200).send({
        analysis_id: analysis.id,
        client_secret: intent.client_secret,
        payment_provider: 'stripe',
        amount: packageInfo.price_usd_cents,
        currency: 'usd',
        package: packageInfo,
      });
    }

    if (payment_provider === 'paypal') {
      const order = await createPayPalOrder({
        amount_usd: packageInfo.price_usd,
        description: packageInfo.name[locale as 'tr' | 'en'] ?? packageInfo.name.en,
        custom_id: analysis.id,
      });

      await repoUpdateAnalysis(analysis.id, {
        payment_provider: 'paypal',
        payment_id: order.id,
        payment_amount: String(packageInfo.price_usd),
      });

      return reply.code(200).send({
        analysis_id: analysis.id,
        paypal_order_id: order.id,
        payment_provider: 'paypal',
        amount: packageInfo.price_usd,
        currency: 'USD',
        package: packageInfo,
      });
    }

    return reply.code(400).send({ error: 'INVALID_PAYMENT_PROVIDER' });
  } catch (err: any) {
    await repoUpdateAnalysis(analysis.id, {
      status: 'failed',
      error_message: err?.message ?? 'Ödeme başlatılamadı',
    });
    req.log?.error?.(err, 'paid_analysis_payment_init_failed');
    return reply.code(500).send({ error: 'PAYMENT_INIT_FAILED' });
  }
}

/** GET /api/v1/analyze/:id/status */
export async function getAnalysisStatus(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const analysis = await repoGetAnalysisById(id);

  if (!analysis) {
    return reply.code(404).send({ error: 'NOT_FOUND' });
  }

  const response: Record<string, any> = {
    id: analysis.id,
    status: analysis.status,
    domain: analysis.domain,
    package_slug: analysis.package_slug,
    created_at: analysis.created_at,
    completed_at: analysis.completed_at,
  };

  // Ücretsiz tamamlanmışsa kısıtlı veriyi döndür
  if (analysis.status === 'completed' && analysis.package_slug === 'free' && analysis.free_data) {
    response.free_data = analysis.free_data;
  }

  // Ücretli tamamlanmışsa PDF hazır bildirimi
  if (analysis.status === 'completed' && analysis.package_slug !== 'free') {
    response.full_data = analysis.full_data;
    response.pdf_ready = !!analysis.pdf_path;
    response.pdf_sent_at = analysis.pdf_sent_at;
  }

  return reply.send(response);
}

/** GET /api/v1/analyze/:id/download */
export async function downloadAnalysisPdf(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const analysis = await repoGetAnalysisById(id);

  if (!analysis || analysis.status !== 'completed' || !analysis.pdf_path) {
    return reply.code(404).send({ error: 'PDF_NOT_READY' });
  }

  if (analysis.package_slug === 'free') {
    return reply.code(403).send({ error: 'PDF_NOT_AVAILABLE_FOR_FREE' });
  }

  // Geçici download URL döndür (PDF /reports/ prefix'i altında statik serve edilir)
  const filename = analysis.pdf_path.split('/').pop();
  return reply.send({
    download_url: `/reports/${filename}`,
    expires_in: 3600,
  });
}

// ─── Helper ─────────────────────────────────────────────────────────────────

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').split('/')[0] ?? url;
  }
}
