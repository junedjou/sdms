const path = require('path');
// Cari .env dari root project (2 level di atas backend/src/)
const envPath = process.env.DOTENV_PATH
  || path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

const config = {
  app: {
    env:         process.env.NODE_ENV    || 'development',
    port:        parseInt(process.env.PORT, 10) || 3000,
    name:        process.env.APP_NAME    || 'SDMS',
    url:         process.env.APP_URL     || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  jwt: {
    secret:          process.env.JWT_SECRET          || 'sdms_dev_secret_ganti_di_production',
    expiresIn:       process.env.JWT_EXPIRES_IN       || '8h',
    refreshSecret:   process.env.JWT_REFRESH_SECRET   || 'sdms_refresh_dev_ganti_di_production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  db: {
    // ── MariaDB / XAMPP ──────────────────────────────────────
    mysql: {
      host:     process.env.DB_HOST     || '127.0.0.1',
      port:     parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',   // XAMPP default: kosong
      databases: {
        master:    process.env.DB_NAME          || 'sdms_master',
        piket:     process.env.PIKET_DB         || 'piket_db',
        sholat:    process.env.SHOLAT_DB        || 'sholat_db',
        kegiatan:  process.env.KEGIATAN_DB      || 'kegiatan_db',
        kelulusan: process.env.KELULUSAN_DB     || 'kelulusan_db',
        website:   process.env.WEBSITE_DB       || 'website_db',
      },
    },

    // ── MongoDB (opsional — untuk Jurnal Guru) ───────────────
    mongo: {
      enabled: process.env.MONGO_ENABLED === 'true',
      uri:     process.env.MONGO_URI || 'mongodb://localhost:27017/jurnal_db',
    },
  },

  // ── Redis (opsional — untuk cache & queue) ───────────────
  redis: {
    enabled:  process.env.REDIS_ENABLED === 'true',
    host:     process.env.REDIS_HOST    || '127.0.0.1',
    port:     parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db:       parseInt(process.env.REDIS_DB, 10) || 0,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 5 * 60 * 1000,   // default: 5 menit
    max:      parseInt(process.env.RATE_LIMIT_MAX, 10) || 500,                    // default: 500 req/user/5 menit
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir:   process.env.LOG_DIR   || 'logs',
  },

  // URL aplikasi eksternal (SSO redirect)
  apps: {
    lms:       process.env.LMS_URL       || 'http://localhost:4000',
    jurnal:    process.env.JURNAL_URL    || 'http://localhost:4001',
    piket:     process.env.PIKET_URL     || 'http://localhost:4002',
    sholat:    process.env.SHOLAT_URL    || 'http://localhost:4003',
    kegiatan:  process.env.KEGIATAN_URL  || 'http://localhost:4004',
    kelulusan: process.env.KELULUSAN_URL || 'http://localhost:4005',
    website:   process.env.WEBSITE_URL   || 'http://localhost:4006',
    absen:     process.env.ABSEN_URL     || 'http://localhost:4007',
  },
};

module.exports = config;
