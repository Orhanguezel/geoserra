import '@fastify/mysql';
import '@fastify/jwt';
import '@fastify/cookie';
import type { Pool as MySQLPromisePool } from 'mysql2/promise';

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
    db: MySQLPromisePool;
  }
}
