'use strict';
/**
 * Script darurat: push data kelas siswa langsung dari SDMS ke LMS
 * Jalankan di server SDMS (10.10.102.13):
 *   node /tmp/push-kelas-to-lms.js
 */
const path = require('path');
require('dotenv').config({ path: '/var/www/sdms/backend/.env' });
process.env.DOTENV_PATH = '/var/www/sdms/backend/.env';

const axios   = require('/var/www/sdms/backend/node_modules/axios');
const crypto  = require('crypto');
const mysql   = require('/var/www/sdms/backend/node_modules/mysql2/promise');

const LMS_URL    = process.env.LMS_URL    || 'http://10.10.102.11:3000';
const SECRET     = process.env.LMS_WEBHOOK_SECRET || 'sdms_lms_secret';

async function main() {
  // Koneksi ke MariaDB SDMS
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || 'kediri123',
    database: process.env.DB_NAME     || 'sdms_master',
  });

  console.log('Terhubung ke MariaDB SDMS');

  // Ambil semua siswa dengan kelas
  const [rows] = await conn.query(`
    SELECT 
      s.id, s.nisn, s.nis, s.nama, s.jenis_kelamin,
      s.jurusan_id, s.kelas_id,
      s.tahun_masuk, s.status,
      s.tempat_lahir, s.tanggal_lahir,
      s.agama, s.no_hp, s.alamat,
      k.nama AS kelas_nama,
      k.id   AS kelas_id_val
    FROM siswa s
    LEFT JOIN kelas k ON k.id = s.kelas_id
    WHERE s.status = 'Aktif' AND s.kelas_id IS NOT NULL
  `);

  console.log(`Total siswa dengan kelas: ${rows.length}`);

  let ok = 0, fail = 0;
  const BATCH = 50;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const siswaPayload = batch.map(s => ({
      id:           s.id,
      nisn:         s.nisn,
      nis:          s.nis,
      nama:         s.nama,
      jenis_kelamin: s.jenis_kelamin,
      kelas_id:     s.kelas_id,
      kelas_nama:   s.kelas_nama,
      tahun_masuk:  s.tahun_masuk,
      status:       s.status,
      tempat_lahir: s.tempat_lahir,
      tanggal_lahir: s.tanggal_lahir,
      agama:        s.agama,
      no_hp:        s.no_hp,
      alamat:       s.alamat,
    }));

    const envelope = {
      event:   'bulk.sync',
      payload: { siswa: siswaPayload, guru: [], kelas: [] },
      meta:    { timestamp: new Date().toISOString(), source: 'sdms-core', type: 'bulk' },
    };

    const signature = crypto.createHmac('sha256', SECRET)
      .update(JSON.stringify(envelope)).digest('hex');

    try {
      await axios.post(`${LMS_URL}/api/webhooks/sdms`, envelope, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-SDMS-Event':     'bulk.sync',
          'X-API-Signature':  signature,
          'X-SDMS-Timestamp': envelope.meta.timestamp,
        },
      });
      ok += batch.length;
      process.stdout.write(`\r  Progress: ${ok}/${rows.length} siswa`);
    } catch (e) {
      fail += batch.length;
      console.warn(`\n  Batch ${i}-${i+BATCH} gagal: ${e.message}`);
    }

    // Jeda kecil agar tidak flood
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n\nSelesai! OK: ${ok}, Gagal: ${fail}`);
  await conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
