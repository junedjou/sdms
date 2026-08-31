/**
 * Migration: buat tabel app_settings
 * Jalankan: node migrations/create_app_settings.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { masterDB } = require('../src/config/database');

(async () => {
  try {
    await masterDB.authenticate();
    await masterDB.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        \`key\`     VARCHAR(100) NOT NULL UNIQUE,
        value       TEXT,
        label       VARCHAR(200),
        \`group\`   VARCHAR(50) NOT NULL DEFAULT 'general',
        type        ENUM('text','color','image','textarea','boolean') DEFAULT 'text',
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group (\`group\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Tabel app_settings berhasil dibuat');
    process.exit(0);
  } catch (err) {
    console.error('✗ Gagal:', err.message);
    process.exit(1);
  }
})();
