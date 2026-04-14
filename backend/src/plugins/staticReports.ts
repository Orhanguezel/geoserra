import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import type { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  const reportsDir = path.resolve(process.cwd(), 'storage', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  app.register(fastifyStatic, {
    root: reportsDir,
    prefix: '/reports/',
    decorateReply: false,
  });
});
