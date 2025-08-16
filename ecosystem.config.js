module.exports = {
  apps: [
    {
      name: 'proxy-api-service',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',

      // Base environment (always applied)
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        PM2_SERVE_PATH: '.',
        PM2_SERVE_PORT: process.env.PORT || 3000,
        UV_THREADPOOL_SIZE: 4,
      },

      // Logging configuration
      error_file: '/var/log/pm2/error.log',
      out_file: '/var/log/pm2/out.log',
      log_file: '/var/log/pm2/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      merge_logs: true,

      // Memory management (use 70-80% of container limit)
      max_memory_restart: process.env.PM2_MAX_MEMORY || '400M',

      // Restart configuration
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,

      // Container-friendly signal handling
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Production optimizations
      node_args: ['--max-old-space-size=' + (process.env.NODE_MAX_OLD_SPACE_SIZE || '512'), '--optimize-for-size'].join(
        ' ',
      ),

      // Monitoring
      pmx: true,

      // Disable watch in production
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
    },
  ],
};
