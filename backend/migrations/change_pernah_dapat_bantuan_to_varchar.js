/**
 * Migration: ubah kolom pernah_dapat_bantuan dari TINYINT ke VARCHAR(100)
 * agar bisa menyimpan jenis bantuan (KIP, PIP, PKH, BSM, dll)
 *
 * Jalankan: node migrations/change_pernah_dapat_bantuan_to_varchar.js
 *   atau via: bash deploy/run-migration.sh
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { masterDB } = require('../src/config/database');

(async () => {
  try {
    await masterDB.authenticate();

    // Cek tipe kolom saat ini
    const [results] = await masterDB.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'siswa'
        AND COLUMN_NAME  = 'pernah_dapat_bantuan'
    `);

    if (results.length === 0) {
      // Kolom belum ada sama sekali — tambahkan langsung sebagai VARCHAR
      await masterDB.query(`
        ALTER TABLE siswa
        ADD COLUMN pernah_dapat_bantuan VARCHAR(100) NULL
        COMMENT 'Jenis bantuan yang pernah diterima (KIP, PIP, PKH, BSM, dll), NULL jika tidak ada'
        AFTER nama_ibu
      `);
      console.log('✓ Kolom pernah_dapat_bantuan ditambahkan sebagai VARCHAR(100)');
    } else {
      const currentType = results[0].DATA_TYPE.toLowerCase();
      if (currentType === 'tinyint' || currentType === 'bit' || currentType === 'int') {
        // Ubah dari TINYINT ke VARCHAR — konversi nilai lama: 1 → NULL (belum ada nama jenis), 0 → NULL
        await masterDB.query(`
          ALTER TABLE siswa
          MODIFY COLUMN pernah_dapat_bantuan VARCHAR(100) NULL
          COMMENT 'Jenis bantuan yang pernah diterima (KIP, PIP, PKH, BSM, dll), NULL jika tidak ada'
        `);
        // Set semua yang tadinya 1 menjadi NULL (perlu diisi ulang jenis bantuannya)
        await masterDB.query(`
          UPDATE siswa SET pernah_dapat_bantuan = NULL WHERE pernah_dapat_bantuan = '1' OR pernah_dapat_bantuan = '0'
        `);
        console.log('✓ Kolom pernah_dapat_bantuan diubah dari TINYINT ke VARCHAR(100)');
        console.log('  (nilai lama 1/0 dikosongkan — perlu diisi ulang jenis bantuannya)');
      } else if (currentType === 'varchar') {
        console.log('✓ Kolom pernah_dapat_bantuan sudah VARCHAR, tidak perlu migrasi');
      } else {
        console.log(`✓ Tipe saat ini: ${results[0].COLUMN_TYPE} — tidak ada perubahan`);
      }
    }

    console.log('\n✅ Migrasi selesai');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migrasi gagal:', err.message);
    process.exit(1);
  }
})();
