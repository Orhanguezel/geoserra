import type { FastifyInstance } from 'fastify';
import { listImplRequestsAdmin, getImplRequestAdmin, updateImplRequestAdmin } from './admin.controller';

export async function registerImplementationAdmin(app: FastifyInstance) {
  const B = '/implementation';
  app.get(B, listImplRequestsAdmin);
  app.get(`${B}/:id`, getImplRequestAdmin);
  app.patch(`${B}/:id`, updateImplRequestAdmin);
}
