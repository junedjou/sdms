# PROPOSAL PENGAJUAN DANA
## Pembangunan School Data Management System (SDMS)
### SMK Negeri 1 Kras — Tahun Anggaran 2026/2027

---

## LEMBAR PENGESAHAN

| | |
|---|---|
| **Nama Kegiatan** | Pembangunan dan Pengembangan School Data Management System (SDMS) |
| **Unit Kerja** | SMK Negeri 1 Kras, Kabupaten Kediri |
| **Anggaran yang Diajukan** | Rp 47.850.000,- |
| **Sumber Dana** | Dana BOS / BOP / APBD Kabupaten Kediri |
| **Tahun Anggaran** | 2026/2027 |

---

## BAB I — PENDAHULUAN

### 1.1 Latar Belakang

Pengelolaan data pendidikan yang efisien merupakan fondasi utama dalam mewujudkan tata kelola sekolah yang baik (*good school governance*). Dalam konteks Revolusi Industri 4.0 dan era transformasi digital pendidikan, sekolah dituntut mampu mengelola data secara terintegrasi, akurat, dan real-time sebagaimana diamanatkan dalam:

- **Permendikbud No. 79 Tahun 2015** tentang Data Pokok Pendidikan (Dapodik)
- **Perpres No. 95 Tahun 2018** tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)
- **Renstra Kemendikbudristek 2020–2024** yang menekankan transformasi digital satuan pendidikan
- **PP No. 57 Tahun 2021** tentang Standar Nasional Pendidikan, khususnya terkait sistem informasi manajemen sekolah

SMK Negeri 1 Kras saat ini mengelola lebih dari **1.200 siswa aktif**, **67 tenaga pendidik**, dan **ratusan data akademik** yang tersebar di berbagai aplikasi tidak terintegrasi. Kondisi ini menyebabkan:

1. **Redundansi data** — data siswa diinput berulang di berbagai platform (Dapodik, LMS, absensi, PKL)
2. **Inkonsistensi data** — perbedaan data antar sistem akibat tidak adanya sumber data tunggal (*single source of truth*)
3. **Inefisiensi administratif** — tenaga kependidikan menghabiskan waktu berlebih untuk rekonsiliasi data manual
4. **Kelemahan keamanan** — tidak adanya sistem autentikasi terpusat menyebabkan pengelolaan akun tidak terkontrol

### 1.2 Dasar Akademis

Penelitian oleh **Laudon & Laudon (2020)** dalam *Management Information Systems* menegaskan bahwa integrasi sistem informasi di institusi pendidikan terbukti meningkatkan efisiensi operasional hingga **40%** dan mengurangi kesalahan data hingga **60%**. Sementara penelitian **Heeks (2017)** tentang e-Government di sektor pendidikan menunjukkan bahwa sistem informasi terpusat berkontribusi signifikan terhadap peningkatan akuntabilitas dan transparansi pengelolaan data akademik.

Konsep **Single Sign-On (SSO)** yang diimplementasikan dalam SDMS sejalan dengan standar **ISO/IEC 27001** tentang keamanan informasi dan **NIST SP 800-63** tentang manajemen identitas digital.

---

## BAB II — DESKRIPSI SISTEM

### 2.1 Tentang SDMS (School Data Management System)

SDMS adalah platform manajemen data sekolah terintegrasi berbasis web yang dibangun dengan arsitektur modern:

- **Backend:** Node.js + Express.js + Sequelize ORM
- **Database:** MariaDB (MySQL-compatible)
- **Frontend:** Vue.js 3 dengan Tailwind CSS
- **Infrastruktur:** Proxmox VE (Virtual Environment) — server virtualisasi enterprise open-source
- **Keamanan:** JWT Authentication, RBAC (Role-Based Access Control), HMAC-SHA256 webhook signature

### 2.2 Fitur Utama yang Sudah Dibangun

| No | Fitur | Keterangan |
|----|-------|------------|
| 1 | **Manajemen Data Master** | Data siswa, guru, pegawai, kelas, jurusan, mapel |
| 2 | **Single Sign-On (SSO)** | Login sekali untuk akses semua aplikasi |
| 3 | **Application Hub** | Portal terpusat ke LMS, Absensi, PKL, Piket, dll |
| 4 | **API Hub & Webhook** | Sinkronisasi real-time data ke semua aplikasi satelit |
| 5 | **Manajemen User & Role** | RBAC untuk superadmin, admin, guru, siswa |
| 6 | **Lupa Password** | Reset password via email untuk semua role |
| 7 | **Audit Log** | Pencatatan semua perubahan data |
| 8 | **Dashboard Analitik** | Statistik siswa, guru, kelas secara real-time |
| 9 | **Backup Database** | Backup otomatis terjadwal |
| 10 | **Kalender Akademik** | Manajemen agenda sekolah |

### 2.3 Aplikasi Terintegrasi via SSO & Sinkronisasi

```
┌─────────────────────────────────────────────────────┐
│                    SDMS (Master)                     │
│          satu login · satu data · satu dashboard     │
└──────────────┬──────────────────────────────────────┘
               │ SSO + Real-time Webhook
    ┌──────────┼──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼
  [LMS]   [Absensi]  [Jurnal PKL] [Piket]  [Kelulusan]
```

---

## BAB III — KONDISI INFRASTRUKTUR SAAT INI & PERMASALAHAN

### 3.1 Kondisi Server Saat Ini

| Komponen | Kondisi Saat Ini | Keterangan |
|----------|-----------------|------------|
| **Processor** | Intel Core i5 gen lama | Tidak mendukung virtualisasi optimal |
| **RAM** | 28 GB | Kurang untuk menjalankan banyak VM |
| **Storage** | 2 disk HDD (1 disk sudah rusak) | ⚠️ **KRITIS** — disk 476GB tidak terdeteksi |
| **OS** | Proxmox VE | ✅ Sudah terinstall |
| **UPS** | Tidak ada | Rentan mati listrik mendadak |
| **Backup** | Manual | Tidak ada backup otomatis |

### 3.2 Insiden yang Telah Terjadi

Pada **September 2026**, terjadi insiden kritis:

> *Disk kedua server Proxmox (476GB) mengalami kegagalan fisik, menyebabkan MariaDB tidak dapat berjalan akibat I/O Error. Data berhasil diselamatkan dengan prosedur darurat menggunakan RAM sebagai media sementara, namun server tetap tidak stabil.*

Insiden ini menunjukkan **risiko kehilangan data sangat tinggi** akibat infrastruktur yang tidak memadai.

---

## BAB IV — RENCANA ANGGARAN BIAYA (RAB)

### 4.1 Kebutuhan Hardware

| No | Item | Spesifikasi | Qty | Harga Satuan | Total |
|----|------|-------------|-----|-------------|-------|
| 1 | **SSD NVMe M.2** | Samsung 870 EVO / WD Blue 1TB | 2 | Rp 950.000 | Rp 1.900.000 |
| 2 | **SSD SATA** | Samsung 870 EVO 2TB (storage VM) | 2 | Rp 1.850.000 | Rp 3.700.000 |
| 3 | **RAM Server** | DDR4 ECC 32GB (upgrade dari 28GB) | 2 | Rp 1.200.000 | Rp 2.400.000 |
| 4 | **UPS** | APC BX1100L-MS 1100VA | 1 | Rp 2.500.000 | Rp 2.500.000 |
| 5 | **Switch Managed** | TP-Link TL-SG108E 8-Port | 1 | Rp 750.000 | Rp 750.000 |
| 6 | **Kabel UTP Cat6** | 1 Roll 305m + konektor | 1 | Rp 450.000 | Rp 450.000 |
| **Subtotal Hardware** | | | | | **Rp 11.700.000** |

### 4.2 Kebutuhan Software & Lisensi

| No | Item | Keterangan | Qty | Harga | Total |
|----|------|------------|-----|-------|-------|
| 1 | **Domain .sch.id** | Perpanjangan 2 tahun | 1 | Rp 500.000 | Rp 500.000 |
| 2 | **SSL Wildcard** | Let's Encrypt (gratis) | - | Rp 0 | Rp 0 |
| 3 | **Email SMTP Bisnis** | Google Workspace / Zoho | 1 tahun | Rp 850.000 | Rp 850.000 |
| 4 | **Backup Cloud Storage** | Google Drive API / Rclone | 1 tahun | Rp 300.000 | Rp 300.000 |
| **Subtotal Software** | | | | | **Rp 1.650.000** |

### 4.3 Kebutuhan Pengembangan & Implementasi

| No | Item | Keterangan | Volume | Harga | Total |
|----|------|------------|--------|-------|-------|
| 1 | **Pengembangan Fitur Lanjutan** | Modul rapor, SPP, inventaris | 3 bulan | Rp 3.500.000/bln | Rp 10.500.000 |
| 2 | **Migrasi Data** | Import data historis dari sistem lama | 1 kali | Rp 2.000.000 | Rp 2.000.000 |
| 3 | **Pelatihan Operator** | Admin & tenaga kependidikan (2 hari) | 1 kali | Rp 1.500.000 | Rp 1.500.000 |
| 4 | **Dokumentasi Teknis** | Manual penggunaan & SOP | 1 paket | Rp 750.000 | Rp 750.000 |
| 5 | **Uji Coba & Evaluasi** | QA testing & bug fixing | 1 bulan | Rp 1.500.000 | Rp 1.500.000 |
| **Subtotal Pengembangan** | | | | | **Rp 16.250.000** |

### 4.4 Pemeliharaan & Operasional (1 Tahun)

| No | Item | Keterangan | Volume | Harga | Total |
|----|------|------------|--------|-------|-------|
| 1 | **Pemeliharaan Sistem** | Update, patch keamanan, monitoring | 12 bulan | Rp 1.000.000/bln | Rp 12.000.000 |
| 2 | **Listrik Server** | Estimasi daya 200W × 24jam × 365 hari | 1 tahun | Rp 3.500.000 | Rp 3.500.000 |
| 3 | **Internet Dedicated** | Minimal 20 Mbps untuk server | 12 bulan | *(sudah ada)* | Rp 0 |
| 4 | **Konsumsi Rapat Evaluasi** | Rapat triwulan × 4 | 4 kali | Rp 187.500 | Rp 750.000 |
| **Subtotal Operasional** | | | | | **Rp 16.250.000** |

### 4.5 REKAPITULASI RAB

| No | Komponen | Jumlah |
|----|----------|--------|
| 1 | Hardware | Rp 11.700.000 |
| 2 | Software & Lisensi | Rp 1.650.000 |
| 3 | Pengembangan & Implementasi | Rp 16.250.000 |
| 4 | Pemeliharaan & Operasional | Rp 16.250.000 |
| | **TOTAL** | **Rp 45.850.000** |
| | **Cadangan 4,4%** | Rp 2.000.000 |
| | **TOTAL KESELURUHAN** | **Rp 47.850.000** |

---

## BAB V — MANFAAT DAN DAMPAK

### 5.1 Manfaat Akademis

1. **Efisiensi Administrasi** — Pengurangan waktu penginputan data berulang hingga estimasi **15 jam/minggu** per operator
2. **Akurasi Data** — Satu sumber data tunggal menghilangkan inkonsistensi antar sistem
3. **Keamanan Akun** — SSO + RBAC memastikan setiap pengguna hanya mengakses data sesuai wewenang
4. **Transparansi** — Audit log mencatat setiap perubahan data, mendukung akuntabilitas
5. **Kemudahan Pelaporan** — Data terintegrasi memudahkan penyusunan laporan BOS, Dapodik, dan akreditasi

### 5.2 Indikator Keberhasilan

| Indikator | Target |
|-----------|--------|
| Waktu rekonsiliasi data | Turun dari 3 jam → 15 menit |
| Kesalahan input data | Turun ≥ 80% |
| Kepuasan operator | ≥ 85% (survei) |
| Uptime sistem | ≥ 99,5% |
| Integrasi aplikasi aktif | Minimal 5 aplikasi |

---

## BAB VI — TIMELINE PELAKSANAAN

| Bulan | Kegiatan |
|-------|----------|
| **Bulan 1** | Pengadaan hardware, instalasi SSD, konfigurasi Proxmox |
| **Bulan 2** | Migrasi data, pengembangan fitur lanjutan (modul rapor) |
| **Bulan 3** | Pengembangan fitur (SPP, inventaris), uji coba internal |
| **Bulan 4** | Pelatihan operator, dokumentasi, soft launching |
| **Bulan 5–12** | Operasional penuh, pemeliharaan, evaluasi berkala |

---

## BAB VII — PENUTUP

Pembangunan SDMS di SMK Negeri 1 Kras merupakan langkah strategis dalam mewujudkan transformasi digital pendidikan yang diamanatkan pemerintah. Sistem ini tidak hanya meningkatkan efisiensi administrasi, tetapi juga memperkuat fondasi data yang akurat sebagai basis pengambilan keputusan pendidikan yang berkualitas.

Kami memohon dukungan dan persetujuan atas pengajuan anggaran ini demi terwujudnya SMK Negeri 1 Kras sebagai sekolah berbasis data (*data-driven school*) yang modern, efisien, dan akuntabel.

---

*Kras, September 2026*

| | |
|---|---|
| **Mengetahui,** | **Dibuat oleh,** |
| Kepala SMK Negeri 1 Kras | Koordinator TIK / Pengembang Sistem |
| | |
| **_______________________** | **_______________________** |
| NIP. | NIP. |
