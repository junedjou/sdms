/**
 * Migration: tambah kolom hp_ortu, nama_ayah, nama_ibu, pernah_dapat_bantuan ke tabel siswa
 * Jalankan: node migrations/add_extra_fields_to_siswa.js
 */
const { masterDB } = require('../src/config/database');

(async () => {
  try {
    await masterDB.authenticate();

    const columnsToAdd = [
      {
        name: 'hp_ortu',
        sql: `ALTER TABLE siswa ADD COLUMN hp_ortu VARCHAR(20) NULL COMMENT 'Nomor HP orang tua/wali' AFTER no_hp`,
      },
      {
        name: 'nama_ayah',
        sql: `ALTER TABLE siswa ADD COLUMN nama_ayah VARCHAR(200) NULL COMMENT 'Nama ayah kandung' AFTER hp_ortu`,
      },
      {
        name: 'nama_ibu',
        sql: `ALTER TABLE siswa ADD COLUMN nama_ibu VARCHAR(200) NULL COMMENT 'Nama ibu kandung' AFTER nama_ayah`,
      },
      {
        name: 'pernah_dapat_bantuan',
        sql: `ALTER TABLE siswa ADD COLUMN pernah_dapat_bantuan TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Apakah siswa pernah mendapat bantuan (KIP, PIP, dll)' AFTER nama_ibu`,
      },
    ];

    for (const col of columnsToAdd) {
      // Cek apakah kolom sudah ada
      const [results] = await masterDB.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'siswa'
          AND COLUMN_NAME  = '${col.name}'
      `);

      if (results.length > 0) {
        console.log(`✓ Kolom ${col.name} sudah ada, dilewati`);
        continue;
      }

      await masterDB.query(col.sql);
      console.log(`✓ Kolom ${col.name} berhasil ditambahkan`);
    }

    console.log('\n✅ Migrasi selesai');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migrasi gagal:', err.message);
    process.exit(1);
  }
})();
