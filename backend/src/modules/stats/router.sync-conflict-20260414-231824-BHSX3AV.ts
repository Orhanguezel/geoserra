import type { FastifyInstance } from 'fastify';
import { db } from '@/db/client';
import { analyses } from '@/modules/analyses/schema';
import { implementation_requests } from '@/modules/implementation/schema';
import { eq, count, and, inArray } from 'drizzle-orm';

export async function registerStatsAdmin(app: FastifyInstance) {
  app.get('/stats', async (_req, reply) => {
    const [
      total,
      completed,
      failed,
      pending,
      paid,
      pendingImpl,
      totalImpl,
    ] = await Promise.all([
      db.select({ c: count() }).from(analyses),
      db.select({ c: count() }).from(analyses).where(eq(analyses.status, 'completed')),
      db.select({ c: count() }).from(analyses).where(eq(analyses.status, 'failed')),
      db.select({ c: count() }).from(analyses).where(inArray(analyses.status, ['pending', 'processing'])),
      db.select({ c: count() }).from(analyses).where(inArray(analyses.package_slug, ['starter', 'pro', 'expert'])),
      db.select({ c: count() }).from(implementation_requests).where(eq(implementation_requests.status, 'pending')),
      db.select({ c: count() }).from(implementation_requests),
    ]);

    return reply.send({
      total_analyses: total[0]?.c ?? 0,
      completed_analyses: completed[0]?.c ?? 0,
      failed_analyses: failed[0]?.c ?? 0,
      pending_analyses: pending[0]?.c ?? 0,
      paid_analyses: paid[0]?.c ?? 0,
      pending_implementations: pendingImpl[0]?.c ?? 0,
      total_implementations: totalImpl[0]?.c ?? 0,
    });
  });
}
