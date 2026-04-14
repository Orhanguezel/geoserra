module.exports = {
  apps: [
    {
      name: 'geoserra-frontend',
      cwd: '/var/www/geoserra/frontend',
      interpreter: 'none',
      script: 'node',
      args: 'server.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '3071',
        HOSTNAME: '127.0.0.1',
      },
      out_file: '/home/orhan/.pm2/logs/geoserra-frontend.out.log',
      error_file: '/home/orhan/.pm2/logs/geoserra-frontend.err.log',
      combine_logs: true,
      time: true,
    },
  ],
};
