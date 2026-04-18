import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import authPlugin from './plugins/authPlugin';
import mysqlPlugin from '@/plugins/mysql';
import staticReports from '@/plugins/staticReports';
import type { FastifyInstance } from 'fastify';
import { env } from '@/core/env';
import { registerErrorHandlers } from '@/core/error';
import { registerAllRoutes } from './routes';
import { parseCorsOrigins } from './app.helpers';

export async function createApp() {
  const { default: buildFastify } = (await import('fastify')) as unknown as {
    default: (opts?: Parameters<FastifyInstance['log']['child']>[0]) => FastifyInstance;
  };

  const app = buildFastify({
    logger: env.NODE_ENV !== 'production',
  }) as FastifyInstance;

  await app.register(cors, {
    origin: parseCorsOrigins(env.CORS_ORIGIN as any),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-lang',
      'Accept',
      'Accept-Language',
      'X-Locale',
      'stripe-signature',
    ],
    exposedHeaders: ['x-total-count'],
  });

  await app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, context) => ({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Çok fazla istek — ${Math.ceil(context.ttl / 1000)} saniye sonra tekrar deneyin.`,
      retry_after_seconds: Math.ceil(context.ttl / 1000),
    }),
  });

  const cookieSecret =
    (globalThis as any).Bun?.env?.COOKIE_SECRET ?? process.env.COOKIE_SECRET ?? 'cookie-secret';

  await app.register(cookie, {
    secret: cookieSecret,
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      path: '/',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
    },
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'access_token', signed: false },
  });

  await app.register(authPlugin);
  await app.register(mysqlPlugin);

  await app.register(multipart, {
    throwFileSizeLimit: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  await app.register(staticReports);

  await registerAllRoutes(app);
  registerErrorHandlers(app);
  return app;
}
