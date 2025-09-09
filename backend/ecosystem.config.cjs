module.exports = {
  apps: [
    {
      name: 'formula-backend',
      cwd: __dirname,
      script: 'node',
      args: 'node_modules/tsx/dist/cli.mjs watch src/server.ts',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      watch_options: {
        usePolling: true,
        interval: 500,
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
    },
  ],
};
