import type { FastifyRequest, FastifyReply } from 'fastify';
import { ImplementationListParamsSchema, ImplementationUpdateSchema } from './validation';
import { repoListImplRequests, repoGetImplRequestById, repoUpdateImplRequest } from './repository';

/** GET /api/v1/admin/implementation */
export async function listImplRequestsAdmin(req: FastifyRequest, reply: FastifyReply) {
  const params = ImplementationListParamsSchema.parse(req.query ?? {});
  const list = await repoListImplRequests(params);
  return reply.send(list);
}

/** GET /api/v1/admin/implementation/:id */
export async function getImplRequestAdmin(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const row = await repoGetImplRequestById(id);
  if (!row) return reply.code(404).send({ error: 'NOT_FOUND' });
  return reply.send(row);
}

/** PATCH /api/v1/admin/implementation/:id */
export async function updateImplRequestAdmin(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  const data = ImplementationUpdateSchema.parse(req.body ?? {});
  const updated = await repoUpdateImplRequest(id, data);
  if (!updated) return reply.code(404).send({ error: 'NOT_FOUND' });
  return reply.send(updated);
}
