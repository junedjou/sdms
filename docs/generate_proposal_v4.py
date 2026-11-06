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

def pb(): doc.add_page_break()

def center(text, size=14, bold=True, color=BLUE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.bold = bold; run.font.size = Pt(size); run.font.color.rgb = color
    return p

def h2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True; run.font.size = Pt(13); run.font.color.rgb = BLUE
    p.paragraph_format.space_before = Pt(10); p.paragraph_format.space_after = Pt(3)

def h3(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True; run.font.size = Pt(12); run.font.color.rgb = DARK

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
center("Tahun Anggaran 2026/2027", 12, True, DARK)
doc.add_paragraph(); doc.add_paragraph()

sep()
h2("LEMBAR PENGESAHAN")
tbl(["Keterangan","Isi"],[
    ("Nama Kegiatan","Pembangunan dan Pengembangan School Data Management System (SDMS) Terintegrasi"),
    ("Unit Kerja","SMK Negeri 1 Kras, Kabupaten Kediri"),
    ("Total Anggaran","Rp 47.850.000,-"),
    ("Sumber Dana","Dana BOS / BOP / APBD Kabupaten Kediri"),
    ("Tahun Anggaran","2026/2027"),
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
     "Dengan satu kali login, guru dan siswa dapat mengakses semua aplikasi sekolah tanpa perlu login "
     "ulang — dan setiap perubahan data otomatis tersinkronisasi ke semua sistem dalam hitungan detik.")

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
    ("Laudon & Laudon (2020)","— integrasi SI meningkatkan efisiensi operasional 40%, mengurangi kesalahan data 60%"),
    ("Heeks (2017)","— sistem informasi terpusat meningkatkan akuntabilitas dan transparansi data publik"),
    ("Venkatesh et al. — TAM3 (2003)","— SI terintegrasi meningkatkan adopsi teknologi di kalangan pendidik"),
    ("ISO/IEC 27001:2022","— standar keamanan informasi (RBAC, audit log)"),
    ("NIST SP 800-63 Rev.3","— panduan manajemen identitas digital (SSO multi-aplikasi)"),
    ("Human Capital Theory — Becker (1964)","— investasi kompetensi internal menghasilkan nilai lebih tinggi dari outsourcing"),
]:
    bullet(f" {item[1]}", item[0])
pb()

# ══════════════════════════════════════════════════════
# BAB II — KOMPETENSI PENGEMBANG
# ══════════════════════════════════════════════════════
center("BAB II — KOMPETENSI PENGEMBANG SISTEM", 14, True, BLUE); sep(); doc.add_paragraph()

body("SDMS SMK Negeri 1 Kras dirancang, dibangun, dan dikelola oleh tenaga pendidik internal "
     "yang memiliki sertifikasi kompetensi jaringan dan teknologi informasi bertaraf internasional, "
     "sehingga menjamin kualitas teknis dan keberlanjutan sistem tanpa ketergantungan pada pihak ketiga.")

h2("2.1 Sertifikasi Internasional")
tbl(["No","Sertifikasi","No. Sertifikat","Tanggal","Penerbit"],[
    ("1","MTCNA — MikroTik Certified Network Associate","2011NA6544","27 Nov 2020","Mikrotikls SIA, Latvia"),
    ("2","MTCRE — MikroTik Certified Routing Engineer", "2011RE6761","28 Nov 2020","Mikrotikls SIA, Latvia"),
], fs=10)
body("Keaslian kedua sertifikat dapat diverifikasi secara independen di mikrotik.com/certificates, "
     "memenuhi prinsip verifiability dalam standar akreditasi kompetensi internasional dan "
     "persyaratan kompetensi pengelola TIK sesuai Perpres No. 95 Tahun 2018 tentang SPBE.")

h2("2.2 Pemetaan Kompetensi terhadap Implementasi SDMS")
tbl(["Kompetensi","Sertifikat","Implementasi Nyata dalam SDMS"],[
    ("Network fundamentals & OSI model","MTCNA","Desain arsitektur jaringan multi-server Proxmox VE"),
    ("Firewall & packet filtering","MTCNA","Proteksi akses server SDMS + UFW firewall setiap VM"),
    ("DHCP server & DNS management","MTCNA","Konfigurasi domain *.smkn1kras.sch.id via Caddy"),
    ("Quality of Service (QoS)","MTCNA","Bandwidth management saat peak hours penggunaan"),
    ("Static routing & subnetting","MTCRE","Routing antar subnet 10.10.102.x ↔ 10.10.103.x"),
    ("VPN & secure tunneling","MTCRE","Remote maintenance server tanpa ekspos port publik"),
    ("Load balancing & failover","MTCRE","High availability layanan SDMS dan 12 aplikasi"),
    ("Routing policy & traffic eng.","MTCRE","Optimasi traffic antar semua aplikasi terintegrasi"),
], fs=9)
pb()

# ══════════════════════════════════════════════════════
# BAB III — ANALISIS KEBUTUHAN
# ══════════════════════════════════════════════════════
center("BAB III — ANALISIS KEBUTUHAN DAN KONDISI SAAT INI", 14, True, BLUE); sep(); doc.add_paragraph()

h2("3.1 Analisis Kuantitatif Masalah")
tbl(["Parameter","Data Aktual","Dampak Tanpa SDMS"],[
    ("Jumlah siswa aktif","1.204 siswa","1.204 record harus dikelola manual di 12 sistem"),
    ("Jumlah guru","67 guru","67 × 12 = 804 akun terpisah yang harus dikelola"),
    ("Jumlah aplikasi","12 aplikasi","12 database tidak sinkron = inkonsistensi tinggi"),
    ("Input data redundan","±15 jam/minggu","±720 jam/tahun terbuang untuk rekonsiliasi"),
    ("Tiket reset password/bulan","15–20 tiket","±200 tiket/tahun = beban admin tidak produktif"),
    ("Waktu update data 1 siswa","±45 menit","±90 jam/tahun hanya untuk rotasi kelas"),
    ("Insiden kehilangan data","1 kali (Sept'26)","Potensi downtime 4–8 jam tanpa infrastruktur handal"),
])

h2("3.2 Ekosistem 12 Aplikasi Terintegrasi SDMS")
body("SDMS menjadi pusat (hub) ekosistem digital sekolah. Seluruh aplikasi berikut terhubung dan "
     "mendapatkan data master secara otomatis. Guru dan siswa cukup login satu kali untuk mengakses "
     "semua aplikasi:")
tbl(["No","Aplikasi","Fungsi","Data dari SDMS","SSO","URL"],
[
    ("1","LMS Sekolah","Materi, tugas, ujian, nilai","Siswa, Guru, Kelas, Mapel","✔ Aktif","lms.smkn1kras.sch.id"),
    ("2","Jurnal Guru","Jurnal mengajar harian guru","Guru, Kelas, Mapel","✔ Aktif","jurnal.smkn1kras.sch.id"),
    ("3","Jurnal Piket","Kehadiran & kejadian siswa","Siswa, Guru, Kelas","✔ Aktif","piket.smkn1kras.sch.id"),
    ("4","Absensi Siswa","Kehadiran berbasis wajah/QR","Siswa, Kelas, Jurusan","✔ Aktif","absen.smkn1kras.sch.id"),
    ("5","Jurnal PKL","Monitoring praktik kerja lapangan","Siswa, Guru, Kelas","✔ Aktif","pkl.smkn1kras.sch.id"),
    ("6","Sholat & Ibadah","Monitoring sholat berjamaah","Siswa, Kelas","✔ Aktif","—"),
    ("7","Kegiatan Sekolah","Event, ekstrakurikuler","Guru, Siswa","✔ Aktif","—"),
    ("8","Supervisi","Supervisi kinerja guru","Guru, Jadwal","Redirect","supervisi.mritsmkn1kras.web.id"),
    ("9","Website SMK","Info & berita sekolah","—","Redirect","smkn1kras.sch.id"),
    ("10","Info Kelulusan","Pengumuman kelulusan","Siswa","Redirect","kelulusan.smkn1kras.sch.id"),
    ("11","Antrian","Sistem antrian digital","—","Redirect","antrian.smkn1kras.sch.id"),
    ("12","Jurnal MRIT","Jurnal Guru MRIT","Guru, Mapel","✔ Aktif","jurnal.mritsmkn1kras.web.id"),
], fs=8)
pb()

# ══════════════════════════════════════════════════════
# BAB IV — DESKRIPSI SISTEM
# ══════════════════════════════════════════════════════
center("BAB IV — DESKRIPSI SISTEM SDMS", 14, True, BLUE); sep(); doc.add_paragraph()

h2("4.1 Konsep Single Source of Truth + Single Sign-On")
body("SDMS mengimplementasikan dua konsep fundamental:")
for item in [
    ("Single Source of Truth (SSOT)","— satu record data di SDMS otomatis tersedia di semua 12 aplikasi. Satu perubahan data → langsung tersinkronisasi dalam < 5 detik via webhook HMAC-SHA256"),
    ("Single Sign-On (SSO)","— guru dan siswa login SATU KALI di SDMS, lalu klik aplikasi manapun di Application Hub tanpa perlu login ulang. Token JWT short-lived (5 menit) dikirim ke aplikasi target secara transparan"),
]:
    bullet(item[1], item[0])

h2("4.2 Arsitektur Teknis (Proxmox VE)")
body("Server sekolah menggunakan Proxmox Virtual Environment — platform virtualisasi enterprise open-source "
     "yang memungkinkan satu server fisik menjalankan multiple virtual machine (VM) secara terisolasi:")
tbl(["Komponen","Teknologi","Fungsi"],[
    ("Hypervisor","Proxmox VE 8.x","Virtualisasi semua layanan server sekolah"),
    ("Backend","Node.js + Express.js","API utama pengelola data master"),
    ("Database","MariaDB 10.11","Penyimpanan data master sekolah"),
    ("Frontend","Vue.js 3 + Tailwind CSS","Antarmuka web SDMS"),
    ("Reverse Proxy","Caddy Server","SSL otomatis + routing semua domain"),
    ("Autentikasi","JWT + RBAC","Keamanan akses berlapis per role"),
    ("Sinkronisasi","Webhook HMAC-SHA256","Push data real-time ke 12 aplikasi"),
    ("SSO","JWT Multi-App Token","Satu login untuk semua aplikasi"),
    ("Monitoring","PM2 + Audit Log","Uptime & jejak perubahan data"),
])

h2("4.3 Fitur Sistem yang Telah Dibangun")
tbl(["No","Fitur","Deskripsi","Manfaat"],[
    ("1","Data Master Terintegrasi","Kelola siswa, guru, kelas, jurusan, mapel, pegawai","Satu input untuk 12 aplikasi"),
    ("2","Single Sign-On (SSO)","Login sekali untuk 12 aplikasi sekolah","Hemat waktu, keamanan terpusat"),
    ("3","Application Hub","Dashboard portal 12 aplikasi sekolah","Akses mudah dari satu halaman"),
    ("4","Webhook Real-Time","Sinkronisasi data otomatis ke semua app","Data selalu konsisten & terkini"),
    ("5","RBAC Multi-Role","Hak akses berbeda: superadmin, admin, guru, siswa","Keamanan berlapis"),
    ("6","Lupa Password via Email","Reset password mandiri untuk semua role","Kurangi beban admin TU"),
    ("7","Audit Log","Rekam seluruh aktivitas perubahan data","Akuntabilitas & jejak digital"),
    ("8","Dashboard Analitik","Statistik real-time siswa, guru, kelas","Keputusan berbasis data"),
    ("9","Backup Otomatis","Backup terjadwal ke storage & cloud","Keamanan data dari bencana"),
    ("10","API Hub","Manajemen integrasi antar 12 aplikasi","Kontrol terpusat semua koneksi"),
    ("11","Impor/Ekspor Excel","Input massal & export laporan","Efisiensi pengelolaan data"),
    ("12","Kalender Akademik","Agenda & kegiatan sekolah","Sinkronisasi jadwal ke LMS"),
], fs=9)
pb()

# ══════════════════════════════════════════════════════
# BAB V — MANFAAT
# ══════════════════════════════════════════════════════
center("BAB V — ANALISIS MANFAAT DAN DAMPAK", 14, True, BLUE); sep(); doc.add_paragraph()

h2("5.1 Perbandingan Sebelum dan Sesudah SDMS")
tbl(["Indikator","Sebelum SDMS","Sesudah SDMS","Efisiensi"],[
    ("Waktu input data siswa baru","45 menit (12 sistem)","5 menit (1 sistem)","↓ 89%"),
    ("Waktu rekonsiliasi data bulanan","4–5 jam","15–20 menit","↓ 90%"),
    ("Jumlah akun yang dikelola (67 guru)","804 akun (12 sistem)","67 akun (1 sistem)","↓ 92%"),
    ("Tiket reset password per tahun","±200 tiket","<20 tiket","↓ 90%"),
    ("Konsistensi data antar sistem","<70%",">99%","↑ 41%"),
    ("Waktu update pasca kenaikan kelas","±90 jam","±5 jam","↓ 94%"),
    ("Risiko kehilangan data","Tinggi (tanpa UPS)","Sangat Rendah","↑ 95%"),
    ("Jumlah login yang dibutuhkan guru","12 login berbeda","1 login (SSO)","↓ 92%"),
])

h2("5.2 Manfaat per Pemangku Kepentingan")
h3("a. Guru")
for item in [
    "Satu login → akses LMS, Jurnal Mengajar, PKL, Absensi, Supervisi, Piket, Sholat, dan Kegiatan",
    "Data profil selalu terkini di semua platform tanpa update manual",
    "Lebih banyak waktu untuk mengajar — berkurangnya beban administrasi digital",
]:
    bullet(item)

h3("b. Siswa")
for item in [
    "Satu akun untuk semua layanan (LMS, nilai, kehadiran, PKL, Info Kelulusan)",
    "Reset password mandiri via email tanpa harus ke TU",
    "Data akademik real-time dapat dipantau kapan saja",
]:
    bullet(item)

h3("c. Kepala Sekolah / Manajemen")
for item in [
    "Dashboard analitik real-time — kondisi sekolah terpantau kapan saja dan di mana saja",
    "Audit log lengkap untuk akuntabilitas dan persiapan akreditasi",
    "Pengambilan keputusan berbasis data (data-driven decision making)",
    "Web Supervisi terintegrasi — monitoring kinerja guru lebih terstruktur",
]:
    bullet(item)

h3("d. Tenaga Kependidikan (TU/Operator)")
for item in [
    "Eliminasi double-entry — input satu kali, tersebar ke 12 sistem otomatis",
    "Berkurangnya permintaan reset password dari guru dan siswa secara drastis",
    "Import data massal dari Excel untuk efisiensi input data awal",
]:
    bullet(item)

h2("5.3 Analisis Risiko")
tbl(["Risiko","Tingkat","Mitigasi dengan SDMS"],[
    ("Kehilangan data akibat kerusakan hardware","Tinggi","Backup otomatis harian + UPS + RAID storage"),
    ("Inkonsistensi data antar 12 aplikasi","Tinggi","Webhook real-time + single source of truth"),
    ("Akses tidak sah ke data sensitif","Sedang","RBAC + JWT + audit log + HTTPS"),
    ("Downtime sistem saat jam sibuk","Sedang","Proxmox VM snapshot + hot standby"),
    ("Ketergantungan pada vendor","Rendah","Open-source stack (Node.js, MariaDB, Vue.js)"),
])
pb()

# ══════════════════════════════════════════════════════
# BAB VI — INFRASTRUKTUR
# ══════════════════════════════════════════════════════
center("BAB VI — KONDISI INFRASTRUKTUR DAN INSIDEN", 14, True, BLUE); sep(); doc.add_paragraph()

h2("6.1 Kondisi Server Saat Ini")
tbl(["Komponen","Kondisi","Keterangan"],[
    ("Processor","Intel Core i5 (lama)","Tidak mendukung virtualisasi optimal"),
    ("RAM","28 GB","Kurang untuk menjalankan banyak VM sekaligus"),
    ("Storage","2 disk (1 rusak)","⚠️ KRITIS — disk 476GB tidak terdeteksi"),
    ("OS","Proxmox VE","✅ Sudah terinstall"),
    ("UPS","Tidak ada","Rentan mati listrik mendadak"),
    ("Backup","Manual","Tidak ada backup otomatis"),
])

h2("6.2 Insiden Kritis September 2026")
body("Pada September 2026 terjadi insiden kritis: disk kedua server Proxmox (476GB) mengalami kegagalan "
     "fisik akibat I/O Error. MariaDB tidak dapat berjalan dan seluruh layanan SDMS terganggu. "
     "Data berhasil diselamatkan melalui prosedur darurat menggunakan RAM sebagai media sementara "
     "(prosedur memakan waktu ±4 jam). Insiden ini membuktikan bahwa penguatan infrastruktur hardware "
     "— terutama penggantian disk dan pemasangan UPS — adalah prioritas utama yang tidak dapat ditunda.", italic=True)
pb()

# ══════════════════════════════════════════════════════
# BAB VII — RAB
# ══════════════════════════════════════════════════════
center("BAB VII — RENCANA ANGGARAN BIAYA (RAB)", 14, True, BLUE); sep(); doc.add_paragraph()

hdrh = ["No","Item","Spesifikasi","Qty","Harga Satuan","Total"]

h2("7.1 Pengadaan Hardware (Prioritas Utama)")
tbl(hdrh,[
    ("1","SSD NVMe M.2","1TB, Read >3500 MB/s (pengganti disk rusak)","2","Rp    950.000","Rp  1.900.000"),
    ("2","SSD SATA 2TB","Samsung 870 EVO (storage VM/CT)","2","Rp  1.850.000","Rp  3.700.000"),
    ("3","RAM Server DDR4","32GB ECC (upgrade stabilitas VM)","2","Rp  1.200.000","Rp  2.400.000"),
    ("4","UPS","APC BX1100L-MS 1100VA/660W","1","Rp  2.500.000","Rp  2.500.000"),
    ("5","Switch Managed","TP-Link TL-SG108E 8-Port","1","Rp    750.000","Rp    750.000"),
    ("6","Kabel UTP Cat6","1 Roll 305m + konektor RJ45","1","Rp    450.000","Rp    450.000"),
    ("","","","","SUBTOTAL HARDWARE","Rp 11.700.000"),
], fs=9)

h2("7.2 Software & Layanan Digital")
tbl(hdrh,[
    ("1","Domain .sch.id","Perpanjangan 2 tahun","1","Rp    500.000","Rp    500.000"),
    ("2","SSL Wildcard","Let's Encrypt via Caddy (gratis)","—","Rp          0","Rp          0"),
    ("3","Email SMTP Sekolah","Google Workspace Edu / Zoho","1 thn","Rp    850.000","Rp    850.000"),
    ("4","Cloud Backup","Google Drive API via Rclone","1 thn","Rp    300.000","Rp    300.000"),
    ("","","","","SUBTOTAL SOFTWARE","Rp  1.650.000"),
], fs=9)

h2("7.3 Pengembangan & Implementasi")
tbl(hdrh,[
    ("1","Pengembangan Modul Lanjutan","Rapor digital, SPP, inventaris","3 bln","Rp 3.500.000/bln","Rp 10.500.000"),
    ("2","Integrasi Web Supervisi","SSO + sinkronisasi ke SDMS","1 pkt","Rp   1.500.000","Rp  1.500.000"),
    ("3","Migrasi Data Historis","Import dari sistem lama ke SDMS","1 kali","Rp   2.000.000","Rp  2.000.000"),
    ("4","Pelatihan Operator & Guru","Workshop 2 hari + modul pelatihan","1 kali","Rp   1.500.000","Rp  1.500.000"),
    ("5","Dokumentasi & SOP","Buku panduan + video tutorial","1 pkt","Rp     750.000","Rp    750.000"),
    ("","","","","SUBTOTAL PENGEMBANGAN","Rp 16.250.000"),
], fs=9)

h2("7.4 Pemeliharaan & Operasional (1 Tahun)")
tbl(hdrh,[
    ("1","Pemeliharaan Sistem","Update, patch keamanan, monitoring","12 bln","Rp 1.000.000/bln","Rp 12.000.000"),
    ("2","Biaya Listrik Server","200W × 24jam × 365 hari","1 thn","Rp   3.500.000","Rp  3.500.000"),
    ("3","Rapat Evaluasi Triwulan","Konsumsi × 4 kali","4 kali","Rp     187.500","Rp    750.000"),
    ("","","","","SUBTOTAL OPERASIONAL","Rp 16.250.000"),
], fs=9)

h2("7.5 Rekapitulasi Anggaran")
tbl(["No","Komponen Anggaran","Jumlah"],[
    ("1","Pengadaan Hardware (Prioritas Utama)","Rp 11.700.000"),
    ("2","Software & Layanan Digital","Rp  1.650.000"),
    ("3","Pengembangan & Implementasi","Rp 16.250.000"),
    ("4","Pemeliharaan & Operasional (1 tahun)","Rp 16.250.000"),
    ("","TOTAL","Rp 45.850.000"),
    ("","Cadangan / Tak Terduga (4,4%)","Rp  2.000.000"),
    ("","TOTAL KESELURUHAN","Rp 47.850.000"),
], fs=12)
pb()

# ══════════════════════════════════════════════════════
# BAB VIII — TIMELINE & INDIKATOR
# ══════════════════════════════════════════════════════
center("BAB VIII — TIMELINE DAN INDIKATOR KEBERHASILAN", 14, True, BLUE); sep(); doc.add_paragraph()

h2("8.1 Jadwal Pelaksanaan")
tbl(["Bulan","Kegiatan"],[
    ("Bulan 1","Pengadaan hardware, instalasi SSD & RAM, konfigurasi ulang Proxmox VE, migrasi VM ke storage baru"),
    ("Bulan 2","Migrasi data historis, integrasi Web Supervisi ke SSO SDMS, pengembangan modul rapor digital"),
    ("Bulan 3","Pengembangan modul SPP & inventaris, uji coba integrasi semua 12 aplikasi, pengujian keamanan"),
    ("Bulan 4","Pelatihan operator & guru (2 hari), penyusunan dokumentasi & SOP, soft launching ke semua user"),
    ("Bulan 5–12","Operasional penuh, pemeliharaan rutin, evaluasi triwulan, pengembangan fitur baru"),
], fs=11)

h2("8.2 Indikator Keberhasilan")
tbl(["Indikator Kinerja","Target","Metode Pengukuran"],[
    ("Uptime sistem SDMS","≥ 99,5%","Monitoring server otomatis"),
    ("Konsistensi data antar 12 aplikasi","> 99%","Audit log rekonsiliasi data"),
    ("Waktu sinkronisasi data","< 5 detik","Log webhook timestamp"),
    ("Pengurangan tiket reset password","≥ 90%","Data helpdesk per bulan"),
    ("Kepuasan pengguna (guru & TU)","≥ 85%","Survei kepuasan per semester"),
    ("Aplikasi terintegrasi aktif","12 aplikasi","Laporan API Hub SDMS"),
    ("Pengurangan waktu rekonsiliasi","≥ 90%","Perbandingan log waktu kerja"),
    ("Recovery data dari backup","< 30 menit","Simulasi disaster recovery"),
])
pb()

# ══════════════════════════════════════════════════════
# BAB IX — PENUTUP
# ══════════════════════════════════════════════════════
center("BAB IX — PENUTUP", 14, True, BLUE); sep(); doc.add_paragraph()

body("School Data Management System (SDMS) SMK Negeri 1 Kras adalah infrastruktur digital fundamental "
     "yang menjadi tulang punggung ekosistem 12 aplikasi digital sekolah. Dengan prinsip "
     "\"Satu Data, Satu Login, Semua Aplikasi\", SDMS memastikan data yang akurat tersedia di seluruh "
     "platform secara real-time dan otomatis — sementara guru serta siswa cukup login satu kali untuk "
     "mengakses semua layanan.")
body("Keunggulan utama: sistem ini dirancang dan dikelola oleh tenaga pendidik internal bersertifikat "
     "internasional (MTCNA No. 2011NA6544 & MTCRE No. 2011RE6761), menjamin kualitas teknis sekaligus "
     "keberlanjutan tanpa ketergantungan pada pihak ketiga — sesuai prinsip Human Capital Theory (Becker, 1964).")
body("Manfaat terukur: efisiensi administrasi ↑94%, akun yang dikelola ↓92%, tiket reset password ↓90%, "
     "konsistensi data meningkat dari <70% menjadi >99%. Investasi Rp 47.850.000 untuk satu tahun penuh "
     "jauh lebih ekonomis dibanding biaya outsourcing atau kerugian akibat kehilangan data.")
body("Kami memohon dukungan dan persetujuan atas proposal ini demi mewujudkan SMK Negeri 1 Kras sebagai "
     "sekolah kejuruan berbasis data (data-driven vocational school) yang modern, efisien, dan berdaya "
     "saing tinggi.")

doc.add_paragraph()
body("Kras, September 2026", align=WD_ALIGN_PARAGRAPH.RIGHT, indent=False)
doc.add_paragraph()

# Tanda tangan
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
                    run.italic = True; run.font.size = Pt(9); run.font.color.rgb = BLUE

out = r"d:\WEBSITE\sdms\docs\Proposal-SDMS-SMKN1Kras-v4.docx"
doc.save(out)
print(f"Berhasil: {out}")
