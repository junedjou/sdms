const { Op } = require('sequelize');
const axios = require('axios');
const crypto = require('crypto');
const { ApiClient, WebhookLog } = require('../models');
const { success, created, notFound, badRequest, paginated } = require('../utils/response');
const { getPagination } = require('../utils/helpers');
const { syncEvent, SYNC_TARGETS } = require('../services/syncService');
const logger = require('../utils/logger');

// ============================================================
// AVAILABLE EVENTS — semua event yang bisa didengar
// ============================================================
const AVAILABLE_EVENTS = [
  { value: '*', label: 'Semua Event', description: 'Menerima semua perubahan data' },
  { value: 'siswa.created', label: 'Siswa Dibuat', group: 'Siswa' },
  { value: 'siswa.updated', label: 'Siswa Diperbarui', group: 'Siswa' },
  { value: 'siswa.deleted', label: 'Siswa Dihapus', group: 'Siswa' },
  { value: 'guru.created', label: 'Guru Dibuat', group: 'Guru' },
  { value: 'guru.updated', label: 'Guru Diperbarui', group: 'Guru' },
  { value: 'guru.deleted', label: 'Guru Dihapus', group: 'Guru' },
  { value: 'pegawai.created', label: 'Pegawai Dibuat', group: 'Pegawai' },
  { value: 'pegawai.updated', label: 'Pegawai Diperbarui', group: 'Pegawai' },
  { value: 'pegawai.deleted', label: 'Pegawai Dihapus', group: 'Pegawai' },
  { value: 'kelas.created', label: 'Kelas Dibuat', group: 'Kelas' },
  { value: 'kelas.updated', label: 'Kelas Diperbarui', group: 'Kelas' },
  { value: 'mapel.created', label: 'Mapel Dibuat', group: 'Mata Pelajaran' },
  { value: 'mapel.updated', label: 'Mapel Diperbarui', group: 'Mata Pelajaran' },
  { value: 'bulk.sync', label: 'Sinkronisasi Massal', group: 'System' },
];

// ============================================================
// CRUD API CLIENTS
// ============================================================

/**
 * GET /api/v1/apihub/clients
 * List semua registered apps
 */
const getClients = async (req, res) => {
  const clients = await ApiClient.findAll({
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['api_secret'] }, // Jangan tampilkan secret
  });

  // Tambahkan info dari hardcoded SYNC_TARGETS
  const enriched = clients.map(c => {
    const json = c.toJSON();
    const hardcoded = SYNC_TARGETS.find(t => t.name.toLowerCase() === json.slug);
    json.is_hardcoded = !!hardcoded;
    return json;
  });

  return success(res, enriched);
};

/**
 * GET /api/v1/apihub/clients/:id
 * Detail satu client
 */
const getClientById = async (req, res) => {
  const client = await ApiClient.findByPk(req.params.id, {
    attributes: { exclude: ['api_secret'] },
    include: [
      { model: WebhookLog, as: 'logs', limit: 20, order: [['created_at', 'DESC']] },
    ],
  });
  if (!client) return notFound(res, 'Aplikasi tidak ditemukan');
  return success(res, client);
};

/**
 * POST /api/v1/apihub/clients
 * Daftarkan aplikasi baru
 */
const createClient = async (req, res) => {
  const { name, webhook_url, events = ['*'], description } = req.body;
  if (!name || !webhook_url) {
    return badRequest(res, 'name dan webhook_url wajib diisi');
  }

  // Cek duplikat name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dup = await ApiClient.findOne({ where: { slug } });
  if (dup) return badRequest(res, `Aplikasi dengan nama '${name}' sudah terdaftar`);

  const client = await ApiClient.create({
    name,
    webhook_url,
    events,
    description,
    created_by: req.user?.id,
  });

  logger.info(`[APIHub] Aplikasi baru didaftarkan: ${name} (${slug})`);
  return created(res, {
    client: {
      id: client.id,
      name: client.name,
      slug: client.slug,
      api_key: client.api_key,   // Tampilkan SAAT pertama kali dibuat
      api_secret: client.api_secret, // Tampilkan SAAT pertama kali dibuat
      webhook_url: client.webhook_url,
      events: client.events,
      status: client.status,
    },
    message: '⚠️ Simpan API Key & Secret sekarang! Tidak akan ditampilkan lagi.',
  }, 'Aplikasi berhasil didaftarkan');
};

/**
 * PUT /api/v1/apihub/clients/:id
 * Update client
 */
const updateClient = async (req, res) => {
  const client = await ApiClient.findByPk(req.params.id);
  if (!client) return notFound(res, 'Aplikasi tidak ditemukan');

  const { name, webhook_url, events, status, description } = req.body;
  await client.update({
    ...(name && { name }),
    ...(webhook_url && { webhook_url }),
    ...(events && { events }),
    ...(status && { status }),
    ...(description !== undefined && { description }),
    error_count: 0, // Reset error count saat update
    last_error: null,
  });

  return success(res, {
    id: client.id,
    name: client.name,
    slug: client.slug,
    webhook_url: client.webhook_url,
    events: client.events,
    status: client.status,
  }, 'Aplikasi berhasil diperbarui');
};

/**
 * DELETE /api/v1/apihub/clients/:id
 * Hapus client
 */
const deleteClient = async (req, res) => {
  const client = await ApiClient.findByPk(req.params.id);
  if (!client) return notFound(res, 'Aplikasi tidak ditemukan');
  await client.destroy();
  logger.info(`[APIHub] Aplikasi dihapus: ${client.name}`);
  return success(res, null, 'Aplikasi berhasil dihapus');
};

/**
 * POST /api/v1/apihub/clients/:id/regenerate-key
 * Regenerate API key & secret
 */
const regenerateKeys = async (req, res) => {
  const client = await ApiClient.findByPk(req.params.id);
  if (!client) return notFound(res, 'Aplikasi tidak ditemukan');

  await client.update({
    api_key: 'sdms_' + crypto.randomBytes(32).toString('hex'),
    api_secret: crypto.randomBytes(48).toString('hex'),
  });

  return success(res, {
    api_key: client.api_key,
    api_secret: client.api_secret,
  }, '⚠️ API Key & Secret baru! Simpan sekarang — tidak akan ditampilkan lagi.');
};

/**
 * POST /api/v1/apihub/clients/:id/test
 * Test kirim webhook ke client
 */
const testWebhook = async (req, res) => {
  const client = await ApiClient.findByPk(req.params.id);
  if (!client) return notFound(res, 'Aplikasi tidak ditemukan');

  const envelope = {
    event: 'ping',
    payload: {
      message: '🏓 Test webhook dari SDMS',
      timestamp: new Date().toISOString(),
      client: client.name,
    },
    meta: { timestamp: new Date().toISOString(), source: 'sdms-core', type: 'test' },
  };

  const signature = crypto
    .createHmac('sha256', client.api_secret)
    .update(JSON.stringify(envelope))
    .digest('hex');

  const startTime = Date.now();
  try {
    const response = await axios.post(client.webhook_url, envelope, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-SDMS-Event': 'ping',
        'X-API-Key': client.api_key,
        'X-API-Signature': signature,
      },
    });

    await client.update({
      last_sync_at: new Date(),
      error_count: 0,
      last_error: null,
    });

    return success(res, {
      status: 'success',
      http_status: response.status,
      latency_ms: Date.now() - startTime,
    }, `Webhook berhasil dikirim ke ${client.name}`);
  } catch (err) {
    await client.update({
      status: 'error',
      last_error: err.message,
      error_count: client.error_count + 1,
    });

    return success(res, {
      status: 'failed',
      error: err.message,
      latency_ms: Date.now() - startTime,
    }, `Gagal kirim ke ${client.name}: ${err.message}`);
  }
};

/**
 * POST /api/v1/apihub/bulk-sync
 * Kirim bulk sync ke semua atau client tertentu
 */
const bulkSyncClients = async (req, res) => {
  const { client_id } = req.body;

  const where = { status: 'active' };
  if (client_id) where.id = client_id;

  const clients = await ApiClient.findAll({ where });
  if (clients.length === 0) return badRequest(res, 'Tidak ada aplikasi aktif');

  // Trigger bulk sync
  const { Guru, Siswa, Kelas } = require('../models');
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

  let sent = 0;
  for (const client of clients) {
    const envelope = {
      event: 'bulk.sync',
      payload: bulkData,
      meta: { timestamp: new Date().toISOString(), source: 'sdms-core', type: 'bulk' },
    };

    try {
      const signature = crypto
        .createHmac('sha256', client.api_secret)
        .update(JSON.stringify(envelope))
        .digest('hex');

      await axios.post(client.webhook_url, envelope, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-SDMS-Event': 'bulk.sync',
          'X-API-Key': client.api_key,
          'X-API-Signature': signature,
        },
      });

      await client.update({ last_sync_at: new Date(), error_count: 0 });
      sent++;
    } catch (err) {
      await client.update({
        status: 'error',
        last_error: err.message,
        error_count: client.error_count + 1,
      });
    }
  }

  return success(res, { sent, total: clients.length }, `Bulk sync berhasil ke ${sent}/${clients.length} aplikasi`);
};

// ============================================================
// WEBHOOK LOGS
// ============================================================

/**
 * GET /api/v1/apihub/logs
 * List webhook logs dengan filter
 */
const getLogs = async (req, res) => {
  const { page = 1, limit = 20, api_client_id, event, status } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);

  const where = {};
  if (api_client_id) where.api_client_id = api_client_id;
  if (event) where.event = event;
  if (status) where.status = status;

  const { count, rows } = await WebhookLog.findAndCountAll({
    where, limit: lim, offset,
    include: [{ model: ApiClient, as: 'client', attributes: ['id', 'name', 'slug'] }],
    order: [['created_at', 'DESC']],
  });

  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

/**
 * DELETE /api/v1/apihub/logs
 * Clear old logs
 */
const clearLogs = async (req, res) => {
  const { older_than_days = 30 } = req.body;
  const cutoff = new Date(Date.now() - older_than_days * 24 * 60 * 60 * 1000);
  const deleted = await WebhookLog.destroy({ where: { created_at: { [Op.lt]: cutoff } } });
  return success(res, { deleted }, `${deleted} log lama berhasil dihapus`);
};

// ============================================================
// EVENTS LIST
// ============================================================
const getAvailableEvents = async (req, res) => {
  return success(res, AVAILABLE_EVENTS);
};

module.exports = {
  getClients, getClientById, createClient, updateClient, deleteClient,
  regenerateKeys, testWebhook, bulkSyncClients,
  getLogs, clearLogs, getAvailableEvents,
};
