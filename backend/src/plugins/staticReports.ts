import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import type { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  const reportsDir = path.resolve(process.cwd(), 'storage', 'reports');
  const assetsDir = path.resolve(process.cwd(), 'storage', 'assets');

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  app.register(fastifyStatic, {
    root: reportsDir,
    prefix: '/reports/',
    decorateReply: false,
  });

  app.register(fastifyStatic, {
    root: assetsDir,
    prefix: '/assets/',
    decorateReply: false,
  });
});
