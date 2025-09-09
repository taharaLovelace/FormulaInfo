module.exports = {
  apps: [
    {
      name: 'formula-frontend',
      cwd: __dirname,
      script: 'node',
      args: 'node_modules/next/dist/bin/next dev',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        WATCHPACK_POLLING: 'true',
        WATCHPACK_POLLING_INTERVAL: '700',
        CHOKIDAR_USEPOLLING: '1',
        NEXT_WEBPACK_USEPOLLING: 'true'
      },
      watch: false,
      ignore_watch: ['node_modules', '.next', '.git'],
      watch_options: {
        usePolling: true,
        interval: 700,
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './pm2-error.log',
      out_file: './pm2-out.log',
    },
  ],
};
