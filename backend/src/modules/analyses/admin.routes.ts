import type { FastifyInstance } from 'fastify';
import {
  listAnalysesAdmin,
  getAnalysisAdmin,
  resendPdfAdmin,
  rerunAnalysisAdmin,
  updateAnalysisAdmin,
} from './admin.controller';

export async function registerAnalysesAdmin(app: FastifyInstance) {
  const B = '/analyses';
  app.get(B, listAnalysesAdmin);
  app.get(`${B}/:id`, getAnalysisAdmin);
  app.patch(`${B}/:id`, updateAnalysisAdmin);
  app.post(`${B}/:id/resend-pdf`, resendPdfAdmin);
  app.post(`${B}/:id/rerun`, rerunAnalysisAdmin);
}
