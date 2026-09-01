/**
 * ═══════════════════════════════════════════════════════════════
 * SDMS Webhook Receiver untuk Jurnal Guru
 * ═══════════════════════════════════════════════════════════════
 *
 * CARA PAKAI:
 * 1. Copy file ini ke project Jurnal Guru kamu
 * 2. Import di file utama (app.js/server.js):
 *
 *    const sdmsWebhook = require('./sdms-webhook-receiver');
 *    app.use('/api/webhooks/sdms', sdmsWebhook);
 *
 * 3. Set environment variable:
 *    SDMS_WEBHOOK_SECRET=sdms_jurnal_secret
 *    JURNAL_DB_HOST=127.0.0.1
 *    JURNAL_DB_NAME=jurnal_db
 *    JURNAL_DB_USER=root
 *    JURNAL_DB_PASS=
 *
 * 4. Restart Jurnal Guru
 *
 * Setiap kali admin update data di SDMS (siswa/guru/kelas/mapel),
 * data otomatis masuk ke database Jurnal Guru.
 *
 * Yang diterima:
 *   - siswa.created / siswa.updated → upsert tabel siswa
 *   - guru.created / guru.updated   → upsert tabel guru
 *   - kelas.created / kelas.updated → upsert tabel kelas
 *   - mapel.created / mapel.updated → upsert tabel mapel
 *   - bulk.sync                     → replace semua data sekaligus
 */

const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
// CONFIGURATION — sesuaikan dengan database Jurnal Guru kamu
// ══════════════════════════════════════════════════════════════

const WEBHOOK_SECRET = process.env.SDMS_WEBHOOK_SECRET || 'sdms_jurnal_secret';

// Database config — GANTI dengan database Jurnal Guru kamu
const DB_CONFIG = {
  host:     process.env.JURNAL_DB_HOST || '127.0.0.1',
  port:     parseInt(process.env.JURNAL_DB_PORT, 10) || 3306,
  user:     process.env.JURNAL_DB_USER || 'root',
  password: process.env.JURNAL_DB_PASS || '',
  database: process.env.JURNAL_DB_NAME || 'jurnal_db',
};

// ══════════════════════════════════════════════════════════════
// TABLE MAPPING — sesuaikan dengan nama tabel di Jurnal Guru
// ══════════════════════════════════════════════════════════════
// Jika nama kolom/tabel di Jurnal Guru berbeda dari SDMS,
// ubah mapping di bawah ini.

const TABLE_MAP = {
  siswa: {
    table: 'siswa',        // nama tabel di Jurnal Guru
    primaryKey: 'id',      // primary key
    // Map field SDMS → field Jurnal Guru
    // (kalau sama, cukup list field-nya saja)
    fieldMap: {
      id: 'id',
      nisn: 'nisn',
      nis: 'nis',
      nama_lengkap: 'nama_lengkap',
      nama: 'nama_lengkap',  // SDMS pakai 'nama_lengkap', Jurnal mungkin pakai 'nama'
      tempat_lahir: 'tempat_lahir',
      tanggal_lahir: 'tanggal_lahir',
      jenis_kelamin: 'jenis_kelamin',
      alamat: 'alamat',
      no_telepon: 'no_telepon',
      nama_ortu: 'nama_ortu',
      status: 'status',
      kelas_id: 'kelas_id',
    },
  },
  guru: {
    table: 'guru',
    primaryKey: 'id',
    fieldMap: {
      id: 'id',
      nip: 'nip',
      nama_lengkap: 'nama_lengkap',
      nama: 'nama_lengkap',
      email: 'email',
      no_telepon: 'no_telepon',
      mata_pelajaran: 'mata_pelajaran',
      is_active: 'is_active',
    },
  },
  kelas: {
    table: 'kelas',
    primaryKey: 'id',
    fieldMap: {
      id: 'id',
      nama_kelas: 'nama_kelas',
      tingkat: 'tingkat',
      jurusan_id: 'jurusan_id',
      wali_kelas_id: 'wali_kelas_id',
      tahun_pelajaran_id: 'tahun_pelajaran_id',
      is_active: 'is_active',
    },
  },
  mapel: {
    table: 'mata_pelajaran',
    primaryKey: 'id',
    fieldMap: {
      id: 'id',
      nama_mapel: 'nama_mapel',
      kode: 'kode',
      jurusan_id: 'jurusan_id',
      is_active: 'is_active',
    },
  },
};

// ══════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ══════════════════════════════════════════════════════════════

let dbPool = null;

const getDb = async () => {
  if (!dbPool) {
    dbPool = await mysql.createPool(DB_CONFIG);
    console.log('[SDMS Webhook] Database connected:', DB_CONFIG.database);
  }
  return dbPool;
};

// ══════════════════════════════════════════════════════════════
// HELPER: Map field dari SDMS ke format Jurnal Guru
// ══════════════════════════════════════════════════════════════

const mapFields = (type, data) => {
  const mapping = TABLE_MAP[type];
  if (!mapping) return data;

  const result = {};
  for (const [sdmsField, jurnalField] of Object.entries(mapping.fieldMap)) {
    if (data[sdmsField] !== undefined) {
      result[jurnalField] = data[sdmsField];
    }
  }
  return result;
};

// ══════════════════════════════════════════════════════════════
// UPSERT — Insert atau Update
// ══════════════════════════════════════════════════════════════

const upsert = async (pool, tableName, data, primaryKey = 'id') => {
  if (!data || !data[primaryKey]) {
    console.warn(`[SDMS Webhook] Upsert skipped — no ${primaryKey} in data`);
    return;
  }

  const fields = Object.keys(data);
  const placeholders = fields.map(() => '?').join(', ');
  const updateClause = fields
    .filter(f => f !== primaryKey)
    .map(f => `${f} = VALUES(${f})`)
    .join(', ');

  const sql = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updateClause}
  `;

  const values = fields.map(f => data[f]);
  await pool.execute(sql, values);
};

// ══════════════════════════════════════════════════════════════
// WEBHOOK HANDLER
// ══════════════════════════════════════════════════════════════

router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    // 1. Verify HMAC signature
    const signature = req.headers['x-api-signature'];
    const event = req.headers['x-sdms-event'] || req.body?.event;

    if (!event) {
      return res.status(400).json({ status: 'error', message: 'Missing X-SDMS-Event header' });
    }

    // Verify signature (optional tapi recommended)
    if (signature && WEBHOOK_SECRET) {
      const expectedSig = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSig) {
        console.warn('[SDMS Webhook] ⚠️ Invalid signature!');
        return res.status(401).json({ status: 'error', message: 'Invalid signature' });
      }
    }

    const payload = req.body?.payload || req.body;
    const pool = await getDb();

    console.log(`[SDMS Webhook] 📨 Event: ${event}`);

    // 2. Process event
    if (event === 'bulk.sync') {
      // ── FULL SYNC ──────────────────────────────────────
      await handleBulkSync(pool, payload);
      console.log(`[SDMS Webhook] ✅ Bulk sync selesai (${Date.now() - startTime}ms)`);
      return res.json({ status: 'ok', message: 'Bulk sync diterima', processed: 'bulk' });
    }

    // ── SINGLE EVENT ─────────────────────────────────────
    const [eventType, action] = event.split('.');
    const mapping = TABLE_MAP[eventType];

    if (!mapping) {
      console.log(`[SDMS Webhook] ⏭️ Event "${event}" diabaikan (tidak ada mapping)`);
      return res.json({ status: 'ok', message: `Event ${event} diterima, tidak ada mapping` });
    }

    // Map fields
    const mappedData = mapFields(eventType, payload);
    mappedData.updated_at = new Date();

    // Upsert ke database
    await upsert(pool, mapping.table, mappedData, mapping.primaryKey);

    const duration = Date.now() - startTime;
    console.log(`[SDMS Webhook] ✅ ${event} → ${mapping.table} (${duration}ms)`);

    return res.json({
      status: 'ok',
      message: `${event} berhasil diproses`,
      table: mapping.table,
      duration_ms: duration,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[SDMS Webhook] ❌ Error: ${err.message}`, err.stack);

    return res.status(500).json({
      status: 'error',
      message: err.message,
      duration_ms: duration,
    });
  }
});

// ══════════════════════════════════════════════════════════════
// BULK SYNC HANDLER
// ══════════════════════════════════════════════════════════════

const handleBulkSync = async (pool, payload) => {
  const results = {};

  for (const [type, items] of Object.entries(payload)) {
    const mapping = TABLE_MAP[type];
    if (!mapping || !Array.isArray(items)) continue;

    let count = 0;
    for (const item of items) {
      try {
        const mapped = mapFields(type, item);
        mapped.updated_at = new Date();
        await upsert(pool, mapping.table, mapped, mapping.primaryKey);
        count++;
      } catch (err) {
        console.error(`[SDMS Webhook] Gagal sync ${type} item: ${err.message}`);
      }
    }
    results[type] = count;
    console.log(`[SDMS Webhook]   → ${mapping.table}: ${count} records`);
  }

  return results;
};

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINT
// ══════════════════════════════════════════════════════════════

router.get('/health', async (req, res) => {
  try {
    const pool = await getDb();
    await pool.execute('SELECT 1');
    res.json({ status: 'ok', message: 'Jurnal Guru + SDMS webhook ready', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, db: 'disconnected' });
  }
});

// ══════════════════════════════════════════════════════════════
// TEST ENDPOINT — untuk cek apakah webhook sudah terpasang
// ══════════════════════════════════════════════════════════════

router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: '🎉 SDMS Webhook Receiver aktif!',
    timestamp: new Date().toISOString(),
    tables: Object.keys(TABLE_MAP),
  });
});

module.exports = router;
