const axios = require('axios');
const eventBus = require('./eventBus');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * SDMS Data Synchronization Service
 *
 * Arsitektur:
 *   Master Data Service
 *         │
 *         ▼
 *   syncEvent(event, data)    ← dipanggil dari controller
 *         │
 *         ▼
 *   EventBus.publish()
 *         │
 *    ┌────┼────┬────┬────┬────────┐
 *    ▼    ▼    ▼    ▼    ▼        ▼
 *   LMS Jurnal Piket Sholat Kegiatan ...
 *
 * Setiap aplikasi eksternal mendaftarkan webhook endpoint-nya.
 * Saat ada perubahan data master, SDMS akan push ke semua subscriber.
 *
 * Menambah aplikasi baru = tambahkan entry di SYNC_TARGETS, tidak perlu
 * ubah arsitektur sama sekali.
 */

// ============================================================
// Daftar target sinkronisasi
// Setiap entry: { name, url, secret, events: ['*'] atau list event spesifik }
// ============================================================
const SYNC_TARGETS = [
  {
    name: 'LMS',
    url: config.apps.lms,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.LMS_WEBHOOK_SECRET || 'sdms_lms_secret',
    events: [
      'siswa.created', 'siswa.updated', 'siswa.deleted',
      'guru.created', 'guru.updated', 'guru.deleted',
      'pegawai.created', 'pegawai.updated', 'pegawai.deleted',
      'kelas.created', 'kelas.updated',
      'mapel.created', 'mapel.updated',
    ],
  },
  {
    name: 'Jurnal',
    url: config.apps.jurnal,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.JURNAL_WEBHOOK_SECRET || 'sdms_jurnal_secret',
    events: [
      'guru.created', 'guru.updated', 'guru.deleted',
      'pegawai.created', 'pegawai.updated', 'pegawai.deleted',
      'kelas.created', 'kelas.updated',
      'mapel.created', 'mapel.updated',
    ],
  },
  {
    name: 'Piket',
    url: config.apps.piket,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.PIKET_WEBHOOK_SECRET || 'sdms_piket_secret',
    events: [
      'siswa.created', 'siswa.updated', 'siswa.deleted',
      'guru.created', 'guru.updated', 'guru.deleted',
      'kelas.created', 'kelas.updated',
    ],
  },
  {
    name: 'Sholat',
    url: config.apps.sholat,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.SHOLAT_WEBHOOK_SECRET || 'sdms_sholat_secret',
    events: [
      'siswa.created', 'siswa.updated', 'siswa.deleted',
      'kelas.created', 'kelas.updated',
    ],
  },
  {
    name: 'Kegiatan',
    url: config.apps.kegiatan,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.KEGIATAN_WEBHOOK_SECRET || 'sdms_kegiatan_secret',
    events: [
      'guru.updated', 'siswa.updated',
      'pegawai.updated',
    ],
  },
  {
    name: 'Kelulusan',
    url: config.apps.kelulusan,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.KELULUSAN_WEBHOOK_SECRET || 'sdms_kelulusan_secret',
    events: [
      'siswa.created', 'siswa.updated', 'siswa.deleted',
    ],
  },
  {
    name: 'Website',
    url: config.apps.website,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.WEBSITE_WEBHOOK_SECRET || 'sdms_website_secret',
    events: [
      'guru.created', 'guru.updated', 'guru.deleted',
      'pegawai.created', 'pegawai.updated', 'pegawai.deleted',
    ],
  },
];

// ============================================================
// Push webhook ke satu target (non-blocking, fire-and-forget)
// ============================================================
const pushWebhook = async (target, envelope) => {
  const endpointUrl = `${target.url}${target.webhookPath}`;
  try {
    await axios.post(endpointUrl, envelope, {
      timeout: 15000,   // 15 detik — cukup untuk koneksi HTTPS internal
      headers: {
        'Content-Type': 'application/json',
        'X-SDMS-Event': envelope.event,
        'X-SDMS-Secret': target.secret,
        'X-SDMS-Timestamp': envelope.meta.timestamp,
      },
    });
    logger.info(`[SyncService] ✓ ${target.name} — ${envelope.event}`);
  } catch (err) {
    // Gagal push tidak boleh menghentikan operasi utama
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      logger.warn(`[SyncService] ${target.name} tidak tersedia (${endpointUrl}) — event ${envelope.event} diabaikan`);
    } else {
      logger.warn(`[SyncService] Gagal push ke ${target.name}: ${err.message}`);
    }
  }
};

// ============================================================
// Listener utama — subscribe ke semua event dari EventBus
// ============================================================
const initSyncService = () => {
  // Daftarkan listener untuk setiap kombinasi target + event
  for (const target of SYNC_TARGETS) {
    for (const eventName of target.events) {
      eventBus.subscribe(eventName, async (envelope) => {
        await pushWebhook(target, envelope);
      });
    }
  }

  logger.info(`[SyncService] Inisialisasi selesai — ${SYNC_TARGETS.length} target terdaftar`);
};

// ============================================================
// Fungsi publik: dipanggil dari controller saat data berubah
// ============================================================
const syncEvent = (eventName, data, meta = {}) => {
  eventBus.publish(eventName, data, meta);
};

/**
 * Sinkronisasi manual (bulk) — kirim ulang seluruh data ke semua target
 * Berguna saat ada aplikasi baru yang bergabung
 */
const bulkSync = async (targetName = null) => {
  const { Guru, Siswa, Kelas } = require('../models');
  const targets = targetName
    ? SYNC_TARGETS.filter((t) => t.name.toLowerCase() === targetName.toLowerCase())
    : SYNC_TARGETS;

  logger.info(`[SyncService] Bulk sync dimulai untuk: ${targets.map((t) => t.name).join(', ')}`);

  const [guru, siswa, kelas] = await Promise.all([
    Guru.findAll({ where: { is_active: true } }),
    Siswa.findAll({ where: { status: 'Aktif' } }),
    Kelas.findAll({ where: { is_active: true } }),
  ]);

  for (const target of targets) {
    const bulkData = { guru: guru.map((g) => g.toJSON()), siswa: siswa.map((s) => s.toJSON()), kelas: kelas.map((k) => k.toJSON()) };
    const envelope = {
      event: 'bulk.sync',
      payload: bulkData,
      meta: { timestamp: new Date().toISOString(), source: 'sdms-core', type: 'bulk' },
    };
    await pushWebhook(target, envelope);
  }

  logger.info('[SyncService] Bulk sync selesai');
};

module.exports = { initSyncService, syncEvent, bulkSync, SYNC_TARGETS };
