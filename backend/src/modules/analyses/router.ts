import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@vps/shared-backend/middleware/auth';
import { analyzeFree, analyzePaid, getAnalysisStatus, downloadAnalysisPdf, getMyAnalyses } from './controller';

export async function registerAnalyses(app: FastifyInstance) {
  const B = '/analyze';

  app.post(`${B}/free`, {
    config: { rateLimit: { max: 3, timeWindow: '10 minutes' } } as any,
  }, analyzeFree);

  app.post(`${B}/paid`, {
    config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } as any,
  }, analyzePaid);

  app.get(`${B}/:id/status`, getAnalysisStatus);
  app.get(`${B}/:id/download`, downloadAnalysisPdf);

  // Oturum açmış kullanıcının kendi analizleri
  app.get('/analyses/mine', { preHandler: [requireAuth] }, getMyAnalyses);
}
