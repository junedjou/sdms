# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()
section = doc.sections[0]
section.top_margin    = Cm(3)
section.bottom_margin = Cm(3)
section.left_margin   = Cm(4)
section.right_margin  = Cm(3)

BLUE  = RGBColor(0x1e, 0x40, 0xaf)
BLACK = RGBColor(0x00, 0x00, 0x00)
DARK  = RGBColor(0x1e, 0x29, 0x3b)
GREEN = RGBColor(0x06, 0x6d, 0x2c)
RED   = RGBColor(0x9b, 0x1c, 0x1c)

def pb(): doc.add_page_break()

def center(text, size=14, bold=True, color=BLUE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.bold = bold; run.font.size = Pt(size); run.font.color.rgb = color

def h2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True; run.font.size = Pt(13); run.font.color.rgb = BLUE
    p.paragraph_format.space_before = Pt(10); p.paragraph_format.space_after = Pt(3)

def h3(text, color=DARK):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True; run.font.size = Pt(12); run.font.color.rgb = color

def body(text, italic=False, bold=False, indent=True, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    if indent: p.paragraph_format.first_line_indent = Cm(1)
    run = p.add_run(text)
    run.font.size = Pt(12); run.italic = italic; run.bold = bold

def bullet(text, prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if prefix:
        r = p.add_run(prefix); r.bold = True; r.font.size = Pt(12)
    p.add_run(text).font.size = Pt(12)

def sep():
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('━' * 65)
    run.font.color.rgb = BLUE; run.font.size = Pt(8)

def tbl(headers, rows, fs=10):
    t = doc.add_table(rows=len(rows)+1, cols=len(headers))
    t.style = 'Table Grid'
    for i,h in enumerate(headers):
        c = t.rows[0].cells[i]; c.text = h
        for para in c.paragraphs:
            for run in para.runs:
                run.bold = True; run.font.size = Pt(fs)
    for ri,row in enumerate(rows,1):
        for ci,val in enumerate(row):
            t.rows[ri].cells[ci].text = str(val)
            for para in t.rows[ri].cells[ci].paragraphs:
                for run in para.runs:
                    run.font.size = Pt(fs)
                    if any(x in str(val) for x in ['SUBTOTAL','TOTAL KESELURUHAN','TOTAL']):
                        run.bold = True
    doc.add_paragraph()
    return t

# ══════════════════════════════════════════════════════
# SAMPUL
# ══════════════════════════════════════════════════════
doc.add_paragraph(); doc.add_paragraph()
center("PROPOSAL PENGAJUAN ANGGARAN", 16, True, BLUE)
center("PEMBANGUNAN SISTEM INFORMASI MANAJEMEN SEKOLAH", 14, True, BLUE)
center("SCHOOL DATA MANAGEMENT SYSTEM (SDMS)", 14, True, BLUE)
center('"Satu Data, Satu Login, Semua Aplikasi"', 12, False, DARK)
doc.add_paragraph(); sep(); doc.add_paragraph()
center("SMK NEGERI 1 KRAS", 13, True, DARK)
center("Jl. Raya Kras, Kabupaten Kediri, Jawa Timur", 11, False, DARK)
doc.add_paragraph()
center("April — September 2026", 12, True, DARK)
doc.add_paragraph(); doc.add_paragraph()

sep()
h2("LEMBAR PENGESAHAN")
tbl(["Keterangan","Isi"],[
    ("Nama Kegiatan","Pembangunan dan Pengembangan School Data Management System (SDMS) Terintegrasi"),
    ("Unit Kerja","SMK Negeri 1 Kras, Kabupaten Kediri"),
    ("Periode Pengerjaan","April – September 2026 (setiap hari Sabtu, 26 sesi)"),
    ("Total Anggaran","Rp 47.850.000,-"),
    ("Sumber Dana","Dana BOS / BOP / APBD Kabupaten Kediri"),
], fs=11)
pb()

# ══════════════════════════════════════════════════════
# BAB I — PENDAHULUAN
# ══════════════════════════════════════════════════════
center("BAB I — PENDAHULUAN", 14, True, BLUE); sep(); doc.add_paragraph()

h2("1.1 Latar Belakang")
body("SMK Negeri 1 Kras dengan lebih dari 1.200 siswa aktif, 67 tenaga pendidik, dan 12 aplikasi digital "
     "yang beroperasi secara mandiri, menghadapi tantangan serius dalam pengelolaan data terintegrasi. "
     "Setiap aplikasi memiliki database tersendiri, sehingga satu perubahan data siswa harus diperbarui "
     "secara manual di semua sistem — menyebabkan redundansi data, inkonsistensi, dan pemborosan waktu "
     "administrasi yang signifikan.")
body("SDMS (School Data Management System) hadir sebagai solusi: platform manajemen data terpusat yang "
     "menjadi sumber data tunggal (single source of truth) bagi seluruh ekosistem aplikasi digital sekolah. "
     "Dengan satu kali login, guru dan siswa dapat mengakses semua 12 aplikasi sekolah tanpa login "
     "ulang — dan setiap perubahan data tersinkronisasi otomatis ke semua sistem dalam hitungan detik.")

h2("1.2 Dasar Hukum")
for item in [
    ("Permendikbud No. 79 Tahun 2015"," tentang Data Pokok Pendidikan (Dapodik)"),
    ("Perpres No. 95 Tahun 2018"," tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)"),
    ("Permendikbudristek No. 9 Tahun 2022"," tentang Evaluasi Sistem Pendidikan"),
    ("PP No. 57 Tahun 2021"," tentang Standar Nasional Pendidikan"),
    ("Renstra Kemendikbudristek 2020–2024"," — transformasi digital satuan pendidikan"),
]:
    bullet(item[1], item[0])

h2("1.3 Dasar Akademis")
for item in [
    ("Laudon & Laudon (2020)","— integrasi SI meningkatkan efisiensi 40%, mengurangi kesalahan data 60%"),
    ("Heeks (2017)","— sistem informasi terpusat meningkatkan akuntabilitas dan transparansi"),
    ("Venkatesh et al. — TAM3 (2003)","— SI terintegrasi meningkatkan adopsi teknologi pendidik"),
    ("ISO/IEC 27001:2022","— standar keamanan informasi (RBAC, audit log)"),
    ("NIST SP 800-63 Rev.3","— panduan manajemen identitas digital (SSO multi-aplikasi)"),
    ("Human Capital Theory — Becker (1964)","— investasi kompetensi internal lebih efisien dari outsourcing"),
]:
    bullet(f" {item[1]}", item[0])
pb()

# ══════════════════════════════════════════════════════
# BAB II — KOMPETENSI PENGEMBANG
# ══════════════════════════════════════════════════════
center("BAB II — KOMPETENSI PENGEMBANG SISTEM", 14, True, BLUE); sep(); doc.add_paragraph()

body("SDMS dirancang, dibangun, dan dikelola oleh tenaga pendidik internal SMK Negeri 1 Kras yang "
     "memiliki sertifikasi kompetensi jaringan dan TIK bertaraf internasional, menjamin kualitas teknis "
     "dan keberlanjutan sistem tanpa ketergantungan pada pihak ketiga eksternal.")

h2("2.1 Sertifikasi Internasional")
tbl(["No","Sertifikasi","No. Sertifikat","Tanggal","Penerbit"],[
    ("1","MTCNA — MikroTik Certified Network Associate","2011NA6544","27 Nov 2020","Mikrotikls SIA, Latvia"),
    ("2","MTCRE — MikroTik Certified Routing Engineer", "2011RE6761","28 Nov 2020","Mikrotikls SIA, Latvia"),
], fs=10)
body("Keaslian kedua sertifikat dapat diverifikasi di mikrotik.com/certificates, memenuhi persyaratan "
     "kompetensi pengelola TIK sesuai Perpres No. 95 Tahun 2018 tentang SPBE.")

h2("2.2 Pemetaan Kompetensi Sertifikat terhadap SDMS")
tbl(["Kompetensi","Sertifikat","Implementasi dalam SDMS"],[
    ("Network fundamentals","MTCNA","Desain arsitektur jaringan multi-server Proxmox VE"),
    ("Firewall & keamanan","MTCNA","Proteksi akses server + UFW firewall setiap VM"),
    ("DNS & domain management","MTCNA","Konfigurasi domain *.smkn1kras.sch.id via Caddy"),
    ("QoS & bandwidth mgmt","MTCNA","Stabilitas akses SDMS saat peak hours"),
    ("Static routing & subnet","MTCRE","Routing antar subnet 10.10.102.x ↔ 10.10.103.x"),
    ("VPN & secure tunneling","MTCRE","Remote maintenance server yang aman"),
    ("Load balancing & failover","MTCRE","High availability 12 aplikasi terintegrasi"),
], fs=9)
pb()

# ══════════════════════════════════════════════════════
# BAB III — ANALISIS KEBUTUHAN
# ══════════════════════════════════════════════════════
center("BAB III — ANALISIS KEBUTUHAN DAN KONDISI SAAT INI", 14, True, BLUE); sep(); doc.add_paragraph()

h2("3.1 Analisis Kuantitatif Masalah")
tbl(["Parameter","Sebelum SDMS","Dampak"],[
    ("Jumlah siswa aktif","1.204 siswa","1.204 record dikelola manual di 12 sistem"),
    ("Jumlah guru","67 guru","67 × 12 = 804 akun terpisah"),
    ("Input data redundan","±15 jam/minggu","±720 jam/tahun terbuang"),
    ("Reset password/bulan","15–20 tiket","±200 tiket/tahun"),
    ("Waktu update 1 siswa","±45 menit","±90 jam/tahun untuk rotasi kelas"),
    ("Insiden data","1 kali Sept'26","Downtime 4–8 jam tanpa UPS"),
])

h2("3.2 Ekosistem 12 Aplikasi Terintegrasi SDMS")
tbl(["No","Aplikasi","Fungsi","SSO","URL"],[
    ("1","LMS Sekolah","Materi, tugas, ujian, nilai siswa","✔ SSO","lms.smkn1kras.sch.id"),
    ("2","Jurnal Guru","Jurnal mengajar harian guru","✔ SSO","jurnal.smkn1kras.sch.id"),
    ("3","Jurnal Piket","Kehadiran & kejadian harian siswa","✔ SSO","piket.smkn1kras.sch.id"),
    ("4","Absensi Siswa","Kehadiran berbasis wajah/QR","✔ SSO","absen.smkn1kras.sch.id"),
    ("5","Jurnal PKL","Monitoring praktik kerja lapangan","✔ SSO","pkl.smkn1kras.sch.id"),
    ("6","Sholat & Ibadah","Monitoring sholat berjamaah","✔ SSO","—"),
    ("7","Kegiatan Sekolah","Event & ekstrakurikuler","✔ SSO","—"),
    ("8","Supervisi","Monitoring kinerja mengajar guru","Redirect","supervisi.mritsmkn1kras.web.id"),
    ("9","Website SMK","Informasi & berita sekolah","Redirect","smkn1kras.sch.id"),
    ("10","Info Kelulusan","Pengumuman kelulusan siswa","Redirect","kelulusan.smkn1kras.sch.id"),
    ("11","Antrian","Sistem antrian digital sekolah","Redirect","antrian.smkn1kras.sch.id"),
    ("12","Jurnal MRIT","Jurnal Guru MRIT","✔ SSO","jurnal.mritsmkn1kras.web.id"),
], fs=8)
pb()

# ══════════════════════════════════════════════════════
# BAB IV — DESKRIPSI SISTEM
# ══════════════════════════════════════════════════════
center("BAB IV — DESKRIPSI SISTEM SDMS", 14, True, BLUE); sep(); doc.add_paragraph()

h2("4.1 Konsep Inti: Single Source of Truth + Single Sign-On")
for item in [
    ("Single Source of Truth (SSOT)","— satu record di SDMS otomatis tersedia di 12 aplikasi. Perubahan data langsung tersinkron dalam <5 detik via webhook HMAC-SHA256"),
    ("Single Sign-On (SSO)","— login satu kali di SDMS, klik aplikasi di Application Hub, langsung masuk tanpa login ulang. Token JWT dikirim ke aplikasi target secara transparan"),
]:
    bullet(item[1], item[0])

h2("4.2 Arsitektur Teknis")
tbl(["Komponen","Teknologi","Fungsi"],[
    ("Hypervisor","Proxmox VE 8.x","Virtualisasi semua layanan server sekolah"),
    ("Backend","Node.js + Express.js","API utama pengelola data master"),
    ("Database","MariaDB 10.11","Penyimpanan data master sekolah"),
    ("Frontend","Vue.js 3 + Tailwind CSS","Antarmuka web SDMS"),
    ("Reverse Proxy","Caddy Server","SSL otomatis + routing semua domain"),
    ("Autentikasi","JWT + RBAC","Keamanan akses berlapis per role"),
    ("Sinkronisasi","Webhook HMAC-SHA256","Push data real-time ke 12 aplikasi"),
    ("SSO","JWT Multi-App Token","Satu login untuk semua aplikasi"),
])

h2("4.3 Fitur yang Telah Dibangun")
tbl(["No","Fitur","Manfaat"],[
    ("1","Data Master Terintegrasi","Satu input data untuk 12 aplikasi"),
    ("2","Single Sign-On (SSO)","Login sekali akses 12 aplikasi"),
    ("3","Application Hub","Portal 12 aplikasi dari satu halaman"),
    ("4","Webhook Real-Time","Data konsisten di semua sistem"),
    ("5","RBAC Multi-Role","Hak akses berlapis per jabatan"),
    ("6","Lupa Password via Email","Reset password mandiri semua role"),
    ("7","Audit Log","Akuntabilitas & jejak digital"),
    ("8","Dashboard Analitik","Keputusan berbasis data real-time"),
    ("9","Backup Otomatis","Keamanan data dari bencana"),
    ("10","API Hub","Kontrol terpusat 12 koneksi aplikasi"),
    ("11","Impor/Ekspor Excel","Efisiensi pengelolaan data massal"),
    ("12","Kalender Akademik","Sinkronisasi agenda ke LMS"),
], fs=10)
pb()

# ══════════════════════════════════════════════════════
# BAB V — MANFAAT
# ══════════════════════════════════════════════════════
center("BAB V — ANALISIS MANFAAT DAN DAMPAK", 14, True, BLUE); sep(); doc.add_paragraph()

h2("5.1 Perbandingan Sebelum dan Sesudah SDMS")
tbl(["Indikator","Sebelum SDMS","Sesudah SDMS","Efisiensi"],[
    ("Waktu input data siswa baru","45 menit (12 sistem)","5 menit (1 sistem)","↓ 89%"),
    ("Waktu rekonsiliasi data","4–5 jam/bulan","15–20 menit","↓ 90%"),
    ("Jumlah akun (67 guru)","804 akun (12 sistem)","67 akun (1 sistem)","↓ 92%"),
    ("Tiket reset password/tahun","±200 tiket","<20 tiket","↓ 90%"),
    ("Konsistensi data antar sistem","<70%",">99%","↑ 41%"),
    ("Login yang dibutuhkan guru","12 login berbeda","1 login (SSO)","↓ 92%"),
    ("Risiko kehilangan data","Tinggi (tanpa UPS)","Sangat Rendah","↑ 95%"),
])

h2("5.2 Manfaat per Pemangku Kepentingan")
h3("Guru:"); bullet("Satu login → akses LMS, Jurnal, PKL, Absensi, Supervisi, Piket, Sholat, Kegiatan")
bullet("Data profil selalu terkini di semua platform tanpa update manual")
bullet("Lebih fokus mengajar — berkurangnya beban administrasi digital")
h3("Siswa:"); bullet("Satu akun untuk semua layanan (LMS, nilai, kehadiran, PKL, Info Kelulusan)")
bullet("Reset password mandiri via email — tidak perlu ke TU")
h3("Kepala Sekolah:"); bullet("Dashboard analitik real-time — kondisi sekolah terpantau kapan saja")
bullet("Audit log lengkap untuk akuntabilitas dan akreditasi")
h3("TU/Operator:"); bullet("Eliminasi double-entry — input satu kali, tersebar ke 12 sistem otomatis")
bullet("Berkurangnya permintaan reset password secara drastis")
pb()

# ══════════════════════════════════════════════════════
# BAB VI — ROADMAP PENGEMBANGAN (BARU - DETAIL)
# ══════════════════════════════════════════════════════
center("BAB VI — ROADMAP PENGEMBANGAN", 14, True, BLUE)
center("April – September 2026 (Setiap Hari Sabtu)", 12, False, DARK)
sep(); doc.add_paragraph()

body("Pengembangan SDMS dilaksanakan setiap hari Sabtu selama 6 bulan (April – September 2026), "
     "dengan total 26 sesi kerja efektif. Setiap sesi berlangsung selama 6–8 jam. Jadwal ini dipilih "
     "untuk memastikan pengembangan tidak mengganggu kegiatan belajar mengajar (KBM) yang berlangsung "
     "pada hari kerja Senin–Jumat.")

# FASE 1
h2("FASE 1 — Fondasi & Infrastruktur (April 2026)")
h3("Tujuan: Membangun pondasi sistem, infrastruktur server, dan database master", GREEN)
tbl(["Sesi","Tanggal","Kegiatan","Output/Deliverable"],[
    ("Sesi 1","Sabtu, 04 April 2026",
     "Kick-off & analisis kebutuhan\n• Review kebutuhan semua aplikasi\n• Desain arsitektur sistem\n• Setup Proxmox VE + VM SDMS",
     "Dokumen arsitektur sistem\nVM SDMS berjalan di Proxmox"),
    ("Sesi 2","Sabtu, 11 April 2026",
     "Setup backend & database\n• Install Node.js, MariaDB\n• Setup Sequelize ORM\n• Desain skema database master",
     "Backend berjalan di port 3000\nSkema database terdefinisi"),
    ("Sesi 3","Sabtu, 18 April 2026",
     "Modul autentikasi & RBAC\n• JWT login/logout\n• Role: superadmin, admin, guru, siswa\n• Middleware auth & permission",
     "Sistem login berfungsi\n8 role terdefinisi"),
    ("Sesi 4","Sabtu, 25 April 2026",
     "Setup frontend & routing\n• Vue.js 3 + Tailwind CSS\n• Vue Router + Pinia store\n• Layout dashboard + sidebar",
     "Frontend terhubung ke backend\nHalaman dashboard dasar"),
], fs=8)

# FASE 2
h2("FASE 2 — Data Master & Manajemen User (Mei 2026)")
h3("Tujuan: Membangun modul pengelolaan data master sekolah secara lengkap", GREEN)
tbl(["Sesi","Tanggal","Kegiatan","Output/Deliverable"],[
    ("Sesi 5","Sabtu, 02 Mei 2026",
     "Modul Data Siswa\n• CRUD siswa lengkap\n• Import Excel massal\n• Filter kelas, jurusan, status",
     "Kelola 1.204 siswa\nImport dari Excel berhasil"),
    ("Sesi 6","Sabtu, 09 Mei 2026",
     "Modul Data Guru & Pegawai\n• CRUD guru + mapel\n• CRUD pegawai\n• Export data ke Excel",
     "Kelola 67 guru\nData pegawai terkelola"),
    ("Sesi 7","Sabtu, 16 Mei 2026",
     "Modul Kelas, Jurusan, Mapel\n• CRUD kelas + tingkat\n• CRUD jurusan + kode\n• Kalender akademik",
     "Data akademik lengkap\nKalender terintegrasi"),
    ("Sesi 8","Sabtu, 23 Mei 2026",
     "Manajemen User & Password\n• Buat akun massal dari data siswa/guru\n• Reset password\n• Fitur lupa password via email",
     "1.204 akun siswa dibuat\nSistem reset password aktif"),
    ("Sesi 9","Sabtu, 30 Mei 2026",
     "Dashboard & Analitik\n• Statistik real-time\n• Chart siswa per jurusan/JK\n• Audit log aktivitas",
     "Dashboard analitik lengkap\nAudit log berjalan"),
], fs=8)

# FASE 3
h2("FASE 3 — Integrasi SSO & Sinkronisasi (Juni 2026)")
h3("Tujuan: Menghubungkan SDMS dengan semua aplikasi via SSO dan webhook real-time", GREEN)
tbl(["Sesi","Tanggal","Kegiatan","Output/Deliverable"],[
    ("Sesi 10","Sabtu, 06 Juni 2026",
     "Sistem SSO\n• JWT multi-app token\n• Gateway SSO endpoint\n• Callback handler per aplikasi",
     "SSO berfungsi ke LMS\nToken JWT 5 menit"),
    ("Sesi 11","Sabtu, 13 Juni 2026",
     "Integrasi LMS & Jurnal Guru\n• SSO callback LMS\n• Webhook siswa/guru ke LMS\n• Test sinkronisasi data",
     "Login SSO ke LMS berhasil\nData sinkron real-time"),
    ("Sesi 12","Sabtu, 20 Juni 2026",
     "Integrasi Absensi & Piket\n• SSO ke aplikasi absensi\n• Webhook data siswa ke absensi\n• Test sinkronisasi Piket",
     "SSO Absensi & Piket aktif\n1.204 siswa tersinkron"),
    ("Sesi 13","Sabtu, 27 Juni 2026",
     "Application Hub UI\n• Dashboard 12 kartu aplikasi\n• Status online/offline per app\n• Health check otomatis\n• Pengaturan visibilitas per role",
     "Application Hub tampil 12 app\nAdmin bisa atur visibilitas"),
], fs=8)

# FASE 4
h2("FASE 4 — Integrasi Lanjutan & PKL (Juli 2026)")
h3("Tujuan: Mengintegrasikan aplikasi PKL, Sholat, Kegiatan, dan aplikasi redirect", GREEN)
tbl(["Sesi","Tanggal","Kegiatan","Output/Deliverable"],[
    ("Sesi 14","Sabtu, 04 Juli 2026",
     "Integrasi Jurnal PKL\n• SSO callback ke PKL\n• Sinkronisasi data siswa ke PKL\n• Pull data guru/siswa dari SDMS",
     "SSO PKL aktif\nData siswa PKL tersinkron"),
    ("Sesi 15","Sabtu, 11 Juli 2026",
     "Integrasi Sholat & Kegiatan\n• SSO ke aplikasi Sholat\n• Webhook data ke Kegiatan\n• Test sinkronisasi",
     "8 dari 12 app terintegrasi"),
    ("Sesi 16","Sabtu, 18 Juli 2026",
     "Aplikasi Redirect (tanpa SSO)\n• Website SMK (smkn1kras.sch.id)\n• Info Kelulusan\n• Antrian Digital\n• Web Supervisi",
     "4 aplikasi redirect berfungsi\n12 app tampil di Hub"),
    ("Sesi 17","Sabtu, 25 Juli 2026",
     "API Hub & Webhook Engine\n• Dashboard manajemen koneksi\n• Test webhook HMAC-SHA256\n• Retry mechanism & log delivery",
     "API Hub aktif\nWebhook ke semua app berhasil"),
], fs=8)

# FASE 5
h2("FASE 5 — Keamanan, Backup & Optimasi (Agustus 2026)")
h3("Tujuan: Penguatan keamanan, sistem backup, dan optimasi performa", GREEN)
tbl(["Sesi","Tanggal","Kegiatan","Output/Deliverable"],[
    ("Sesi 18","Sabtu, 01 Agustus 2026",
     "Sistem Backup Otomatis\n• Backup terjadwal MariaDB\n• Upload ke Google Drive via Rclone\n• Test restore backup",
     "Backup otomatis harian\nRestore dalam <30 menit"),
    ("Sesi 19","Sabtu, 08 Agustus 2026",
     "Penguatan Keamanan\n• Rate limiting per endpoint\n• CORS & helmet security\n• SSL Caddy + firewall UFW",
     "Sistem aman sesuai OWASP\nSSL aktif semua domain"),
    ("Sesi 20","Sabtu, 15 Agustus 2026",
     "Optimasi Performa\n• Query optimization & indexing\n• Caching strategy\n• Load testing & profiling",
     "Response time <200ms\nMendukung 200+ user serentak"),
    ("Sesi 21","Sabtu, 22 Agustus 2026",
     "Infrastruktur Hardware\n• Instalasi SSD baru (pengganti disk rusak)\n• Upgrade RAM server\n• Instalasi & konfigurasi UPS",
     "Server stabil & handal\nUPS melindungi dari mati listrik"),
    ("Sesi 22","Sabtu, 29 Agustus 2026",
     "Migrasi Data & User Acceptance Test\n• Import data historis siswa/guru\n• UAT bersama operator TU\n• Perbaikan bug dari UAT",
     "Data historis termigasi\nBug UAT terselesaikan"),
], fs=8)

# FASE 6
h2("FASE 6 — Finalisasi, Pelatihan & Launching (September 2026)")
h3("Tujuan: Peluncuran sistem, pelatihan pengguna, dan dokumentasi lengkap", GREEN)
tbl(["Sesi","Tanggal","Kegiatan","Output/Deliverable"],[
    ("Sesi 23","Sabtu, 05 September 2026",
     "Pelatihan Operator & Admin\n• Workshop penggunaan SDMS (admin TU)\n• Modul: kelola siswa, guru, user\n• Modul: backup & restore",
     "Operator TU mahir SDMS\nModul pelatihan terdokumentasi"),
    ("Sesi 24","Sabtu, 12 September 2026",
     "Pelatihan Guru & Kepala Sekolah\n• Demo SSO ke semua aplikasi\n• Panduan Application Hub\n• Dashboard analitik untuk pimpinan",
     "67 guru paham SSO\nKepsek bisa pantau dashboard"),
    ("Sesi 25","Sabtu, 19 September 2026",
     "Dokumentasi & SOP\n• Buku panduan pengguna\n• Video tutorial per modul\n• SOP backup & kedaruratan\n• Finalisasi semua koneksi API",
     "Dokumentasi lengkap\nSOP tertulis"),
    ("Sesi 26","Sabtu, 26 September 2026",
     "Go-Live & Evaluasi Akhir\n• Soft launching SDMS ke semua pengguna\n• Monitoring 24 jam pasca live\n• Evaluasi & laporan akhir proyek",
     "SDMS live production\nLaporan akhir proyek selesai"),
], fs=8)
pb()

# ══════════════════════════════════════════════════════
# BAB VII — RINGKASAN ROADMAP
# ══════════════════════════════════════════════════════
center("BAB VII — RINGKASAN ROADMAP", 14, True, BLUE); sep(); doc.add_paragraph()

h2("7.1 Ringkasan 6 Fase Pengembangan")
tbl(["Fase","Bulan","Sesi","Fokus Utama","Target Akhir Fase"],[
    ("Fase 1","April 2026","4 sesi","Infrastruktur & Fondasi","Server, backend, auth, frontend dasar"),
    ("Fase 2","Mei 2026","5 sesi","Data Master & User","1.204 siswa, 67 guru terkelola"),
    ("Fase 3","Juni 2026","4 sesi","SSO & Sinkronisasi","Login 1x untuk 12 aplikasi"),
    ("Fase 4","Juli 2026","4 sesi","Integrasi PKL & Redirect","12 aplikasi terhubung penuh"),
    ("Fase 5","Agustus 2026","5 sesi","Keamanan, Backup & Optimasi","Sistem handal & aman"),
    ("Fase 6","September 2026","4 sesi","Pelatihan & Launching","Go-live + dokumentasi lengkap"),
    ("TOTAL","6 Bulan","26 Sesi","—","SDMS Production Ready"),
], fs=10)

h2("7.2 Milestone Utama")
tbl(["Milestone","Target Tanggal","Indikator Keberhasilan"],[
    ("Backend & Database siap","25 April 2026","API berjalan, schema DB terdefinisi"),
    ("Data Master lengkap","30 Mei 2026","1.204 siswa & 67 guru terdaftar"),
    ("SSO aktif ke 4 aplikasi","13 Juni 2026","Login 1x berhasil ke LMS, Jurnal, Absen, Piket"),
    ("12 aplikasi terintegrasi","25 Juli 2026","Semua app tampil di Application Hub"),
    ("Sistem production-ready","22 Agustus 2026","Backup, keamanan, optimasi selesai"),
    ("Go-Live & Pelatihan","26 September 2026","Semua guru & operator terlatih"),
], fs=10)

h2("7.3 Distribusi Jam Kerja per Fase")
tbl(["Fase","Sesi","Estimasi Jam/Sesi","Total Jam","Bobot"],[
    ("Fase 1 — Infrastruktur","4 sesi","7 jam","28 jam","11%"),
    ("Fase 2 — Data Master","5 sesi","7 jam","35 jam","13%"),
    ("Fase 3 — SSO & Sync","4 sesi","8 jam","32 jam","12%"),
    ("Fase 4 — Integrasi","4 sesi","8 jam","32 jam","12%"),
    ("Fase 5 — Keamanan","5 sesi","7 jam","35 jam","13%"),
    ("Fase 6 — Launching","4 sesi","6 jam","24 jam","9%"),
    ("Buffer & perbaikan bug","—","—","48 jam","19%"),
    ("TOTAL","26 sesi","±7 jam/sesi","±234 jam","100%"),
], fs=10)
pb()

# ══════════════════════════════════════════════════════
# BAB VIII — RAB
# ══════════════════════════════════════════════════════
center("BAB VIII — RENCANA ANGGARAN BIAYA (RAB)", 14, True, BLUE); sep(); doc.add_paragraph()

hdrh = ["No","Item","Spesifikasi","Qty","Harga Satuan","Total"]

h2("8.1 Pengadaan Hardware (Prioritas Utama)")
tbl(hdrh,[
    ("1","SSD NVMe M.2","1TB, Read >3500 MB/s (pengganti disk rusak)","2","Rp    950.000","Rp  1.900.000"),
    ("2","SSD SATA 2TB","Samsung 870 EVO (storage VM/CT)","2","Rp  1.850.000","Rp  3.700.000"),
    ("3","RAM Server DDR4","32GB ECC (upgrade stabilitas VM)","2","Rp  1.200.000","Rp  2.400.000"),
    ("4","UPS","APC BX1100L-MS 1100VA/660W","1","Rp  2.500.000","Rp  2.500.000"),
    ("5","Switch Managed","TP-Link TL-SG108E 8-Port","1","Rp    750.000","Rp    750.000"),
    ("6","Kabel UTP Cat6","1 Roll 305m + konektor RJ45","1","Rp    450.000","Rp    450.000"),
    ("","","","","SUBTOTAL HARDWARE","Rp 11.700.000"),
], fs=9)

h2("8.2 Software & Layanan Digital")
tbl(hdrh,[
    ("1","Domain .sch.id","Perpanjangan 2 tahun","1","Rp    500.000","Rp    500.000"),
    ("2","SSL Wildcard","Let's Encrypt via Caddy (gratis)","—","Rp          0","Rp          0"),
    ("3","Email SMTP Sekolah","Google Workspace Edu / Zoho","1 thn","Rp    850.000","Rp    850.000"),
    ("4","Cloud Backup Storage","Google Drive API via Rclone","1 thn","Rp    300.000","Rp    300.000"),
    ("","","","","SUBTOTAL SOFTWARE","Rp  1.650.000"),
], fs=9)

h2("8.3 Pengembangan & Implementasi")
tbl(hdrh,[
    ("1","Honorarium Pengembang","26 sesi × Sabtu × 6 bulan","26 sesi","Rp    400.000/sesi","Rp 10.400.000"),
    ("2","Integrasi 12 Aplikasi","Testing, debugging, dokumentasi API","1 pkt","Rp   1.500.000","Rp  1.500.000"),
    ("3","Migrasi Data Historis","Import dari sistem lama ke SDMS","1 kali","Rp     850.000","Rp    850.000"),
    ("4","Dokumentasi & SOP","Buku panduan + video tutorial","1 pkt","Rp     750.000","Rp    750.000"),
    ("5","Pelatihan Operator & Guru","Workshop 2 hari (Sesi 23–24)","1 kali","Rp     750.000","Rp    750.000"),
    ("","","","","SUBTOTAL PENGEMBANGAN","Rp 14.250.000"),
], fs=9)

h2("8.4 Pemeliharaan & Operasional (1 Tahun Pasca-Launch)")
tbl(hdrh,[
    ("1","Pemeliharaan Sistem","Update, patch, monitoring bulanan","12 bln","Rp   750.000/bln","Rp  9.000.000"),
    ("2","Biaya Listrik Server","200W × 24jam × 365 hari","1 thn","Rp 3.500.000","Rp  3.500.000"),
    ("3","Rapat Evaluasi Triwulan","Konsumsi × 4 kali","4 kali","Rp   187.500","Rp    750.000"),
    ("","","","","SUBTOTAL OPERASIONAL","Rp 13.250.000"),
], fs=9)

h2("8.5 Rekapitulasi Anggaran")
tbl(["No","Komponen Anggaran","Jumlah"],[
    ("1","Pengadaan Hardware","Rp 11.700.000"),
    ("2","Software & Layanan Digital","Rp  1.650.000"),
    ("3","Pengembangan & Implementasi","Rp 14.250.000"),
    ("4","Pemeliharaan & Operasional","Rp 13.250.000"),
    ("","TOTAL","Rp 40.850.000"),
    ("","Cadangan / Tak Terduga (17%)","Rp  7.000.000"),
    ("","TOTAL KESELURUHAN","Rp 47.850.000"),
], fs=12)
pb()

# ══════════════════════════════════════════════════════
# BAB IX — INDIKATOR KEBERHASILAN
# ══════════════════════════════════════════════════════
center("BAB IX — INDIKATOR KEBERHASILAN", 14, True, BLUE); sep(); doc.add_paragraph()

tbl(["Indikator Kinerja","Target","Metode Pengukuran"],[
    ("Uptime sistem SDMS","≥ 99,5%","Monitoring server otomatis"),
    ("Konsistensi data antar 12 aplikasi","> 99%","Audit log rekonsiliasi data"),
    ("Waktu sinkronisasi data","< 5 detik","Log webhook timestamp"),
    ("Pengurangan tiket reset password","≥ 90%","Data helpdesk per bulan"),
    ("Kepuasan pengguna (guru & TU)","≥ 85%","Survei kepuasan per semester"),
    ("Aplikasi terintegrasi aktif","12 aplikasi","Laporan API Hub SDMS"),
    ("Pengurangan waktu rekonsiliasi","≥ 90%","Perbandingan log waktu kerja"),
    ("Recovery data dari backup","< 30 menit","Simulasi disaster recovery"),
    ("Guru yang paham SSO","100% dari 67 guru","Presensi & evaluasi pelatihan"),
    ("Penyelesaian sesuai jadwal","26 sesi dalam 6 bulan","Laporan kemajuan mingguan"),
])
pb()

# ══════════════════════════════════════════════════════
# BAB X — PENUTUP
# ══════════════════════════════════════════════════════
center("BAB X — PENUTUP", 14, True, BLUE); sep(); doc.add_paragraph()

body("Roadmap pengembangan SDMS yang terstruktur dalam 26 sesi Sabtu selama 6 bulan (April–September 2026) "
     "dirancang untuk memastikan pembangunan sistem berjalan sistematis, terukur, dan tidak mengganggu "
     "kegiatan belajar mengajar. Setiap fase memiliki deliverable yang jelas dan terverifikasi sebelum "
     "melanjutkan ke fase berikutnya.")
body("Keunggulan utama: sistem ini dikembangkan oleh tenaga pendidik internal bersertifikat internasional "
     "(MTCNA No. 2011NA6544 & MTCRE No. 2011RE6761), dengan total investasi Rp 47.850.000 untuk 6 bulan "
     "pengembangan dan 1 tahun operasional penuh — jauh lebih efisien dibanding outsourcing ke pihak "
     "ketiga yang dapat mencapai 5–10 kali lipat.")
body("Manfaat terukur: efisiensi administrasi meningkat hingga 90%, 804 akun terpisah dipangkas menjadi "
     "67 akun terpusat, dan seluruh 1.204 siswa serta 67 guru dapat mengakses 12 aplikasi digital "
     "sekolah hanya dengan satu kali login.")
body("Kami memohon dukungan dan persetujuan atas proposal ini demi mewujudkan SMK Negeri 1 Kras sebagai "
     "sekolah kejuruan berbasis data (data-driven vocational school) yang modern, terintegrasi, dan "
     "berdaya saing tinggi di era digital.")

doc.add_paragraph()
body("Kras, September 2026", align=WD_ALIGN_PARAGRAPH.RIGHT, indent=False)
doc.add_paragraph()

t = doc.add_table(rows=6, cols=2)
td = [
    ("Mengetahui,","Dibuat oleh,"),
    ("Kepala SMK Negeri 1 Kras","Koordinator TIK / Pengembang Sistem"),
    ("","MTCNA No. 2011NA6544 | MTCRE No. 2011RE6761"),
    ("",""),
    ("_______________________________","_______________________________"),
    ("NIP. ","NIP. "),
]
for ri,(a,b) in enumerate(td):
    t.rows[ri].cells[0].text = a
    t.rows[ri].cells[1].text = b
    for ci in range(2):
        for para in t.rows[ri].cells[ci].paragraphs:
            for run in para.runs:
                run.font.size = Pt(11)
                if ri in [0,1,4,5]: run.bold = True
                if ri == 2 and ci == 1:
                    run.italic = True; run.font.size = Pt(9)
                    run.font.color.rgb = BLUE

out = r"d:\WEBSITE\sdms\docs\Proposal-SDMS-SMKN1Kras-LENGKAP.docx"
doc.save(out)
print(f"Berhasil: {out}")
