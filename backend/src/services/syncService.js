const axios = require('axios');
const crypto = require('crypto');
const eventBus = require('./eventBus');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * SDMS Data Synchronization Service v2
 *
 * Arsitektur:
 *   Master Data Service (SDMS)
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
 * Perubahan v2:
 * - Target webhook dibaca dari database (ApiClient)
 * - Fallback ke hardcoded SYNC_TARGETS jika DB belum ready
 * - Retry mechanism (3x dengan exponential backoff)
 * - Logging ke WebhookLog table
 * - HMAC-SHA256 signature untuk keamanan
 */

// ============================================================
// Hardcoded fallback (jika DB belum siap saat startup)
// ============================================================
const SYNC_TARGETS = [
  {
    name: 'LMS',
    url: config.apps.lms,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.LMS_WEBHOOK_SECRET || 'sdms_lms_secret',
    events: ['*'],
  },
  {
    name: 'Jurnal',
    url: config.apps.jurnal,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.JURNAL_WEBHOOK_SECRET || 'sdms_jurnal_secret',
    events: ['guru.*', 'pegawai.*', 'kelas.*', 'mapel.*'],
  },
  {
    name: 'Piket',
    url: config.apps.piket,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.PIKET_WEBHOOK_SECRET || 'sdms_piket_secret',
    events: ['siswa.*', 'guru.*', 'kelas.*'],
  },
  {
    name: 'Sholat',
    url: config.apps.sholat,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.SHOLAT_WEBHOOK_SECRET || 'sdms_sholat_secret',
    events: ['siswa.*', 'kelas.*'],
  },
  {
    name: 'Kegiatan',
    url: config.apps.kegiatan,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.KEGIATAN_WEBHOOK_SECRET || 'sdms_kegiatan_secret',
    events: ['guru.*', 'siswa.*', 'pegawai.*'],
  },
  {
    name: 'Kelulusan',
    url: config.apps.kelulusan,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.KELULUSAN_WEBHOOK_SECRET || 'sdms_kelulusan_secret',
    events: ['siswa.*'],
  },
  {
    name: 'Website',
    url: config.apps.website,
    webhookPath: '/api/webhooks/sdms',
    secret: process.env.WEBSITE_WEBHOOK_SECRET || 'sdms_website_secret',
    events: ['guru.*', 'pegawai.*'],
  },
];

// ============================================================
// Retry Configuration
// ============================================================
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

// ============================================================
// Helper: cek apakah event cocok dengan pattern
// ============================================================
const eventMatches = (eventName, patterns) => {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(eventName);
    }
    return pattern === eventName;
  });
};

// ============================================================
// Helper: load targets dari DB (cached 60 detik)
// ============================================================
let dbTargetsCache = null;
let dbTargetsCacheTime = 0;
const DB_CACHE_TTL = 60000; // 1 menit

const loadDbTargets = async () => {
  const now = Date.now();
  if (dbTargetsCache && (now - dbTargetsCacheTime) < DB_CACHE_TTL) {
    return dbTargetsCache;
  }

  try {
    const { ApiClient } = require('../models');
    const clients = await ApiClient.findAll({ where: { status: 'active' } });
    dbTargetsCache = clients.map(c => ({
      name: c.name,
      url: c.webhook_url.replace(/\/$/, ''),
      webhookPath: '',
      secret: c.api_secret,
      events: c.events,
      apiKey: c.api_key,
      dbId: c.id,
      isDb: true,
    }));
    dbTargetsCacheTime = now;
    return dbTargetsCache;
  } catch (err) {
    logger.warn(`[SyncService] Gagal load targets dari DB: ${err.message}`);
    return [];
  }
};

// Invalidate cache saat client di-update
const invalidateTargetCache = () => {
  dbTargetsCache = null;
  dbTargetsCacheTime = 0;
};

// ============================================================
// Helper: log webhook delivery
// ============================================================
const logDelivery = async (apiClientId, event, payload, webhookUrl, status, details = {}) => {
  try {
    const { WebhookLog } = require('../models');
    await WebhookLog.create({
      api_client_id: apiClientId,
      event,
      payload,
      webhook_url: webhookUrl,
      status,
      http_status: details.httpStatus || null,
      response_body: details.responseBody ? String(details.responseBody).substring(0, 1000) : null,
      error_message: details.error || null,
      attempt: details.attempt || 1,
      duration_ms: details.durationMs || null,
      sent_at: status === 'success' ? new Date() : null,
    });
  } catch (err) {
    logger.warn(`[SyncService] Gagal log delivery: ${err.message}`);
  }
};

// ============================================================
// Helper: update client stats
// ============================================================
const updateClientStats = async (clientId, success) => {
  try {
    const { ApiClient } = require('../models');
    const client = await ApiClient.findByPk(clientId);
    if (!client) return;

    if (success) {
      await client.update({
        last_sync_at: new Date(),
        error_count: 0,
        last_error: null,
        total_delivered: client.total_delivered + 1,
      });
    } else {
      const newCount = client.error_count + 1;
      await client.update({
        status: newCount >= 10 ? 'error' : client.status,
        last_error: `Failed at ${new Date().toISOString()}`,
        error_count: newCount,
        total_failed: client.total_failed + 1,
      });
    }
  } catch (err) {
    logger.warn(`[SyncService] Gagal update stats: ${err.message}`);
  }
};

// ============================================================
// Push webhook ke satu target (dengan retry)
// ============================================================
const pushWebhook = async (target, envelope, attempt = 1) => {
  const endpointUrl = target.isDb
    ? target.url
    : `${target.url}${target.webhookPath}`;

  const startTime = Date.now();

  try {
    // Buat signature
    const signature = crypto
      .createHmac('sha256', target.secret)
      .update(JSON.stringify(envelope))
      .digest('hex');

    await axios.post(endpointUrl, envelope, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-SDMS-Event': envelope.event,
        'X-API-Signature': signature,
        'X-SDMS-Timestamp': envelope.meta.timestamp,
        ...(target.apiKey && { 'X-API-Key': target.apiKey }),
      },
    });

    const durationMs = Date.now() - startTime;
    logger.info(`[SyncService] ✓ ${target.name} — ${envelope.event} (${durationMs}ms)`);

    // Log success & update stats
    if (target.dbId) {
      await logDelivery(target.dbId, envelope.event, envelope.payload, endpointUrl, 'success', {
        httpStatus: 200, durationMs, attempt,
      });
      await updateClientStats(target.dbId, true);
    }
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const isRetryable = err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' ||
                        (err.response && err.response.status >= 500);

    // Retry jika masih ada attempts tersisa
    if (attempt < MAX_RETRIES && isRetryable) {
      const delay = RETRY_DELAYS[attempt - 1] || 15000;
      logger.warn(`[SyncService] ⏳ ${target.name} — retry ${attempt}/${MAX_RETRIES} dalam ${delay}ms`);

      if (target.dbId) {
        await logDelivery(target.dbId, envelope.event, envelope.payload, endpointUrl, 'retrying', {
          error: err.message, durationMs, attempt,
        });
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      return pushWebhook(target, envelope, attempt + 1);
    }

    // Gagal total
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      logger.warn(`[SyncService] ✗ ${target.name} tidak tersedia — event ${envelope.event} diabaikan`);
    } else {
      logger.warn(`[SyncService] ✗ Gagal push ke ${target.name}: ${err.message}`);
    }

    // Log failure
    if (target.dbId) {
      await logDelivery(target.dbId, envelope.event, envelope.payload, endpointUrl, 'failed', {
        error: err.message, httpStatus: err.response?.status, durationMs, attempt,
      });
      await updateClientStats(target.dbId, false);
    }
  }
};

// ============================================================
// Listener utama — subscribe ke semua event
// ============================================================
const initSyncService = () => {
  // Subscribe ke semua event di EventBus
  eventBus.subscribe('*', async (envelope) => {
    const eventName = envelope.event;

    // 1. Kirim ke DB-registered clients
    try {
      const dbTargets = await loadDbTargets();
      for (const target of dbTargets) {
        if (eventMatches(eventName, target.events)) {
          pushWebhook(target, envelope).catch(() => {});
        }
      }
    } catch (err) {
      logger.warn(`[SyncService] DB target error: ${err.message}`);
    }

    // 2. Fallback ke hardcoded targets
    for (const target of SYNC_TARGETS) {
      if (eventMatches(eventName, target.events)) {
        pushWebhook(target, envelope).catch(() => {});
      }
    }
  });

  logger.info('[SyncService] v2 inisialisasi selesai — listening semua event');
};

// ============================================================
// Fungsi publik
// ============================================================
const syncEvent = (eventName, data, meta = {}) => {
  eventBus.publish(eventName, data, meta);
};

/**
 * Bulk sync — kirim seluruh data ke semua target
 */
const bulkSync = async (targetName = null) => {
  const { Guru, Siswa, Kelas, ApiClient } = require('../models');

  // Load targets
  let targets = [];
  try {
    const dbClients = await ApiClient.findAll({ where: { status: 'active' } });
    targets = dbClients.map(c => ({
      name: c.name, url: c.webhook_url, secret: c.api_secret,
      events: c.events, apiKey: c.api_key, dbId: c.id, isDb: true,
    }));
  } catch {
    // Fallback
  }

  // Include hardcoded targets too
  for (const ht of SYNC_TARGETS) {
    if (!targets.find(t => t.name.toLowerCase() === ht.name.toLowerCase())) {
      targets.push(ht);
    }
  }

  if (targetName) {
    targets = targets.filter(t => t.name.toLowerCase() === targetName.toLowerCase());
  }

  logger.info(`[SyncService] Bulk sync dimulai untuk: ${targets.map(t => t.name).join(', ')}`);

  const [guru, siswa, kelas] = await Promise.all([
    Guru.findAll({ where: { is_active: true } }),
    Siswa.findAll({ where: { status: 'Aktif' } }),
    Kelas.findAll({ where: { is_active: true } }),
  ]);

  const bulkData = {
    guru: guru.map(g => g.toJSON()),
    siswa: siswa.map(s => s.toJSON()),
    kelas: kelas.map(k => k.toJSON()),
  };

  for (const target of targets) {
    const envelope = {
      event: 'bulk.sync',
      payload: bulkData,
      meta: { timestamp: new Date().toISOString(), source: 'sdms-core', type: 'bulk' },
    };
    await pushWebhook(target, envelope);
  }

  logger.info('[SyncService] Bulk sync selesai');
};

module.exports = { initSyncService, syncEvent, bulkSync, SYNC_TARGETS, invalidateTargetCache };
