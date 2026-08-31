/**
 * Migration: tambah kolom kelas_id ke tabel siswa
 * Jalankan: node migrations/add_kelas_id_to_siswa.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { masterDB } = require('../src/config/database');

(async () => {
  try {
    await masterDB.authenticate();

    // Cek apakah kolom sudah ada
    const [results] = await masterDB.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'siswa'
        AND COLUMN_NAME = 'kelas_id'
    `);

    if (results.length > 0) {
      console.log('✓ Kolom kelas_id sudah ada, tidak perlu migrasi');
      process.exit(0);
    }

    await masterDB.query(`
      ALTER TABLE siswa
      ADD COLUMN kelas_id CHAR(36) NULL
      COMMENT 'Kelas aktif siswa saat ini'
      AFTER jurusan_id
    `);

    // Tambah index
    await masterDB.query(`
      ALTER TABLE siswa
      ADD INDEX idx_siswa_kelas_id (kelas_id)
    `);

    console.log('✓ Kolom kelas_id berhasil ditambahkan ke tabel siswa');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migrasi gagal:', err.message);
    process.exit(1);
  }
})();
