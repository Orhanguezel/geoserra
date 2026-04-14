import type { FastifyRequest, FastifyReply } from 'fastify';
import { AnalysisListParamsSchema } from './validation';
import {
  repoListAnalyses,
  repoGetAnalysisById,
  repoUpdateAnalysis,
  repoCountAnalyses,
} from './repository';
import { PdfService } from '@/services/pdf.service';
import { AnalysisService } from '@/services/analysis.service';

/** GET /api/v1/admin/analyses */
export async function listAnalysesAdmin(req: FastifyRequest, reply: FastifyReply) {
  const params = AnalysisListParamsSchema.parse(req.query ?? {});
  const [list, total] = await Promise.all([
    repoListAnalyses(params),
    repoCountAnalyses(params),
  ]);
  reply.header('x-total-count', total);
  return reply.send(list);
}

/** GET /api/v1/admin/analyses/:id */
export async function getAnalysisAdmin(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const row = await repoGetAnalysisById(id);
  if (!row) return reply.code(404).send({ error: 'NOT_FOUND' });
  return reply.send(row);
}

/** POST /api/v1/admin/analyses/:id/resend-pdf */
export async function resendPdfAdmin(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const analysis = await repoGetAnalysisById(id);

  if (!analysis) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (analysis.status !== 'completed' || !analysis.pdf_path) {
    return reply.code(400).send({ error: 'PDF_NOT_READY' });
  }

  try {
    await PdfService.sendPdfEmail(analysis);
    await repoUpdateAnalysis(id, { pdf_sent_at: new Date() });
    return reply.send({ ok: true, message: 'PDF yeniden gönderildi.' });
  } catch (err: any) {
    req.log?.error?.(err, 'admin_resend_pdf_failed');
    return reply.code(500).send({ error: 'SEND_FAILED', message: err?.message });
  }
}

/** POST /api/v1/admin/analyses/:id/rerun */
export async function rerunAnalysisAdmin(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const analysis = await repoGetAnalysisById(id);

  if (!analysis) return reply.code(404).send({ error: 'NOT_FOUND' });

  await repoUpdateAnalysis(id, { status: 'processing', error_message: null });

  if (analysis.package_slug === 'free') {
    AnalysisService.runFreeAnalysis(id, analysis.url as string).catch((err) =>
      req.log?.error?.(err, 'admin_rerun_free_failed'),
    );
  } else {
    AnalysisService.runFullAnalysis(id, analysis.url as string, analysis.email).catch((err) =>
      req.log?.error?.(err, 'admin_rerun_full_failed'),
    );
  }

  return reply.send({ ok: true, status: 'processing' });
}

/** PATCH /api/v1/admin/analyses/:id */
export async function updateAnalysisAdmin(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const { admin_notes } = req.body as { admin_notes?: string };
  const updated = await repoUpdateAnalysis(id, { error_message: admin_notes });
  if (!updated) return reply.code(404).send({ error: 'NOT_FOUND' });
  return reply.send(updated);
}
