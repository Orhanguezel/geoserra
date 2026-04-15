import type { FastifyInstance } from 'fastify';
import { fromZodSchema } from '@vps/shared-backend/modules/_shared';
import { googleBody } from '@vps/shared-backend/modules/auth';
import { googleLogin } from './controller';

/**
 * GeoSerra-specific OAuth Google router.
 * Public route — auth middleware'i yoktur, çünkü kullanıcı henüz oturum açmadı.
 */
export async function registerGoogleAuth(app: FastifyInstance) {
  app.post('/auth/google', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } } as any,
    schema: {
      tags: ['auth'],
      body: fromZodSchema(googleBody, 'GoogleAuthBody'),
    } as any,
  }, googleLogin);
}
