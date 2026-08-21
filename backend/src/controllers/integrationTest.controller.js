const crypto = require('crypto');
const axios = require('axios');
const { ApiClient } = require('../models');
const { success, badRequest, notFound } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Integration Test Controller
 * Membantu developer aplikasi lain menguji koneksi webhook mereka.
 */

/**
 * POST /api/v1/apihub/test-receiver
 * Endpoint sementara untuk menerima test webhook dari SDMS.
 * Berguna saat development — developer bisa daftarkan URL ini
 * untuk menerima test webhook sebelum deploy aplikasi mereka.
 */
const testReceiver = async (req, res) => {
  const { event, payload, meta } = req.body;
  const signature = req.headers['x-api-signature'];
  const apiKey = req.headers['x-api-key'];

  logger.info(`[Test Receiver] Event: ${event}, API Key: ${apiKey?.substring(0, 15)}...`);

  return success(res, {
    received: true,
    event,
    payload_preview: payload ? Object.keys(payload) : [],
    timestamp: meta?.timestamp,
    message: '✅ Webhook berhasil diterima! Aplikasi Anda terhubung ke SDMS.',
  }, 'Webhook test berhasil');
};

/**
 * POST /api/v1/apihub/test-sender
 * Kirim test webhook ke URL tertentu (untuk testing dari SDMS).
 */
const testSender = async (req, res) => {
  const { webhook_url, event = 'ping', api_secret } = req.body;

  if (!webhook_url) return badRequest(res, 'webhook_url wajib diisi');
  if (!api_secret) return badRequest(res, 'api_secret wajib diisi untuk generate signature');

  const envelope = {
    event,
    payload: {
      message: '🏓 Test dari SDMS Integration Hub',
      timestamp: new Date().toISOString(),
      test: true,
    },
    meta: {
      timestamp: new Date().toISOString(),
      source: 'sdms-core',
      type: 'test',
    },
  };

  const signature = crypto
    .createHmac('sha256', api_secret)
    .update(JSON.stringify(envelope))
    .digest('hex');

  const startTime = Date.now();
  try {
    const response = await axios.post(webhook_url, envelope, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-SDMS-Event': event,
        'X-API-Signature': signature,
        'X-SDMS-Timestamp': envelope.meta.timestamp,
      },
    });

    return success(res, {
      status: 'success',
      http_status: response.status,
      response: response.data,
      latency_ms: Date.now() - startTime,
    }, `✅ Webhook berhasil dikirim ke ${webhook_url}`);
  } catch (err) {
    return success(res, {
      status: 'failed',
      error: err.message,
      http_status: err.response?.status,
      response: err.response?.data,
      latency_ms: Date.now() - startTime,
    }, `❌ Gagal: ${err.message}`);
  }
};

/**
 * GET /api/v1/apihub/sample-payload/:event
 * Tampilkan contoh payload untuk event tertentu.
 */
const samplePayload = async (req, res) => {
  const { event } = req.params;

  const samples = {
    'siswa.created': {
      event: 'siswa.created',
      payload: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nama: 'AHMAD FAUZI',
        nisn: '0085590240',
        nis: '2024001',
        jenis_kelamin: 'L',
        tanggal_lahir: '2008-05-15',
        alamat: 'Jl. Merdeka No. 1',
        telepon: '081234567890',
        jurusan_id: 'uuid-jurusan',
        kelas_id: 'uuid-kelas',
        status: 'Aktif',
        tahun_masuk: '2024',
        created_at: '2026-08-22T10:30:00.000Z',
      },
      meta: { timestamp: '2026-08-22T10:30:00.000Z', source: 'sdms-core' },
    },
    'guru.created': {
      event: 'guru.created',
      payload: {
        id: 'uuid-guru',
        nama: 'Dr. SITI NURHALIZA, M.Pd',
        nip: '198501152010012001',
        niy: '9876543210',
        jenis_kelamin: 'P',
        jurusan_id: 'uuid-jurusan',
        mata_pelajaran: ['Matematika', 'Fisika'],
        status: 'Aktif',
      },
      meta: { timestamp: '2026-08-22T10:30:00.000Z', source: 'sdms-core' },
    },
    'kelas.created': {
      event: 'kelas.created',
      payload: {
        id: 'uuid-kelas',
        nama: 'X TKR 1',
        jurusan_id: 'uuid-jurusan',
        wali_kelas_id: 'uuid-guru',
        tahun_pelajaran_id: 'uuid-tp',
        kapasitas: 36,
      },
      meta: { timestamp: '2026-08-22T10:30:00.000Z', source: 'sdms-core' },
    },
    'bulk.sync': {
      event: 'bulk.sync',
      payload: {
        guru: [{ id: '...', nama: '...' }],
        siswa: [{ id: '...', nama: '...' }],
        kelas: [{ id: '...', nama: '...' }],
      },
      meta: { timestamp: '2026-08-22T10:30:00.000Z', source: 'sdms-core', type: 'bulk' },
    },
  };

  const sample = samples[event];
  if (!sample) {
    return badRequest(res, `Event '${event}' tidak dikenal. Tersedia: ${Object.keys(samples).join(', ')}`);
  }

  return success(res, sample);
};

module.exports = { testReceiver, testSender, samplePayload };
