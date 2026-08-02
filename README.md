# SDMS — School Data Management System

> **Visi: One Login · One Data · One Dashboard**

Platform induk yang mengintegrasikan seluruh aplikasi sekolah (LMS, Jurnal Guru, Piket, Absensi Sholat, Kegiatan, Kelulusan, Website) dalam **satu tampilan** dengan SSO, tanpa menggabungkan database masing-masing.

---

## Prasyarat

| Software | Versi Minimum | Keterangan |
|---|---|---|
| **Node.js** | 18.x | [nodejs.org](https://nodejs.org) |
| **XAMPP** | 8.x | MariaDB/MySQL wajib aktif |
| npm | 9.x | Ikut terinstall bersama Node.js |

> MongoDB dan Redis **tidak wajib** untuk menjalankan SDMS di lokal. Keduanya bersifat opsional dan dinonaktifkan secara default.

---

## Struktur Proyek

```
sdms/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/       # database.js, index.js
│   │   ├── controllers/  # auth, dashboard, master, user
│   │   ├── gateway/      # API Gateway & SSO routes
│   │   ├── middleware/    # auth JWT, RBAC, auditLog, rateLimiter
│   │   ├── models/       # Sequelize models (MariaDB)
│   │   ├── routes/       # Express routes
│   │   ├── services/     # eventBus, syncService, ssoService
│   │   └── utils/        # logger, response, helpers
│   ├── seeds/            # Data awal (roles, permissions, superadmin)
│   ├── .env              # Konfigurasi (sudah ada, siap pakai XAMPP)
│   └── package.json
└── frontend/         # Vue 3 + Vite + Tailwind CSS
    ├── src/
    │   ├── assets/       # CSS global
    │   ├── components/   # Layout, Common components
    │   ├── router/       # Vue Router
    │   ├── services/     # Axios API service
    │   ├── stores/       # Pinia stores
    │   ├── utils/        # helpers, toast
    │   └── views/        # Halaman (auth, dashboard, master, users)
    └── package.json
```

---

## Langkah Instalasi (XAMPP Lokal)

### 1. Buat Database di phpMyAdmin

Buka `http://localhost/phpmyadmin`, lalu jalankan SQL berikut:

```sql
CREATE DATABASE sdms_master
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

> Database aplikasi lain (piket_db, sholat_db, dll) **tidak perlu dibuat dulu** — hanya buat jika aplikasi tersebut sudah ada.

### 2. Install Backend

```bash
cd d:\WEBSITE\sdms\backend
npm install
```

### 3. Cek File `.env`

File `.env` sudah ada dan siap pakai untuk XAMPP default:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # kosong untuk XAMPP default
DB_NAME=sdms_master
```

Jika MySQL XAMPP Anda menggunakan password, edit baris `DB_PASSWORD=` di file `.env`.

### 4. Jalankan Backend (buat tabel otomatis)

```bash
cd d:\WEBSITE\sdms\backend
npm run dev
```

Sequelize akan membuat semua tabel secara otomatis saat server pertama kali berjalan (`sync: alter`).

Anda akan melihat output seperti:
```
✓ MariaDB Master (sdms_master) terhubung
Semua model berhasil di-sync ke MariaDB Master
Server berjalan di port 3000 [development]
```

### 5. Isi Data Awal (Roles, Permissions, Super Admin)

Buka terminal baru:

```bash
cd d:\WEBSITE\sdms\backend
npm run seed
```

Output:
```
Seeding permissions... 40 permissions selesai
Seeding roles... 6 roles selesai
Super admin user dibuat: username=superadmin, password=Admin@SDMS2024!
PENTING: Ganti password super admin setelah login pertama!
```

### 6. Install & Jalankan Frontend

```bash
cd d:\WEBSITE\sdms\frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`

### 7. Login

Buka browser: **http://localhost:5173**

| Field    | Value |
|---|---|
| Username | `superadmin` |
| Password | `Admin@SDMS2024!` |

> **Segera ganti password** setelah login pertama melalui menu **Profil Saya → Ganti Password**.

---

## Menjalankan Setiap Hari

Cukup 2 langkah:

**1. Pastikan XAMPP MySQL sudah ON**

**2. Jalankan backend + frontend:**

```bash
# Terminal 1 — Backend
cd d:\WEBSITE\sdms\backend
npm run dev

# Terminal 2 — Frontend
cd d:\WEBSITE\sdms\frontend
npm run dev
```

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Auth
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/auth/login` | Login, dapat JWT token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET  | `/auth/me` | Info user yang login |
| PATCH| `/auth/change-password` | Ganti password |

### Dashboard
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/dashboard/stats` | Jumlah guru, siswa, pegawai, kelas |
| GET | `/dashboard/agenda` | Agenda 30 hari ke depan |
| GET | `/dashboard/summary` | Statistik per jurusan, JK, status |
| GET | `/dashboard/app-hub` | Daftar aplikasi + status akses |
| GET | `/dashboard/audit-log` | Log aktivitas sistem |

### Master Data
| Method | Endpoint | Keterangan |
|---|---|---|
| GET/POST | `/master/guru` | Daftar & tambah guru |
| GET/PUT/DELETE | `/master/guru/:id` | Detail, edit, hapus guru |
| GET/POST | `/master/siswa` | Daftar & tambah siswa |
| GET/PUT/DELETE | `/master/siswa/:id` | Detail, edit, hapus siswa |
| GET/POST | `/master/pegawai` | Daftar & tambah pegawai |
| GET/POST | `/master/jurusan` | Daftar & tambah jurusan |
| GET/POST | `/master/kelas` | Daftar & tambah kelas |
| GET/POST | `/master/mapel` | Daftar & tambah mata pelajaran |
| GET/POST | `/master/tahun-pelajaran` | Tahun pelajaran |
| PATCH | `/master/tahun-pelajaran/:id/aktif` | Set tahun pelajaran aktif |
| GET/POST | `/master/semester` | Semester |
| GET/POST/PUT/DELETE | `/master/kalender` | Kalender akademik |

### User Management
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/users` | Daftar user |
| POST | `/users` | Buat user baru |
| PUT | `/users/:id` | Edit user |
| DELETE | `/users/:id` | Hapus user |
| PATCH | `/users/:id/reset-password` | Reset password user |
| GET | `/users/roles` | Daftar role & permissions |

### API Gateway
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/gateway/sso/token?app=lms` | Buat SSO token untuk redirect |
| POST | `/gateway/sso/verify` | Verifikasi SSO token (dari app eksternal) |
| GET | `/gateway/health` | Cek status semua aplikasi |
| GET | `/gateway/sync/targets` | Daftar target sinkronisasi |
| POST | `/gateway/sync/bulk` | Trigger bulk sync |

---

## Daftar Role & Hak Akses

| Role | Label | Hak Akses |
|---|---|---|
| `super_admin` | Super Administrator | Semua fitur tanpa batas |
| `admin` | Administrator | Master data, user, semua modul |
| `guru` | Guru | LMS, Jurnal, Piket, Sholat, Kegiatan |
| `pegawai` | Pegawai TU | Siswa, Piket, Sholat, Kelulusan |
| `siswa` | Siswa | LMS |
| `operator` | Operator | Piket, Sholat, lihat data siswa |

---

## Alur SSO (Single Sign-On)

Ketika user klik aplikasi di **Application Hub**:

```
1. Frontend → GET /gateway/sso/token?app=lms
2. Backend buat JWT token khusus (5 menit, secret per-app)
3. Frontend redirect ke: http://localhost:4000/sso/callback?token=xxx
4. Aplikasi LMS POST /gateway/sso/verify { token, app: 'lms' }
5. SDMS verifikasi → kembalikan data user
6. LMS buat session lokal → user masuk tanpa login ulang
```

---

## Alur Sinkronisasi Data

Ketika admin ubah data siswa:

```
master.controller.js
       │
       ▼
syncEvent('siswa.updated', data)
       │
       ▼
EventBus.publish()
       │
  ┌────┼────┬────┬────┐
  ▼    ▼    ▼    ▼    ▼
 LMS Jurnal Piket Sholat Kegiatan
(webhook push ke masing-masing app)
```

Untuk tambah aplikasi baru: cukup tambahkan entry di `syncService.js → SYNC_TARGETS`.

---

## Konfigurasi `.env` Lengkap

```env
# App
NODE_ENV=development
PORT=3000

# Database XAMPP
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sdms_master

# MongoDB (opsional)
MONGO_ENABLED=false

# Redis (opsional)
REDIS_ENABLED=false

# JWT (WAJIB diganti di production!)
JWT_SECRET=ganti_dengan_string_panjang_random
JWT_REFRESH_SECRET=ganti_dengan_string_berbeda
```

---

## Troubleshooting

### ❌ `Error: connect ECONNREFUSED 127.0.0.1:3306`
XAMPP MySQL belum berjalan. Buka XAMPP Control Panel → klik **Start** pada MySQL.

### ❌ `Unknown database 'sdms_master'`
Database belum dibuat. Buka phpMyAdmin → buat database `sdms_master` dengan charset `utf8mb4`.

### ❌ `ER_ACCESS_DENIED_ERROR`
Password MySQL salah. Cek `DB_PASSWORD` di file `.env`. XAMPP default: kosong.

### ❌ `Cannot find module 'ioredis'`
Redis module tetap terinstall tapi dinonaktifkan. Jalankan `npm install` di folder backend.

### ❌ Port 3000 sudah terpakai
Ubah `PORT=3001` di `.env`, lalu update `vite.config.js` proxy target ke `http://localhost:3001`.

### ❌ `Table 'sdms_master.xxx' doesn't exist`
Tabel belum terbuat. Pastikan `npm run dev` dijalankan dulu (sync otomatis), atau cek log error.

---

## Scripts

```bash
# Backend
npm run dev      # Jalankan dengan nodemon (auto-restart)
npm run start    # Jalankan normal (production)
npm run seed     # Isi data awal (roles, permissions, superadmin)

# Frontend
npm run dev      # Development server (port 5173)
npm run build    # Build untuk production
npm run preview  # Preview hasil build
```

---

## Roadmap Pengembangan

- [x] **Tahap 1** — SDMS Core: Login, Dashboard, User Management
- [x] **Tahap 2** — Master Data: Guru, Siswa, Pegawai, Kelas, Jurusan, Mapel
- [x] **Tahap 3** — API Gateway & SSO
- [x] **Tahap 4-10** — Integrasi LMS, Jurnal, Piket, Sholat, Kegiatan, Kelulusan, Website
- [ ] **Tahap 11** — Analytics lanjutan
- [ ] **Tahap 12** — Mobile App (React Native / Flutter)
- [ ] **Tahap 13** — Inventaris, Perpustakaan, PKL, Alumni

---

*SDMS v1.0.0 — School Data Management System*
