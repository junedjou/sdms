# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# ── Page margins ──────────────────────────────────────────────
section = doc.sections[0]
section.top_margin    = Cm(3)
section.bottom_margin = Cm(3)
section.left_margin   = Cm(4)
section.right_margin  = Cm(3)

# ── Style helpers ─────────────────────────────────────────────
BLUE   = RGBColor(0x1e, 0x40, 0xaf)
BLACK  = RGBColor(0x00, 0x00, 0x00)
DARK   = RGBColor(0x1e, 0x29, 0x3b)

def add_page_break():
    doc.add_page_break()

def center(text, size=14, bold=True, color=BLUE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(size)
    run.font.color.rgb = color
    return p

def h1(text):
    return center(text, 14, True, BLUE)

def h2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = BLUE
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(4)
    return p

def h3(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(12)
    run.font.color.rgb = DARK
    return p

def body(text, italic=False, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.first_line_indent = Cm(1)
    run = p.add_run(text)
    run.font.size = Pt(12)
    run.italic = italic
    run.bold   = bold
    return p

def bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if bold_prefix:
        r1 = p.add_run(bold_prefix)
        r1.bold = True
        r1.font.size = Pt(12)
        r2 = p.add_run(text)
        r2.font.size = Pt(12)
    else:
        run = p.add_run(text)
        run.font.size = Pt(12)
    return p

def separator():
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('━' * 65)
    run.font.color.rgb = BLUE
    run.font.size = Pt(8)

def tbl_header(tbl, headers, bold=True, size=10, bg=None):
    for i, h in enumerate(headers):
        cell = tbl.rows[0].cells[i]
        cell.text = h
        for para in cell.paragraphs:
            for run in para.runs:
                run.bold = bold
                run.font.size = Pt(size)
                run.font.color.rgb = RGBColor(0xff,0xff,0xff) if bg else BLACK

def tbl_row(tbl, ri, values, size=10, bold_if=None):
    for ci, v in enumerate(values):
        tbl.rows[ri].cells[ci].text = str(v)
        for para in tbl.rows[ri].cells[ci].paragraphs:
            for run in para.runs:
                run.font.size = Pt(size)
                if bold_if and bold_if in str(v):
                    run.bold = True

def style_tbl(tbl):
    tbl.style = 'Table Grid'

# ═══════════════════════════════════════════════════════════════
# SAMPUL
# ═══════════════════════════════════════════════════════════════
doc.add_paragraph()
doc.add_paragraph()
center("PROPOSAL PENGAJUAN ANGGARAN", 16, True, BLUE)
center("PEMBANGUNAN SISTEM INFORMASI MANAJEMEN SEKOLAH", 14, True, BLUE)
center("SCHOOL DATA MANAGEMENT SYSTEM (SDMS)", 14, True, BLUE)
center("TERINTEGRASI BERBASIS SINGLE SOURCE OF DATA", 12, False, DARK)
doc.add_paragraph()
separator()
doc.add_paragraph()
center("SMK NEGERI 1 KRAS", 13, True, DARK)
center("Jl. Raya Kras, Kabupaten Kediri, Jawa Timur", 11, False, DARK)
doc.add_paragraph()
center("Tahun Anggaran 2026/2027", 12, True, DARK)
doc.add_paragraph()
doc.add_paragraph()

# Lembar Pengesahan
separator()
h2("LEMBAR PENGESAHAN")
tbl = doc.add_table(rows=5, cols=2)
style_tbl(tbl)
pengesahan = [
    ("Nama Kegiatan",    "Pembangunan dan Pengembangan School Data Management System (SDMS) Terintegrasi"),
    ("Unit Kerja",       "SMK Negeri 1 Kras, Kabupaten Kediri"),
    ("Total Anggaran",   "Rp 47.850.000,-"),
    ("Sumber Dana",      "Dana BOS / BOP / APBD Kabupaten Kediri"),
    ("Tahun Anggaran",   "2026/2027"),
]
for i,(k,v) in enumerate(pengesahan):
    tbl.rows[i].cells[0].text = k
    tbl.rows[i].cells[1].text = v
    for cell in tbl.rows[i].cells:
        for para in cell.paragraphs:
            for run in para.runs:
                run.font.size = Pt(11)
    for run in tbl.rows[i].cells[0].paragraphs[0].runs:
        run.bold = True

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB I — PENDAHULUAN
# ═══════════════════════════════════════════════════════════════
h1("BAB I")
h1("PENDAHULUAN")
separator()
doc.add_paragraph()

h2("1.1 Latar Belakang")
body(
    "Sekolah Menengah Kejuruan (SMK) sebagai satuan pendidikan formal memiliki kompleksitas "
    "pengelolaan data yang sangat tinggi. SMK Negeri 1 Kras dengan lebih dari 1.200 siswa aktif, "
    "67 tenaga pendidik, dan 9 aplikasi digital yang beroperasi secara mandiri, menghadapi "
    "tantangan serius dalam hal integrasi dan konsistensi data. Setiap aplikasi memiliki basis "
    "data tersendiri sehingga satu perubahan data siswa — misalnya perubahan kelas — harus "
    "diperbarui secara manual di setiap sistem secara terpisah."
)
body(
    "Kondisi fragmentasi data ini tidak hanya menimbulkan beban administratif yang signifikan, "
    "tetapi juga berpotensi menyebabkan inkonsistensi data yang berdampak pada kualitas "
    "pelaporan kepada pemerintah (Dapodik), proses akreditasi sekolah, maupun pengambilan "
    "keputusan oleh kepala sekolah dan pimpinan yayasan."
)
body(
    "Merespons tantangan tersebut, sekolah telah mengembangkan School Data Management System "
    "(SDMS) — sebuah platform manajemen data terpusat yang menjadi sumber data tunggal "
    "(single source of truth) bagi seluruh aplikasi digital sekolah. Namun demikian, untuk "
    "memastikan keberlanjutan, keandalan, dan pengembangan sistem ini secara optimal, diperlukan "
    "dukungan anggaran yang memadai."
)

h2("1.2 Dasar Hukum dan Akademis")
h3("a. Dasar Hukum")
for item in [
    ("Permendikbud No. 79 Tahun 2015", " tentang Data Pokok Pendidikan (Dapodik) — mewajibkan pengelolaan data pendidikan yang akurat dan terintegrasi"),
    ("Perpres No. 95 Tahun 2018", " tentang Sistem Pemerintahan Berbasis Elektronik (SPBE) — mendorong digitalisasi layanan publik termasuk sektor pendidikan"),
    ("Permendikbudristek No. 9 Tahun 2022", " tentang Evaluasi Sistem Pendidikan — mengharuskan data yang valid sebagai dasar evaluasi"),
    ("PP No. 57 Tahun 2021", " tentang Standar Nasional Pendidikan — mengamanatkan pengelolaan sistem informasi manajemen sekolah yang efektif"),
    ("Renstra Kemendikbudristek 2020–2024", " yang menekankan transformasi digital satuan pendidikan sebagai prioritas nasional"),
]:
    bullet(item[1], item[0])

h3("b. Dasar Akademis")
body(
    "Secara akademis, pembangunan SDMS berlandaskan pada beberapa teori dan temuan penelitian utama:"
)
for item in [
    ("Laudon & Laudon (2020)", " dalam Management Information Systems membuktikan bahwa integrasi sistem informasi di institusi pendidikan meningkatkan efisiensi operasional hingga 40% dan mengurangi kesalahan data hingga 60%."),
    ("Heeks (2017)", " dalam Digital Government: Research and Practice menunjukkan bahwa sistem informasi terpusat di institusi publik berkontribusi signifikan pada akuntabilitas dan transparansi pengelolaan data."),
    ("Venkatesh et al. (2003) — Technology Acceptance Model (TAM3)", " menjelaskan bahwa sistem informasi yang terintegrasi dan mudah digunakan meningkatkan adopsi teknologi di kalangan pendidik secara signifikan."),
    ("ISO/IEC 27001:2022", " — Standar internasional keamanan informasi yang menjadi acuan implementasi RBAC (Role-Based Access Control) dan audit log dalam SDMS."),
    ("NIST SP 800-63 Rev. 3", " — Panduan federal manajemen identitas digital yang mendasari implementasi Single Sign-On (SSO) multi-aplikasi."),
]:
    bullet(item[1], item[0])

h2("1.3 Rumusan Masalah")
for item in [
    "Bagaimana mengelola data 1.200+ siswa, 67 guru, dan 9 aplikasi sekolah secara terintegrasi dalam satu sumber data tunggal?",
    "Bagaimana memastikan setiap perubahan data master (siswa/guru) langsung sinkron ke seluruh aplikasi secara real-time?",
    "Bagaimana memberikan akses satu login (Single Sign-On) kepada guru dan siswa untuk seluruh ekosistem aplikasi sekolah?",
    "Bagaimana menjamin ketersediaan dan keamanan data sekolah dengan infrastruktur yang handal berbasis Proxmox VE?",
]:
    bullet(item)

h2("1.4 Tujuan")
for item in [
    "Membangun sistem manajemen data sekolah terpusat yang menjadi master data bagi seluruh aplikasi digital sekolah",
    "Mengimplementasikan mekanisme sinkronisasi data real-time menggunakan teknologi webhook HMAC-SHA256",
    "Menyediakan Single Sign-On (SSO) yang memungkinkan satu akun untuk mengakses semua aplikasi",
    "Memperkuat infrastruktur server Proxmox VE agar handal, aman, dan memiliki mekanisme pemulihan bencana (disaster recovery)",
    "Meningkatkan efisiensi administrasi dan mengurangi redundansi data di seluruh unit kerja sekolah",
]:
    bullet(item)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB II — ANALISIS KEBUTUHAN
# ═══════════════════════════════════════════════════════════════
h1("BAB II")
h1("ANALISIS KEBUTUHAN DAN KONDISI SAAT INI")
separator()
doc.add_paragraph()

h2("2.1 Kondisi Pengelolaan Data Saat Ini (Sebelum SDMS)")
body(
    "Berdasarkan observasi dan analisis kondisi lapangan, pengelolaan data di SMK Negeri 1 Kras "
    "sebelum implementasi SDMS menghadapi permasalahan struktural sebagai berikut:"
)

h3("a. Fragmentasi Data (Data Silo)")
body(
    "Setiap aplikasi memiliki database independen yang tidak terhubung satu sama lain. "
    "Ketika seorang siswa pindah kelas, operator harus memperbarui data secara manual di "
    "9 sistem berbeda: Dapodik, LMS, aplikasi absensi, jurnal PKL, jurnal piket, sistem kelulusan, "
    "absen sholat, website sekolah, dan web supervisi. Estimasi waktu yang terbuang: "
    "± 45 menit per perubahan data, atau ± 90 jam/tahun untuk rotasi kelas reguler."
)

h3("b. Multi-Login Burden (Beban Multi Akun)")
body(
    "Setiap guru dan siswa harus memiliki dan mengingat 7–9 pasang username-password berbeda "
    "untuk mengakses berbagai aplikasi sekolah. Kondisi ini menyebabkan:"
)
for item in [
    "Tingginya frekuensi permintaan reset password ke administrator (rata-rata 15–20 tiket/bulan)",
    "Risiko penggunaan password yang lemah dan berulang akibat kelelahan mengingat banyak akun",
    "Hilangnya produktivitas guru karena waktu yang terbuang untuk proses login berulang",
    "Tidak ada kontrol terpusat atas hak akses pengguna — keamanan data tidak terjamin",
]:
    bullet(item)

h3("c. Inkonsistensi Data Antar Sistem")
body(
    "Ketiadaan sumber data tunggal menyebabkan inkonsistensi yang serius. Contoh kasus nyata: "
    "data nama siswa berbeda antara Dapodik dan LMS karena perbedaan penulisan (dengan/tanpa gelar, "
    "singkatan, dll.). Hal ini mempersulit proses rekonsiliasi data untuk keperluan akreditasi, "
    "pelaporan BOS, dan analitik akademik."
)

h3("d. Risiko Kehilangan Data (Data Loss Risk)")
body(
    "Pada September 2026, server Proxmox mengalami kegagalan disk fisik (476GB) yang "
    "menyebabkan database utama tidak dapat diakses selama beberapa jam. "
    "Data berhasil diselamatkan dengan prosedur darurat, namun insiden ini mengekspos "
    "kerentanan infrastruktur yang harus segera diatasi. Tidak adanya UPS memperbesar risiko "
    "kerusakan data akibat mati listrik mendadak."
)

h2("2.2 Analisis Kuantitatif Kebutuhan")
body("Berikut adalah data kuantitatif yang mendasari kebutuhan implementasi SDMS:")

hdra = ["Parameter","Data Aktual","Dampak Tanpa SDMS"]
rowsa = [
    ("Jumlah siswa aktif",            "1.204 siswa",     "1.204 record harus dikelola manual di 9 sistem"),
    ("Jumlah guru",                   "67 guru",         "67 × 9 = 603 akun terpisah yang harus dikelola"),
    ("Jumlah aplikasi terintegrasi",  "9 aplikasi",      "9 database tidak sinkron = inkonsistensi tinggi"),
    ("Estimasi input data redundan",  "±15 jam/minggu",  "±720 jam/tahun terbuang untuk rekonsiliasi"),
    ("Tiket reset password/bulan",    "15–20 tiket",     "±200 tiket/tahun = beban admin tidak produktif"),
    ("Waktu update data satu siswa",  "±45 menit",       "±90 jam/tahun hanya untuk rotasi kelas"),
    ("Insiden kehilangan data",       "1 kali (Sept'26)","Potensi downtime 4–8 jam tanpa infrastruktur handal"),
]
tbla = doc.add_table(rows=len(rowsa)+1, cols=3)
style_tbl(tbla)
tbl_header(tbla, hdra)
for ri,r in enumerate(rowsa,1): tbl_row(tbla, ri, r, 10)
doc.add_paragraph()

h2("2.3 Ekosistem Aplikasi Terintegrasi SDMS")
body(
    "SDMS dirancang sebagai inti (hub) dari ekosistem digital sekolah. Seluruh aplikasi berikut "
    "terhubung ke SDMS dan mendapatkan data master secara otomatis melalui mekanisme "
    "webhook real-time dan Single Sign-On:"
)

hdrb = ["No","Nama Aplikasi","Fungsi Utama","Data dari SDMS","Status SSO"]
rowsb = [
    ("1", "LMS (Learning Management System)", "Kelola materi, tugas, ujian, dan nilai siswa",      "Siswa, Guru, Kelas, Mapel", "✔ Aktif"),
    ("2", "Jurnal Guru (Jurnal Mengajar)",     "Pencatatan jurnal kegiatan mengajar harian guru",   "Guru, Kelas, Mapel",        "✔ Aktif"),
    ("3", "Jurnal Piket",                      "Rekapitulasi kehadiran dan kejadian siswa harian",  "Siswa, Guru, Kelas",        "✔ Aktif"),
    ("4", "Absensi Siswa (Wajah/Fingerprint)", "Monitoring kehadiran siswa berbasis biometrik",     "Siswa, Kelas, Jurusan",     "✔ Aktif"),
    ("5", "Jurnal PKL",                        "Monitoring praktik kerja lapangan siswa",           "Siswa, Guru, Kelas",        "✔ Aktif"),
    ("6", "Web Supervisi",                     "Platform supervisi pembelajaran oleh kepala sekolah","Guru, Jadwal, Kelas",      "⚙ Proses"),
    ("7", "Website Sekolah",                   "Publikasi informasi, profil, dan berita sekolah",   "Guru, Pegawai, Agenda",    "✔ Aktif"),
    ("8", "Sistem Kelulusan",                  "Pengumuman dan data kelulusan siswa",               "Siswa, Nilai, Kelas",       "✔ Aktif"),
    ("9", "Absen Sholat Berjamaah",            "Monitoring ketaatan ibadah sholat berjamaah siswa", "Siswa, Kelas, Jurusan",     "✔ Aktif"),
]
tblb = doc.add_table(rows=len(rowsb)+1, cols=5)
style_tbl(tblb)
tbl_header(tblb, hdrb)
for ri,r in enumerate(rowsb,1): tbl_row(tblb, ri, r, 9)
doc.add_paragraph()

body(
    "Diagram arsitektur ekosistem SDMS dapat digambarkan sebagai berikut: SDMS berada di "
    "pusat sebagai Master Data Service. Setiap kali data diperbarui di SDMS (misalnya: siswa "
    "naik kelas, guru baru ditambahkan), sistem secara otomatis mengirimkan notifikasi "
    "(webhook) ke seluruh 9 aplikasi dalam hitungan detik. Guru dan siswa cukup login "
    "satu kali di SDMS untuk mengakses semua aplikasi melalui teknologi Single Sign-On (SSO)."
)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB III — DESKRIPSI SISTEM
# ═══════════════════════════════════════════════════════════════
h1("BAB III")
h1("DESKRIPSI SISTEM SDMS")
separator()
doc.add_paragraph()

h2("3.1 Konsep Single Source of Truth")
body(
    "Single Source of Truth (SSOT) adalah prinsip arsitektur sistem informasi di mana "
    "seluruh data bersumber dari satu lokasi tunggal yang otoritatif. Dalam ekosistem SDMS, "
    "prinsip ini diimplementasikan sebagai berikut:"
)
for item in [
    "Satu record siswa di SDMS → otomatis tersedia di LMS, Absensi, PKL, Piket, Kelulusan, dan Absen Sholat",
    "Satu record guru di SDMS → otomatis tersedia di Jurnal Guru, LMS, Piket, dan Web Supervisi",
    "Satu akun login → guru/siswa dapat mengakses semua aplikasi tanpa login ulang (SSO)",
    "Satu perubahan data → langsung tersinkronisasi ke semua aplikasi dalam < 5 detik via webhook",
]:
    bullet(item)

h2("3.2 Arsitektur Teknis")
h3("a. Infrastruktur Server (Proxmox VE)")
body(
    "Server sekolah menggunakan Proxmox Virtual Environment (VE) — platform virtualisasi "
    "enterprise open-source berbasis Linux KVM. Proxmox memungkinkan satu server fisik "
    "menjalankan multiple virtual machine (VM) dan container (CT) secara terisolasi, "
    "meningkatkan efisiensi penggunaan hardware sekaligus menyederhanakan manajemen server."
)
hdrp = ["Komponen","Teknologi","Fungsi"]
rowsp = [
    ("Hypervisor",        "Proxmox VE 8.x",           "Virtualisasi semua layanan server sekolah"),
    ("SDMS Backend",      "Node.js + Express.js",      "API utama pengelola data master"),
    ("Database",          "MariaDB 10.11",             "Penyimpanan data master sekolah"),
    ("Frontend",          "Vue.js 3 + Tailwind CSS",   "Antarmuka web SDMS"),
    ("Reverse Proxy",     "Caddy Server",              "SSL otomatis + routing semua domain"),
    ("Autentikasi",       "JWT + RBAC",                "Keamanan akses berlapis"),
    ("Sinkronisasi",      "Webhook HMAC-SHA256",       "Push data real-time ke semua aplikasi"),
    ("SSO",               "JWT Multi-App Token",       "Satu login untuk semua aplikasi"),
]
tblp = doc.add_table(rows=len(rowsp)+1, cols=3)
style_tbl(tblp)
tbl_header(tblp, hdrp)
for ri,r in enumerate(rowsp,1): tbl_row(tblp, ri, r, 10)
doc.add_paragraph()

h3("b. Mekanisme Sinkronisasi Real-Time (Webhook)")
body(
    "Ketika administrator memperbarui data di SDMS, sistem secara otomatis mengirimkan "
    "payload data ke seluruh aplikasi terdaftar menggunakan protokol HTTP POST dengan "
    "signature HMAC-SHA256 untuk keamanan. Setiap aplikasi penerima memverifikasi "
    "signature sebelum memproses data, memastikan integritas dan keaslian data. "
    "Mekanisme retry otomatis (3x dengan backoff eksponensial) menjamin tidak ada data "
    "yang hilang meski terjadi gangguan jaringan sementara."
)

h3("c. Single Sign-On (SSO) Multi-Aplikasi")
body(
    "Teknologi SSO yang diimplementasikan menggunakan JSON Web Token (JWT) dengan "
    "short-lived token (5 menit) per aplikasi. Alur SSO: (1) Guru/siswa login ke SDMS, "
    "(2) Klik aplikasi di Application Hub, (3) SDMS menerbitkan SSO token terenkripsi, "
    "(4) Aplikasi target memverifikasi token dan membuat sesi lokal secara otomatis. "
    "Seluruh proses terjadi dalam < 2 detik tanpa interaksi pengguna."
)

h2("3.3 Fitur Sistem yang Telah Dibangun")
hdrf = ["No","Fitur","Deskripsi","Manfaat Langsung"]
rowsf = [
    ("1",  "Data Master Terintegrasi",  "Kelola siswa, guru, kelas, jurusan, mapel, pegawai",      "Satu input data untuk semua aplikasi"),
    ("2",  "Single Sign-On (SSO)",      "Login sekali untuk 9 aplikasi sekolah",                   "Hemat waktu, keamanan terpusat"),
    ("3",  "Application Hub",           "Dashboard portal semua aplikasi sekolah",                  "Akses mudah dari satu halaman"),
    ("4",  "Webhook Real-Time",         "Sinkronisasi data otomatis ke semua aplikasi",             "Data selalu konsisten & terkini"),
    ("5",  "RBAC Multi-Role",           "Hak akses berbeda: superadmin, admin, guru, siswa",        "Keamanan berlapis sesuai jabatan"),
    ("6",  "Lupa Password",             "Reset password via email untuk semua role",                "Mengurangi beban admin"),
    ("7",  "Audit Log",                 "Rekam seluruh aktivitas perubahan data",                   "Akuntabilitas & jejak digital"),
    ("8",  "Dashboard Analitik",        "Statistik real-time siswa, guru, kelas",                   "Pengambilan keputusan berbasis data"),
    ("9",  "Backup Otomatis",           "Backup terjadwal ke storage lokal & cloud",                "Keamanan data dari bencana"),
    ("10", "API Hub",                   "Manajemen integrasi antar aplikasi",                       "Kontrol terpusat semua koneksi"),
    ("11", "Kalender Akademik",         "Manajemen agenda dan kegiatan sekolah",                    "Sinkronisasi jadwal ke LMS"),
    ("12", "Impor/Ekspor Data",         "Import massal dari Excel, export laporan",                 "Efisiensi input data awal"),
]
tblf = doc.add_table(rows=len(rowsf)+1, cols=4)
style_tbl(tblf)
tbl_header(tblf, hdrf)
for ri,r in enumerate(rowsf,1): tbl_row(tblf, ri, r, 9)
doc.add_paragraph()

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB IV — ANALISIS MANFAAT
# ═══════════════════════════════════════════════════════════════
h1("BAB IV")
h1("ANALISIS MANFAAT DAN DAMPAK")
separator()
doc.add_paragraph()

h2("4.1 Analisis Manfaat Kuantitatif")
body(
    "Berdasarkan data kondisi eksisting dan proyeksi implementasi SDMS, berikut estimasi "
    "manfaat terukur yang dihasilkan:"
)
hdrm = ["Indikator","Sebelum SDMS","Sesudah SDMS","Efisiensi"]
rowsm = [
    ("Waktu input data siswa baru (per siswa)", "45 menit (9 sistem)", "5 menit (1 sistem)", "↓ 89%"),
    ("Waktu rekonsiliasi data bulanan",         "3–4 jam",             "15–20 menit",         "↓ 85%"),
    ("Jumlah akun yang dikelola (67 guru)",     "603 akun (9 sistem)", "67 akun (1 sistem)",  "↓ 89%"),
    ("Tiket reset password per tahun",          "±200 tiket",          "<20 tiket",           "↓ 90%"),
    ("Konsistensi data antar sistem",           "<70%",                ">99%",                "↑ 41%"),
    ("Waktu update data pasca kenaikan kelas",  "±90 jam",             "±5 jam",              "↓ 94%"),
    ("Risiko kehilangan data",                  "Tinggi (tanpa UPS)",  "Sangat Rendah",       "↑ 95%"),
]
tblm = doc.add_table(rows=len(rowsm)+1, cols=4)
style_tbl(tblm)
tbl_header(tblm, hdrm)
for ri,r in enumerate(rowsm,1): tbl_row(tblm, ri, r, 10)
doc.add_paragraph()

h2("4.2 Analisis Manfaat Kualitatif")
h3("a. Bagi Tenaga Pendidik (Guru)")
for item in [
    "Kemudahan akses — satu login untuk LMS, Jurnal Mengajar, PKL, Absensi, Web Supervisi, dan Piket",
    "Data profil selalu terkini di semua platform tanpa perlu memperbarui satu per satu",
    "Pengurangan beban administrasi sehingga guru dapat fokus pada kegiatan pembelajaran",
    "Notifikasi otomatis ketika ada perubahan jadwal, kelas, atau data akademik",
]:
    bullet(item)

h3("b. Bagi Peserta Didik (Siswa)")
for item in [
    "Satu akun untuk mengakses semua layanan digital sekolah (LMS, nilai, kehadiran, PKL)",
    "Data kehadiran dan akademik terupdate real-time dan dapat dipantau kapan saja",
    "Proses PKL lebih terstruktur dengan jurnal digital yang terhubung ke data master siswa",
    "Sistem lupa password mandiri — tidak perlu mengantri ke TU untuk reset akun",
]:
    bullet(item)

h3("c. Bagi Manajemen Sekolah")
for item in [
    "Dashboard analitik real-time — kepala sekolah dapat memonitor kondisi sekolah kapan saja",
    "Audit log lengkap — seluruh perubahan data tercatat untuk keperluan akuntabilitas",
    "Laporan akreditasi lebih mudah — data terintegrasi tinggal diekspor dalam format yang dibutuhkan",
    "Pengambilan keputusan berbasis data (data-driven decision making) yang lebih akurat",
]:
    bullet(item)

h3("d. Bagi Tenaga Kependidikan (TU/Operator)")
for item in [
    "Eliminasi double-entry data — input satu kali, tersebar ke semua sistem otomatis",
    "Manajemen akun terpusat — satu panel untuk kelola semua akun pengguna",
    "Modul import Excel — input data massal lebih cepat dan akurat",
    "Berkurangnya permintaan reset password dari guru dan siswa",
]:
    bullet(item)

h2("4.3 Analisis Risiko")
hdrr = ["Risiko","Tingkat","Mitigasi dengan SDMS"]
rowsr = [
    ("Kehilangan data akibat kerusakan hardware",   "Tinggi",   "Backup otomatis harian + UPS + RAID storage"),
    ("Inkonsistensi data antar aplikasi",           "Tinggi",   "Webhook real-time + single source of truth"),
    ("Akses tidak sah ke data sensitif",            "Sedang",   "RBAC + JWT + audit log + HTTPS"),
    ("Downtime sistem saat jam sibuk",              "Sedang",   "Proxmox VM snapshot + hot standby"),
    ("Ketergantungan pada satu vendor",             "Rendah",   "Open-source stack (Node.js, MariaDB, Vue.js)"),
]
tblr = doc.add_table(rows=len(rowsr)+1, cols=3)
style_tbl(tblr)
tbl_header(tblr, hdrr)
for ri,r in enumerate(rowsr,1): tbl_row(tblr, ri, r, 10)
doc.add_paragraph()

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB V — RAB
# ═══════════════════════════════════════════════════════════════
h1("BAB V")
h1("RENCANA ANGGARAN BIAYA (RAB)")
separator()
doc.add_paragraph()

h2("5.1 Kebutuhan Hardware (Penguatan Infrastruktur)")
body(
    "Prioritas utama pengadaan hardware adalah mengganti disk yang rusak dan menambahkan "
    "sistem proteksi daya (UPS) untuk mencegah terulangnya insiden kehilangan data:"
)
hdrh = ["No","Item","Spesifikasi","Qty","Harga Satuan","Total"]
rowsh = [
    ("1","SSD NVMe M.2 (OS Proxmox)",  "1TB, Read >3500 MB/s",           "2","Rp    950.000","Rp  1.900.000"),
    ("2","SSD SATA (Storage VM/CT)",   "2TB Samsung 870 EVO",             "2","Rp  1.850.000","Rp  3.700.000"),
    ("3","RAM Server DDR4",            "32GB ECC (upgrade stabilitas VM)","2","Rp  1.200.000","Rp  2.400.000"),
    ("4","UPS",                        "APC BX1100L-MS 1100VA/660W",     "1","Rp  2.500.000","Rp  2.500.000"),
    ("5","Switch Managed",             "TP-Link TL-SG108E 8-Port",       "1","Rp    750.000","Rp    750.000"),
    ("6","Kabel UTP Cat6",             "1 Roll 305m + konektor RJ45",    "1","Rp    450.000","Rp    450.000"),
    ("","","","","SUBTOTAL HARDWARE","Rp 11.700.000"),
]
tblh = doc.add_table(rows=len(rowsh)+1, cols=6)
style_tbl(tblh)
tbl_header(tblh, hdrh)
for ri,r in enumerate(rowsh,1):
    tbl_row(tblh, ri, r, 9, bold_if="SUBTOTAL")
doc.add_paragraph()

h2("5.2 Kebutuhan Software & Layanan Digital")
rowss = [
    ("1","Domain .sch.id",        "Perpanjangan 2 tahun",          "1 paket","Rp    500.000","Rp    500.000"),
    ("2","SSL Wildcard",           "Let's Encrypt via Caddy (gratis)","—",   "Rp          0","Rp          0"),
    ("3","Email SMTP Sekolah",    "Google Workspace Edu / Zoho",   "1 tahun","Rp    850.000","Rp    850.000"),
    ("4","Cloud Backup Storage",  "Google Drive API via Rclone",   "1 tahun","Rp    300.000","Rp    300.000"),
    ("","","","","SUBTOTAL SOFTWARE","Rp  1.650.000"),
]
tbls = doc.add_table(rows=len(rowss)+1, cols=6)
style_tbl(tbls)
tbl_header(tbls, hdrh)
for ri,r in enumerate(rowss,1):
    tbl_row(tbls, ri, r, 9, bold_if="SUBTOTAL")
doc.add_paragraph()

h2("5.3 Pengembangan & Implementasi Lanjutan")
rowsdev = [
    ("1","Pengembangan Modul Lanjutan",    "Rapor digital, SPP, inventaris, supervisi", "3 bulan","Rp 3.500.000/bln","Rp 10.500.000"),
    ("2","Integrasi Web Supervisi",        "Koneksi SSO + sinkronisasi ke SDMS",        "1 paket","Rp   1.500.000",  "Rp  1.500.000"),
    ("3","Migrasi Data Historis",          "Import data dari sistem lama ke SDMS",      "1 kali", "Rp   2.000.000",  "Rp  2.000.000"),
    ("4","Pelatihan Operator & Guru",      "Workshop 2 hari + modul pelatihan",         "1 kali", "Rp   1.500.000",  "Rp  1.500.000"),
    ("5","Dokumentasi Teknis & SOP",       "Buku panduan + video tutorial",             "1 paket","Rp     750.000",  "Rp    750.000"),
    ("","","","","SUBTOTAL PENGEMBANGAN","Rp 16.250.000"),
]
tbldev = doc.add_table(rows=len(rowsdev)+1, cols=6)
style_tbl(tbldev)
tbl_header(tbldev, hdrh)
for ri,r in enumerate(rowsdev,1):
    tbl_row(tbldev, ri, r, 9, bold_if="SUBTOTAL")
doc.add_paragraph()

h2("5.4 Pemeliharaan & Operasional (1 Tahun)")
rowsop = [
    ("1","Pemeliharaan Sistem",  "Update, patch keamanan, monitoring",  "12 bulan","Rp 1.000.000/bln","Rp 12.000.000"),
    ("2","Biaya Listrik Server", "200W × 24 jam × 365 hari × Rp 1.444", "1 tahun", "Rp   3.500.000",  "Rp  3.500.000"),
    ("3","Rapat Evaluasi",       "Triwulan × 4 kali, konsumsi",         "4 kali",  "Rp     187.500",  "Rp    750.000"),
    ("","","","","SUBTOTAL OPERASIONAL","Rp 16.250.000"),
]
tblop = doc.add_table(rows=len(rowsop)+1, cols=6)
style_tbl(tblop)
tbl_header(tblop, hdrh)
for ri,r in enumerate(rowsop,1):
    tbl_row(tblop, ri, r, 9, bold_if="SUBTOTAL")
doc.add_paragraph()

h2("5.5 Rekapitulasi Anggaran")
rekap = [
    ("1","Pengadaan Hardware (Penguatan Infrastruktur)","Rp 11.700.000"),
    ("2","Software & Layanan Digital",                  "Rp  1.650.000"),
    ("3","Pengembangan & Implementasi Lanjutan",        "Rp 16.250.000"),
    ("4","Pemeliharaan & Operasional (1 tahun)",        "Rp 16.250.000"),
    ("", "TOTAL",                                       "Rp 45.850.000"),
    ("", "Cadangan / Tak Terduga (4,4%)",               "Rp  2.000.000"),
    ("", "TOTAL KESELURUHAN",                           "Rp 47.850.000"),
]
tblrek = doc.add_table(rows=len(rekap)+1, cols=3)
style_tbl(tblrek)
for i,h in enumerate(["No","Komponen Anggaran","Jumlah"]):
    tblrek.rows[0].cells[i].text = h
    for run in tblrek.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(12)
for ri,(n,k,j) in enumerate(rekap,1):
    tblrek.rows[ri].cells[0].text = n
    tblrek.rows[ri].cells[1].text = k
    tblrek.rows[ri].cells[2].text = j
    for ci in range(3):
        for run in tblrek.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size = Pt(12)
            if "TOTAL" in k: run.bold = True
doc.add_paragraph()

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB VI — TIMELINE
# ═══════════════════════════════════════════════════════════════
h1("BAB VI")
h1("TIMELINE DAN INDIKATOR KEBERHASILAN")
separator()
doc.add_paragraph()

h2("6.1 Rencana Jadwal Pelaksanaan")
rowst = [
    ("Bulan 1",    "Pengadaan dan instalasi hardware (SSD, RAM, UPS), konfigurasi ulang Proxmox, migrasi VM ke storage baru"),
    ("Bulan 2",    "Migrasi data historis dari sistem lama, integrasi Web Supervisi ke SSO SDMS, pengembangan modul rapor"),
    ("Bulan 3",    "Pengembangan modul SPP dan inventaris, uji coba integrasi semua 9 aplikasi, pengujian keamanan"),
    ("Bulan 4",    "Pelatihan operator dan guru (2 hari), penyusunan dokumentasi dan SOP, soft launching ke seluruh user"),
    ("Bulan 5–12", "Operasional penuh seluruh ekosistem, pemeliharaan rutin, evaluasi triwulan, pengembangan fitur baru"),
]
tblt = doc.add_table(rows=len(rowst)+1, cols=2)
style_tbl(tblt)
for i,h in enumerate(["Bulan","Kegiatan"]):
    tblt.rows[0].cells[i].text = h
    for run in tblt.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(11)
for ri,(a,b) in enumerate(rowst,1):
    tblt.rows[ri].cells[0].text = a
    tblt.rows[ri].cells[1].text = b
    for ci in range(2):
        for run in tblt.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size=Pt(11)
doc.add_paragraph()

h2("6.2 Indikator Keberhasilan Program")
hdrik = ["Indikator Kinerja","Target","Metode Pengukuran"]
rowsik = [
    ("Uptime sistem SDMS",                 "≥ 99,5%",         "Monitoring server otomatis"),
    ("Konsistensi data antar 9 aplikasi",  "> 99%",           "Audit log rekonsiliasi data"),
    ("Waktu sinkronisasi data",            "< 5 detik",       "Log webhook timestamp"),
    ("Pengurangan tiket reset password",   "≥ 90%",           "Data helpdesk per bulan"),
    ("Kepuasan pengguna (guru & TU)",      "≥ 85%",           "Survei kepuasan per semester"),
    ("Aplikasi terintegrasi aktif",        "9 aplikasi",      "Laporan API Hub SDMS"),
    ("Pengurangan waktu rekonsiliasi data","≥ 85%",           "Perbandingan log waktu kerja"),
    ("Recovery data dari backup",          "< 30 menit",      "Simulasi disaster recovery"),
]
tblik = doc.add_table(rows=len(rowsik)+1, cols=3)
style_tbl(tblik)
tbl_header(tblik, hdrik)
for ri,r in enumerate(rowsik,1): tbl_row(tblik, ri, r, 10)
doc.add_paragraph()

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB VII — PENUTUP
# ═══════════════════════════════════════════════════════════════
h1("BAB VII")
h1("PENUTUP")
separator()
doc.add_paragraph()

body(
    "School Data Management System (SDMS) yang sedang dibangun di SMK Negeri 1 Kras bukan "
    "sekadar perangkat lunak biasa, melainkan infrastruktur digital fundamental yang menjadi "
    "tulang punggung seluruh ekosistem aplikasi digital sekolah. Dengan prinsip Single Source "
    "of Truth, SDMS memastikan bahwa satu data yang akurat tersedia di seluruh 9 aplikasi "
    "sekolah secara real-time dan otomatis."
)
body(
    "Manfaat yang ditawarkan sangat konkret dan terukur: pengurangan waktu administrasi hingga "
    "94%, eliminasi 89% akun yang harus dikelola secara terpisah, dan peningkatan konsistensi "
    "data dari <70% menjadi >99%. Guru dan siswa hanya perlu login satu kali untuk mengakses "
    "semua layanan digital sekolah — LMS, Jurnal Guru, Piket, Absensi, PKL, Web Supervisi, "
    "Website Sekolah, Kelulusan, hingga Absen Sholat."
)
body(
    "Dengan penguatan infrastruktur Proxmox VE yang diusulkan — terutama penggantian disk yang "
    "rusak, penambahan UPS, dan peningkatan kapasitas RAM — sistem ini akan beroperasi dengan "
    "keandalan tinggi dan risiko kehilangan data yang minimal. Investasi sebesar Rp 47.850.000 "
    "untuk satu tahun penuh mencakup hardware, pengembangan, pelatihan, dan pemeliharaan — "
    "jauh lebih ekonomis dibandingkan potensi kerugian akibat kehilangan data dan "
    "inefisiensi administrasi yang selama ini terjadi."
)
body(
    "Kami mengucapkan terima kasih atas perhatian dan dukungan yang diberikan. Semoga proposal "
    "ini dapat menjadi landasan yang kuat bagi SMK Negeri 1 Kras untuk menjadi sekolah "
    "kejuruan berbasis data (data-driven vocational school) yang modern, efisien, dan berdaya "
    "saing tinggi di era digital."
)
doc.add_paragraph()
body("Kras, September 2026", align=WD_ALIGN_PARAGRAPH.RIGHT)
doc.add_paragraph()

# Tanda tangan
tbltd = doc.add_table(rows=6, cols=2)
rows_td = [
    ("Mengetahui,",              "Dibuat oleh,"),
    ("Kepala SMK Negeri 1 Kras", "Koordinator TIK / Pengembang Sistem"),
    ("",""),
    ("",""),
    ("_______________________________","_______________________________"),
    ("NIP. ","NIP. "),
]
for ri,(a,b) in enumerate(rows_td):
    tbltd.rows[ri].cells[0].text = a
    tbltd.rows[ri].cells[1].text = b
    for ci in range(2):
        for para in tbltd.rows[ri].cells[ci].paragraphs:
            for run in para.runs:
                run.font.size = Pt(12)
                if ri in [0,1,4,5]: run.bold = True

# Hilangkan border tabel tanda tangan
from docx.oxml.ns import qn
tbltd._tbl.attrib.pop(qn('w:tblPr'), None)

# ── Save ──────────────────────────────────────────────────────
output = r"d:\WEBSITE\sdms\docs\Proposal-SDMS-SMKN1Kras-v2.docx"
doc.save(output)
print(f"Berhasil: {output}")
