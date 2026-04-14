import '@fastify/mysql';
import '@fastify/jwt';
import '@fastify/cookie';
import type fastifyMysql from '@fastify/mysql';

declare module 'fastify' {
  interface FastifyInstance {
    mysql: fastifyMysql.MySQLPromisePool;
    db: fastifyMysql.MySQLPromisePool;
  }
}
