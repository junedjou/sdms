module.exports = {
  apps: [{
    name: 'sdms-backend',
    script: '/var/www/sdms/backend/src/server.js',
    cwd: '/var/www/sdms/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/sdms/pm2-error.log',
    out_file: '/var/log/sdms/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
