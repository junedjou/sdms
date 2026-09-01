# 📚 Panduan Sync Jurnal Guru ↔ SDMS

## Arsitektur

```
┌──────────────────┐         Webhook          ┌──────────────────┐
│      SDMS        │ ──────────────────────→  │   Jurnal Guru    │
│  (Data Pusat)    │                          │  (10.10.102.21)  │
│                  │ ←──────────────────────  │                  │
│  • Siswa         │      Pull Data           │  • Jurnal Harian │
│  • Guru          │                          │  • Rekap Absen   │
│  • Kelas         │                          │  • Nilai         │
│  • Mapel         │                          │  • Jadwal        │
└──────────────────┘                          └──────────────────┘
```

## Langkah Setup

### 1. Install dependencies di Jurnal Guru

```bash
cd /path/to/jurnal-guru
npm install mysql2 express  # mysql2 sudah ada kalau pakai MySQL
```

### 2. Copy webhook receiver

```bash
cp sdms-webhook-receiver.js /path/to/jurnal-guru/
```

### 3. Daftarkan route di app.js Jurnal Guru

```javascript
// Di file utama (app.js / server.js)
const sdmsWebhook = require('./sdms-webhook-receiver');

// Mount di path /api/webhooks/sdms
app.use('/api/webhooks/sdms', sdmsWebhook);

console.log('✅ SDMS Webhook Receiver terpasang');
```

### 4. Set environment variables

```bash
# Di .env Jurnal Guru
SDMS_WEBHOOK_SECRET=sdms_jurnal_secret
JURNAL_DB_HOST=127.0.0.1
JURNAL_DB_NAME=jurnal_db
JURNAL_DB_USER=root
JURNAL_DB_PASS=
```

### 5. Pastikan tabel ada di database Jurnal Guru

Webhook receiver mengharapkan tabel-tabel ini ada di database Jurnal Guru:

```sql
-- Tabel Siswa (minimal)
CREATE TABLE IF NOT EXISTS siswa (
  id CHAR(36) PRIMARY KEY,
  nisn VARCHAR(20),
  nis VARCHAR(20),
  nama_lengkap VARCHAR(100),
  tempat_lahir VARCHAR(50),
  tanggal_lahir DATE,
  jenis_kelamin ENUM('L','P'),
  alamat TEXT,
  no_telepon VARCHAR(20),
  nama_ortu VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Aktif',
  kelas_id CHAR(36),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nisn (nisn),
  INDEX idx_kelas (kelas_id)
);

-- Tabel Guru
CREATE TABLE IF NOT EXISTS guru (
  id CHAR(36) PRIMARY KEY,
  nip VARCHAR(20),
  nama_lengkap VARCHAR(100),
  email VARCHAR(100),
  no_telepon VARCHAR(20),
  mata_pelajaran VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nip (nip)
);

-- Tabel Kelas
CREATE TABLE IF NOT EXISTS kelas (
  id CHAR(36) PRIMARY KEY,
  nama_kelas VARCHAR(50),
  tingkat INT,
  jurusan_id CHAR(36),
  wali_kelas_id CHAR(36),
  tahun_pelajaran_id CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id CHAR(36) PRIMARY KEY,
  nama_mapel VARCHAR(100),
  kode VARCHAR(20),
  jurusan_id CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> **Catatan:** Jika nama tabel/kolom di Jurnal Guru berbeda, edit mapping di `sdms-webhook-receiver.js` bagian `TABLE_MAP`.

### 6. Set URL Jurnal Guru di SDMS

Di VPS SDMS, edit `.env`:

```bash
JURNAL_URL=http://10.10.102.21
```

Lalu restart:
```bash
pm2 restart sdms-backend --update-env
```

### 7. Test koneksi

```bash
# Dari VPS SDMS, test apakah Jurnal Guru bisa diakses
curl http://10.10.102.21/api/webhooks/sdms/test
```

Harus muncul:
```json
{
  "status": "ok",
  "message": "🎉 SDMS Webhook Receiver aktif!",
  "tables": ["siswa", "guru", "kelas", "mapel"]
}
```

### 8. Jalankan Full Sync

Buka **Application Hub** → **Kelola Aplikasi** → klik **"Sinkron ke Jurnal"**

Atau via API:
```bash
curl -X POST http://localhost:3000/api/v1/gateway/sync/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target": "Jurnal"}'
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Connection refused | Cek IP & port Jurnal Guru benar. Pastikan firewall tidak memblokir |
| Invalid signature | Pastikan `SDMS_WEBHOOK_SECRET` sama di SDMS (.env) dan Jurnal Guru (.env) |
| Table doesn't exist | Jalankan SQL CREATE TABLE di atas ke database Jurnal Guru |
| Data tidak masuk | Cek log Jurnal Guru: `pm2 logs jurnal-guru` |
| Field name beda | Edit `TABLE_MAP` di `sdms-webhook-receiver.js` |
