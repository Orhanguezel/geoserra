import type { FastifyInstance } from 'fastify';
import { createImplementationRequest } from './controller';

export async function registerImplementation(app: FastifyInstance) {
  app.post('/implementation/request', {
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } as any,
  }, createImplementationRequest);
}
