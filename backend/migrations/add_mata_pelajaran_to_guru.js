/**
 * Migration: tambah kolom mata_pelajaran ke tabel guru
 * Jalankan: node migrations/add_mata_pelajaran_to_guru.js
 */
const { masterDB } = require('../src/config/database');

(async () => {
  try {
    await masterDB.authenticate();

    // Cek apakah kolom sudah ada
    const [results] = await masterDB.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'guru'
        AND COLUMN_NAME = 'mata_pelajaran'
    `);

    if (results.length > 0) {
      console.log('✓ Kolom mata_pelajaran sudah ada, tidak perlu migrasi');
      process.exit(0);
    }

    await masterDB.query(`
      ALTER TABLE guru
      ADD COLUMN mata_pelajaran VARCHAR(200) NULL
      COMMENT 'Mata pelajaran yang diampu, bisa lebih dari satu dipisah koma'
      AFTER jabatan
    `);

    console.log('✓ Kolom mata_pelajaran berhasil ditambahkan ke tabel guru');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migrasi gagal:', err.message);
    process.exit(1);
  }
})();
