// GeoSerra — PM2 Ecosystem Config
// Kullanım: pm2 start ecosystem.config.js
// VPS path: /var/www/geoserra/

const ROOT = process.env.APP_ROOT || '/var/www/geoserra';

module.exports = {
  apps: [
    // ─── Backend (Fastify + Bun) ──────────────────────────────────
    {
      name: 'geoserra-backend',
      cwd: `${ROOT}/backend`,
      script: 'bun',
      args: 'run src/index.ts',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8095,
      },
      error_file: `${ROOT}/logs/backend-error.log`,
      out_file: `${ROOT}/logs/backend-out.log`,
      time: true,
    },
    // ─── Frontend (Next.js) ───────────────────────────────────────
    {
      name: 'geoserra-frontend',
      cwd: `${ROOT}/frontend`,
      script: 'node',
      args: 'node_modules/.bin/next start -p 3071',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '768M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3071,
      },
      error_file: `${ROOT}/logs/frontend-error.log`,
      out_file: `${ROOT}/logs/frontend-out.log`,
      time: true,
    },
    // ─── Admin Panel (Next.js) ────────────────────────────────────
    {
      name: 'geoserra-admin',
      cwd: `${ROOT}/admin`,
      script: 'node',
      args: 'node_modules/.bin/next start -p 3072',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3072,
      },
      error_file: `${ROOT}/logs/admin-error.log`,
      out_file: `${ROOT}/logs/admin-out.log`,
      time: true,
    },
  ],
};
