-- ============================================================
-- SDMS — Init SQL untuk Docker/Server
-- File ini dijalankan otomatis saat container MariaDB pertama kali dibuat
-- Untuk XAMPP: buat database manual via phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS sdms_master
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Database aplikasi lain (opsional — hapus yang tidak dipakai)
CREATE DATABASE IF NOT EXISTS piket_db     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS sholat_db    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS kegiatan_db  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS kelulusan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS website_db   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant ke user SDMS
GRANT ALL PRIVILEGES ON sdms_master.*    TO 'sdms_user'@'%';
GRANT ALL PRIVILEGES ON piket_db.*       TO 'sdms_user'@'%';
GRANT ALL PRIVILEGES ON sholat_db.*      TO 'sdms_user'@'%';
GRANT ALL PRIVILEGES ON kegiatan_db.*    TO 'sdms_user'@'%';
GRANT ALL PRIVILEGES ON kelulusan_db.*   TO 'sdms_user'@'%';
GRANT ALL PRIVILEGES ON website_db.*     TO 'sdms_user'@'%';

FLUSH PRIVILEGES;
