import type { FastifyInstance } from 'fastify';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { analyses } from '@/modules/analyses/schema';
import { implementation_requests } from '@/modules/implementation/schema';

async function countAnalyses(where?: ReturnType<typeof and>): Promise<number> {
  const query = db.select({ id: analyses.id }).from(analyses);
  const rows = where ? await query.where(where) : await query;
  return rows.length;
}

async function countImplementations(where?: ReturnType<typeof and>): Promise<number> {
  const query = db.select({ id: implementation_requests.id }).from(implementation_requests);
  const rows = where ? await query.where(where) : await query;
  return rows.length;
}

export async function registerStatsAdmin(app: FastifyInstance) {
  app.get('/stats', async () => {
    const [
      total_analyses,
      completed_analyses,
      failed_analyses,
      pending_analyses,
      paid_analyses,
      pending_implementations,
      total_implementations,
    ] = await Promise.all([
      countAnalyses(),
      countAnalyses(eq(analyses.status, 'completed')),
      countAnalyses(eq(analyses.status, 'failed')),
      countAnalyses(inArray(analyses.status, ['pending', 'processing'])),
      countAnalyses(and(eq(analyses.status, 'completed'), isNotNull(analyses.payment_id))),
      countImplementations(eq(implementation_requests.status, 'pending')),
      countImplementations(),
    ]);

    return {
      total_analyses,
      completed_analyses,
      failed_analyses,
      pending_analyses,
      paid_analyses,
      pending_implementations,
      total_implementations,
    };
  });
}
