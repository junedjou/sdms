'use strict';
/**
 * Update kelas_nama di sdms_siswa (LMS PostgreSQL) 
 * langsung dari data SDMS MariaDB
 * Jalankan di server SDMS (10.10.102.13):
 *   cd /var/www/sdms/backend && node update-kelas-lms.js
 */
const path = require('path');
require('dotenv').config({ path: '/var/www/sdms/backend/.env' });

const mysql  = require('mysql2/promise');
const { Pool } = require('pg');

// Koneksi SDMS MariaDB
const mariaConf = {
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'kediri123',
  database: process.env.DB_NAME     || 'sdms_master',
};

// Koneksi LMS PostgreSQL — hardcoded karena tidak ada di .env SDMS
const pgConf = {
  host:     '10.10.102.12',
  port:     5432,
  user:     'lmsuser',
  password: 'Kediri123!',
  database: 'cbt_smk',
  connectionTimeoutMillis: 10000,
};

console.log('LMS PG config:', { host: pgConf.host, user: pgConf.user, database: pgConf.database });

async function main() {
  const mariaConn = await mysql.createConnection(mariaConf);
  const pgPool    = new Pool(pgConf);

  console.log('Terhubung ke kedua database');

  // Ambil siswa + kelas dari SDMS MariaDB
  const [rows] = await mariaConn.query(`
    SELECT s.id AS sdms_id, s.kelas_id, k.nama AS kelas_nama
    FROM siswa s
    JOIN kelas k ON k.id = s.kelas_id
    WHERE s.status = 'Aktif' AND s.kelas_id IS NOT NULL
  `);

  console.log(`Siswa dengan kelas di SDMS: ${rows.length}`);

  let updated = 0, errors = 0;

  for (const r of rows) {
    try {
      await pgPool.query(
        `UPDATE sdms_siswa SET kelas_id=$1, kelas_nama=$2, synced_at=NOW()
         WHERE sdms_id=$3`,
        [r.kelas_id, r.kelas_nama, r.sdms_id]
      );
      updated++;
      if (updated % 100 === 0) process.stdout.write(`\r  Update: ${updated}/${rows.length}`);
    } catch (e) {
      errors++;
      if (errors <= 3) console.warn(`\n  Error ${r.sdms_id}: ${e.message}`);
    }
  }

  console.log(`\n\nsdms_siswa diupdate: ${updated}, errors: ${errors}`);

  // Update class_id di tabel users
  const { rowCount } = await pgPool.query(`
    UPDATE users u
    SET class_id = c.id
    FROM sdms_siswa ss
    JOIN classes c ON c.code = UPPER(REPLACE(TRIM(ss.kelas_nama), ' ', '-'))
    WHERE (u.username = ss.nisn OR u.username = ss.nis)
      AND u.role = 'STUDENT'
      AND ss.kelas_nama IS NOT NULL
      AND ss.is_active = true
  `);

  console.log(`users.class_id diupdate: ${rowCount} siswa`);

  // Verifikasi
  const res = await pgPool.query(`
    SELECT COUNT(*) AS berkelas FROM users WHERE role='STUDENT' AND class_id IS NOT NULL
  `);
  console.log(`Siswa berkelas di LMS: ${res.rows[0].berkelas}`);

  // Sample
  const sample = await pgPool.query(`
    SELECT u.username, u.full_name, c.name AS kelas
    FROM users u JOIN classes c ON c.id = u.class_id
    WHERE u.role = 'STUDENT' LIMIT 5
  `);
  console.log('\nSample siswa dengan kelas:');
  sample.rows.forEach(r => console.log(`  ${r.username} | ${r.full_name} | ${r.kelas}`));

  await mariaConn.end();
  await pgPool.end();
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
