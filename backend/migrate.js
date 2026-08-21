/**
 * Simple migration runner untuk api_clients & webhook_logs
 * Jalankan dari root backend: node migrate.js
 */
require('dotenv').config();
const { masterDB } = require('./src/config/database');

const migrate = async () => {
  console.log('🔄 Menjalankan migration: create api_clients & webhook_logs...\n');

  // ── api_clients ──────────────────────────────────────────
  await masterDB.query(`
    CREATE TABLE IF NOT EXISTS api_clients (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      webhook_url VARCHAR(500) NOT NULL,
      api_key VARCHAR(64) NOT NULL UNIQUE,
      api_secret VARCHAR(128) NOT NULL,
      events JSON NOT NULL,
      status ENUM('active','inactive','error') DEFAULT 'active',
      last_sync_at DATETIME,
      last_error TEXT,
      error_count INT DEFAULT 0,
      total_delivered INT DEFAULT 0,
      total_failed INT DEFAULT 0,
      created_by INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_api_key (api_key),
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Tabel api_clients berhasil dibuat');

  // ── webhook_logs ─────────────────────────────────────────
  await masterDB.query(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      api_client_id CHAR(36) NOT NULL,
      event VARCHAR(100) NOT NULL,
      payload JSON NOT NULL,
      webhook_url VARCHAR(500) NOT NULL,
      status ENUM('pending','success','failed','retrying') DEFAULT 'pending',
      http_status INT,
      response_body TEXT,
      error_message TEXT,
      attempt INT DEFAULT 1,
      duration_ms INT,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_api_client_id (api_client_id),
      INDEX idx_event (event),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (api_client_id) REFERENCES api_clients(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Tabel webhook_logs berhasil dibuat');

  console.log('\n✅ Migration selesai!');
  process.exit(0);
};

migrate().catch(err => {
  console.error('❌ Migration gagal:', err.message);
  process.exit(1);
});
