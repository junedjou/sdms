module.exports = {
  apps: [{
    name: 'sdms-backend',
    script: '/var/www/sdms/backend/src/server.js',
    cwd: '/var/www/sdms/backend',

    // Cluster mode: 1 instance cukup untuk VPS kecil
    instances: 1,
    exec_mode: 'cluster',

    // Zero-downtime reload: PM2 tunggu sinyal ready dari app
    wait_ready: true,
    listen_timeout: 10000,   // maks 10 detik tunggu ready signal
    kill_timeout: 5000,      // maks 5 detik untuk graceful shutdown

    autorestart: true,
    watch: false,
    max_memory_restart: '512M',

    env: {
      NODE_ENV: 'production',
    },

    error_file: '/var/log/sdms/pm2-error.log',
    out_file:   '/var/log/sdms/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
