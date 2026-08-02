const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

// ============================================================
// XAMPP MODE: Semua database menggunakan MariaDB (mysql2)
// Master DB = sdms_master (satu database utama SDMS)
// Aplikasi lain (piket, sholat, dll) pakai database terpisah
// di MariaDB XAMPP yang sama
// ============================================================

// ── Helper buat koneksi Sequelize ke MariaDB ─────────────────
const createMariaDB = (database, options = {}) => {
  return new Sequelize({
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    host: config.db.mysql.host,
    port: config.db.mysql.port,
    database,
    username: config.db.mysql.username,
    password: config.db.mysql.password,
    logging: config.app.env === 'development' ? (msg) => logger.debug(msg) : false,
    pool: { max: 10, min: 1, acquire: 30000, idle: 10000 },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    ...options,
  });
};

// ── Master Database (sdms_master) ────────────────────────────
// Single Source of Truth: User, Guru, Siswa, Pegawai, Kelas, dll
const masterDB = createMariaDB(config.db.mysql.databases.master);

// ── Database aplikasi eksternal (opsional) ───────────────────
// Hanya digunakan untuk sinkronisasi data, bukan untuk model utama
const piketDB    = createMariaDB(config.db.mysql.databases.piket);
const sholatDB   = createMariaDB(config.db.mysql.databases.sholat);
const kegiatanDB = createMariaDB(config.db.mysql.databases.kegiatan);
const kelulusanDB = createMariaDB(config.db.mysql.databases.kelulusan);
const websiteDB  = createMariaDB(config.db.mysql.databases.website);

// ── Redis: optional cache ────────────────────────────────────
// Jika Redis tidak tersedia, semua cache di-skip (graceful)
let redisClient = null;

const createRedisClient = async () => {
  if (!config.redis.enabled) {
    logger.info('Redis dinonaktifkan (REDIS_ENABLED=false)');
    return createNoopRedis();
  }
  try {
    const Redis = require('ioredis');
    const client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      lazyConnect: true,
      connectTimeout: 3000,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 500, 2000);
      },
    });
    await client.connect();
    client.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
    logger.info('Redis terhubung');
    return client;
  } catch (err) {
    logger.warn(`Redis tidak tersedia: ${err.message} — cache dinonaktifkan`);
    return createNoopRedis();
  }
};

// Redis noop: semua operasi tidak melakukan apa-apa
const createNoopRedis = () => ({
  get:    async () => null,
  set:    async () => null,
  setex:  async () => null,
  del:    async () => null,
  connect: async () => {},
  on: () => {},
  _isNoop: true,
});

// ── MongoDB: optional (untuk Jurnal Guru) ───────────────────
const connectMongo = async () => {
  if (!config.db.mongo.enabled) {
    logger.info('MongoDB dinonaktifkan (MONGO_ENABLED=false)');
    return;
  }
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(config.db.mongo.uri, { serverSelectionTimeoutMS: 3000 });
    logger.info('MongoDB (Jurnal) terhubung');
  } catch (err) {
    logger.warn(`MongoDB tidak tersedia: ${err.message} — fitur Jurnal mungkin terbatas`);
  }
};

// ── Koneksi semua database ───────────────────────────────────
const connectAllDatabases = async () => {
  // 1. Master DB — wajib tersedia
  try {
    await masterDB.authenticate();
    logger.info(`✓ MariaDB Master (${config.db.mysql.databases.master}) terhubung`);
  } catch (err) {
    logger.error(`✗ MariaDB Master gagal: ${err.message}`);
    logger.error('Pastikan XAMPP MySQL/MariaDB sudah berjalan dan database sdms_master sudah dibuat');
    throw err;
  }

  // 2. Database aplikasi lain — opsional
  const optionalDbs = { piketDB, sholatDB, kegiatanDB, kelulusanDB, websiteDB };
  for (const [name, db] of Object.entries(optionalDbs)) {
    try {
      await db.authenticate();
      logger.info(`✓ MariaDB ${name} terhubung`);
    } catch {
      logger.warn(`  MariaDB ${name} tidak tersedia (diabaikan)`);
    }
  }

  // 3. MongoDB — opsional
  await connectMongo();

  // 4. Redis — opsional
  redisClient = await createRedisClient();
};

// Export lazy getter redis agar modul lain bisa pakai
const getRedis = () => redisClient || createNoopRedis();

module.exports = {
  masterDB,
  piketDB,
  sholatDB,
  kegiatanDB,
  kelulusanDB,
  websiteDB,
  getRedis,
  get redisClient() { return getRedis(); },
  connectAllDatabases,
};
