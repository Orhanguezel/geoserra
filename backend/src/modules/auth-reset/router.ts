import type { FastifyInstance } from 'fastify';
import { forgotPassword, resetPassword } from './controller';

export async function registerAuthReset(app: FastifyInstance) {
  app.post('/auth/forgot-password', forgotPassword);
  app.post('/auth/reset-password', resetPassword);
}
