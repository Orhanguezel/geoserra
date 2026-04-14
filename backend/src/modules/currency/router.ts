import type { FastifyInstance } from 'fastify';
import { getRates } from './service';

export async function registerCurrency(app: FastifyInstance) {
  app.get('/currency/rates', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } } as any,
  }, async (_req, reply) => {
    const rates = await getRates();
    return reply.send(rates);
  });
}
