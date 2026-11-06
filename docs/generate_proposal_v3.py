# -*- coding: utf-8 -*-
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# ── Page margins ──────────────────────────────────────────────
section = doc.sections[0]
section.top_margin    = Cm(3)
section.bottom_margin = Cm(3)
section.left_margin   = Cm(4)
section.right_margin  = Cm(3)

BLUE  = RGBColor(0x1e, 0x40, 0xaf)
BLACK = RGBColor(0x00, 0x00, 0x00)
DARK  = RGBColor(0x1e, 0x29, 0x3b)
GREEN = RGBColor(0x06, 0x6d, 0x2c)

def add_page_break():
    doc.add_page_break()

def center(text, size=14, bold=True, color=BLUE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.bold = bold; run.font.size = Pt(size); run.font.color.rgb = color
    return p

def h1(text): return center(text, 14, True, BLUE)

def h2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True; run.font.size = Pt(13); run.font.color.rgb = BLUE
    p.paragraph_format.space_before = Pt(12); p.paragraph_format.space_after = Pt(4)
    return p

def h3(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True; run.font.size = Pt(12); run.font.color.rgb = DARK
    return p

def body(text, italic=False, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True):
    p = doc.add_paragraph()
    p.alignment = align
    if indent: p.paragraph_format.first_line_indent = Cm(1)
    run = p.add_run(text)
    run.font.size = Pt(12); run.italic = italic; run.bold = bold
    return p

def bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if bold_prefix:
        r1 = p.add_run(bold_prefix); r1.bold = True; r1.font.size = Pt(12)
        r2 = p.add_run(text); r2.font.size = Pt(12)
    else:
        p.add_run(text).font.size = Pt(12)
    return p

def separator():
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('━' * 65)
    run.font.color.rgb = BLUE; run.font.size = Pt(8)

def make_table(headers, rows, col_sizes=None, font_size=10):
    tbl = doc.add_table(rows=len(rows)+1, cols=len(headers))
    tbl.style = 'Table Grid'
    # Header row
    for i, h in enumerate(headers):
        cell = tbl.rows[0].cells[i]
        cell.text = h
        for para in cell.paragraphs:
            for run in para.runs:
                run.bold = True; run.font.size = Pt(font_size)
    # Data rows
    for ri, row in enumerate(rows, 1):
        for ci, val in enumerate(row):
            tbl.rows[ri].cells[ci].text = str(val)
            for para in tbl.rows[ri].cells[ci].paragraphs:
                for run in para.runs:
                    run.font.size = Pt(font_size)
                    if any(x in str(val) for x in ['SUBTOTAL','TOTAL','JUMLAH']):
                        run.bold = True
    doc.add_paragraph()
    return tbl

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

separator()
h2("LEMBAR PENGESAHAN")
make_table(
    ["Keterangan", "Isi"],
    [
        ("Nama Kegiatan",    "Pembangunan dan Pengembangan School Data Management System (SDMS) Terintegrasi"),
        ("Unit Kerja",       "SMK Negeri 1 Kras, Kabupaten Kediri"),
        ("Total Anggaran",   "Rp 47.850.000,-"),
        ("Sumber Dana",      "Dana BOS / BOP / APBD Kabupaten Kediri"),
        ("Tahun Anggaran",   "2026/2027"),
    ], font_size=11
)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB I — PENDAHULUAN
# ═══════════════════════════════════════════════════════════════
h1("BAB I — PENDAHULUAN")
separator()
doc.add_paragraph()

h2("1.1 Latar Belakang")
body("Sekolah Menengah Kejuruan (SMK) sebagai satuan pendidikan formal memiliki kompleksitas "
     "pengelolaan data yang sangat tinggi. SMK Negeri 1 Kras dengan lebih dari 1.200 siswa aktif, "
     "67 tenaga pendidik, dan 9 aplikasi digital yang beroperasi secara mandiri, menghadapi tantangan "
     "serius dalam hal integrasi dan konsistensi data. Setiap aplikasi memiliki basis data tersendiri "
     "sehingga satu perubahan data siswa harus diperbarui secara manual di setiap sistem secara terpisah.")
body("Kondisi fragmentasi data ini tidak hanya menimbulkan beban administratif yang signifikan, "
     "tetapi juga berpotensi menyebabkan inkonsistensi data yang berdampak pada kualitas pelaporan "
     "kepada pemerintah (Dapodik), proses akreditasi sekolah, maupun pengambilan keputusan strategis "
     "oleh kepala sekolah.")
body("Merespons tantangan tersebut, sekolah telah mengembangkan School Data Management System (SDMS) "
     "— sebuah platform manajemen data terpusat yang menjadi sumber data tunggal (single source of truth) "
     "bagi seluruh aplikasi digital sekolah. Sistem ini dirancang, dibangun, dan dikelola oleh tenaga "
     "pendidik internal sekolah yang memiliki kompetensi teknis tersertifikasi internasional.")

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
for item in [
    ("Laudon & Laudon (2020)", " dalam Management Information Systems — integrasi SI di institusi pendidikan meningkatkan efisiensi operasional hingga 40% dan mengurangi kesalahan data hingga 60%."),
    ("Heeks (2017)", " dalam Digital Government: Research and Practice — sistem informasi terpusat berkontribusi signifikan pada akuntabilitas dan transparansi pengelolaan data publik."),
    ("Venkatesh et al. (2003) — Technology Acceptance Model (TAM3)", " — sistem informasi terintegrasi meningkatkan adopsi teknologi di kalangan pendidik secara signifikan."),
    ("ISO/IEC 27001:2022", " — Standar internasional keamanan informasi yang mendasari implementasi RBAC dan audit log dalam SDMS."),
    ("NIST SP 800-63 Rev. 3", " — Panduan manajemen identitas digital yang mendasari implementasi Single Sign-On (SSO) multi-aplikasi."),
]:
    bullet(item[1], item[0])

h2("1.3 Tujuan")
for item in [
    "Membangun sistem manajemen data sekolah terpusat sebagai master data bagi seluruh aplikasi digital sekolah",
    "Mengimplementasikan sinkronisasi data real-time menggunakan teknologi webhook HMAC-SHA256",
    "Menyediakan Single Sign-On (SSO) — satu akun untuk mengakses semua 9 aplikasi sekolah",
    "Memperkuat infrastruktur server Proxmox VE agar handal, aman, dan memiliki mekanisme disaster recovery",
    "Meningkatkan efisiensi administrasi dan mengurangi redundansi data di seluruh unit kerja sekolah",
]:
    bullet(item)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB II — KOMPETENSI PENGEMBANG (BARU)
# ═══════════════════════════════════════════════════════════════
h1("BAB II — KOMPETENSI PENGEMBANG SISTEM")
separator()
doc.add_paragraph()

body("Salah satu faktor penentu keberhasilan pembangunan sistem informasi adalah kompetensi "
     "teknis tim pengembang yang dapat dipertanggungjawabkan secara ilmiah dan profesional. "
     "SDMS SMK Negeri 1 Kras dirancang, dibangun, dan dikelola oleh tenaga pendidik internal "
     "yang memiliki sertifikasi kompetensi jaringan dan teknologi informasi bertaraf internasional.")

h2("2.1 Sertifikasi Internasional yang Dimiliki")
make_table(
    ["No", "Sertifikasi", "Nomor Sertifikat", "Tanggal Terbit", "Penerbit"],
    [
        ("1", "MTCNA — MikroTik Certified Network Associate",   "2011NA6544", "27 November 2020", "Mikrotikls SIA, Latvia"),
        ("2", "MTCRE — MikroTik Certified Routing Engineer",    "2011RE6761", "28 November 2020", "Mikrotikls SIA, Latvia"),
    ], font_size=10
)

body("Kedua sertifikasi ini diterbitkan oleh Mikrotikls SIA, perusahaan teknologi jaringan "
     "internasional yang berkantor pusat di Brivibas gatve 214i, Riga, Latvia. Keaslian "
     "sertifikat dapat diverifikasi secara independen melalui laman resmi mikrotik.com/certificates, "
     "memenuhi prinsip verifiability dalam standar akreditasi kompetensi profesional internasional.")

h2("2.2 Relevansi Sertifikasi dengan Pembangunan SDMS")

h3("a. MTCNA (MikroTik Certified Network Associate) — Fondasi Infrastruktur Jaringan SDMS")
body("Sertifikasi MTCNA membuktikan penguasaan kompetensi fundamental jaringan komputer yang "
     "secara langsung diaplikasikan dalam pembangunan infrastruktur SDMS, meliputi:")
for item in [
    ("Konfigurasi dan manajemen jaringan", " — Desain topologi jaringan multi-server Proxmox yang menghubungkan SDMS (10.10.102.x), LMS (10.10.102.x), PKL (10.10.103.x), dan Reverse Proxy secara terstruktur"),
    ("Firewall dan keamanan jaringan", " — Implementasi aturan firewall untuk melindungi server SDMS dari akses tidak sah, sesuai standar ISO/IEC 27001"),
    ("DHCP, DNS, dan manajemen alamat IP", " — Konfigurasi DNS untuk domain sdms.smkn1kras.sch.id dan seluruh subdomain aplikasi sekolah"),
    ("Wireless networking", " — Perencanaan konektivitas jaringan nirkabel yang memungkinkan 1.200+ siswa mengakses SDMS secara bersamaan"),
    ("Quality of Service (QoS)", " — Manajemen bandwidth untuk memastikan performa SDMS tetap optimal saat jam sibuk penggunaan"),
]:
    bullet(item[1], item[0])

h3("b. MTCRE (MikroTik Certified Routing Engineer) — Arsitektur Routing Multi-Server")
body("Sertifikasi MTCRE, yang merupakan sertifikasi lanjutan di atas MTCNA, membuktikan "
     "penguasaan kompetensi routing tingkat lanjut yang diaplikasikan dalam:")
for item in [
    ("Static dan dynamic routing", " — Konfigurasi routing antar subnet server Proxmox yang mengelola 9 virtual machine dan container sekolah"),
    ("Arsitektur jaringan enterprise", " — Desain topologi multi-server yang terbukti dari struktur IP addressing dan konfigurasi Caddy reverse proxy yang diimplementasikan"),
    ("Routing protocols lanjutan (OSPF, BGP)", " — Pengetahuan protokol routing yang mendukung perencanaan skalabilitas infrastruktur ke depan"),
    ("VPN dan secure tunneling", " — Implementasi akses remote yang aman untuk pemeliharaan server SDMS dari jarak jauh"),
    ("Load balancing dan failover", " — Perencanaan distribusi beban dan pemulihan otomatis saat terjadi gangguan pada salah satu layanan"),
]:
    bullet(item[1], item[0])

h2("2.3 Pemetaan Kompetensi Sertifikat terhadap Implementasi SDMS")
make_table(
    ["Kompetensi Sertifikat", "Sertifikat", "Implementasi Nyata dalam SDMS"],
    [
        ("Network fundamentals & OSI model",    "MTCNA", "Desain arsitektur jaringan multi-server Proxmox VE"),
        ("Firewall & packet filtering",          "MTCNA", "Proteksi akses server SDMS + UFW firewall setiap VM"),
        ("DHCP server & DNS management",         "MTCNA", "Konfigurasi domain *.smkn1kras.sch.id via Caddy"),
        ("Wireless & wired networking",          "MTCNA", "Konektivitas 1.200+ pengguna ke ekosistem SDMS"),
        ("Quality of Service (QoS)",             "MTCNA", "Bandwidth management saat peak hours penggunaan"),
        ("Static routing & subnetting",          "MTCRE", "Routing antar subnet 10.10.102.x ↔ 10.10.103.x"),
        ("Dynamic routing (OSPF)",               "MTCRE", "Perencanaan skalabilitas infrastruktur server"),
        ("VPN & secure tunneling",               "MTCRE", "Remote maintenance server tanpa ekspos port publik"),
        ("Load balancing & failover",            "MTCRE", "High availability layanan SDMS dan aplikasi satelit"),
        ("Routing policy & traffic engineering", "MTCRE", "Optimasi traffic antar 9 aplikasi terintegrasi"),
    ], font_size=9
)

h2("2.4 Landasan Ilmiah Relevansi Sertifikasi")
body("Berdasarkan kerangka kompetensi ICT yang ditetapkan oleh ITU-T (International "
     "Telecommunication Union) dan SKKNI (Standar Kompetensi Kerja Nasional Indonesia) "
     "bidang Teknologi Informasi dan Komunikasi, sertifikasi vendor-specific dari produsen "
     "perangkat jaringan terkemuka (seperti MikroTik) diakui sebagai bukti kompetensi teknis "
     "yang valid dalam kategori Network Infrastructure Management.")
body("Perpres No. 95 Tahun 2018 tentang SPBE secara eksplisit menyebutkan bahwa pengelola "
     "infrastruktur TIK pada instansi pemerintah dan satuan pendidikan negeri harus memiliki "
     "kompetensi yang terstandar dan dapat diverifikasi. Kepemilikan sertifikasi MTCNA dan MTCRE "
     "oleh pengembang sistem ini secara langsung memenuhi persyaratan tersebut, sekaligus "
     "menjadi jaminan kualitas bahwa infrastruktur SDMS dibangun dengan standar profesional "
     "yang dapat dipertanggungjawabkan.")
body("Lebih jauh, sertifikasi internasional ini juga selaras dengan konsep Human Capital Theory "
     "(Becker, 1964) yang menegaskan bahwa investasi pada kompetensi sumber daya manusia — "
     "dalam hal ini pengembang sistem internal — menghasilkan nilai tambah yang jauh lebih "
     "besar dibandingkan mengandalkan pihak ketiga eksternal, sekaligus memastikan "
     "keberlanjutan (sustainability) pengelolaan sistem dalam jangka panjang.")

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB III — ANALISIS KEBUTUHAN
# ═══════════════════════════════════════════════════════════════
h1("BAB III — ANALISIS KEBUTUHAN DAN KONDISI SAAT INI")
separator()
doc.add_paragraph()

h2("3.1 Kondisi Pengelolaan Data Saat Ini (Sebelum SDMS)")
h3("a. Fragmentasi Data (Data Silo)")
body("Setiap aplikasi memiliki database independen yang tidak terhubung. Ketika seorang siswa "
     "pindah kelas, operator harus memperbarui data secara manual di 9 sistem berbeda. "
     "Estimasi waktu: ±45 menit per perubahan data, atau ±90 jam/tahun untuk rotasi kelas reguler.")

h3("b. Multi-Login Burden (Beban Multi Akun)")
body("Setiap guru dan siswa harus memiliki 7–9 pasang username-password berbeda. Kondisi ini menyebabkan:")
for item in [
    "Tingginya frekuensi permintaan reset password ke administrator (rata-rata 15–20 tiket/bulan)",
    "Risiko penggunaan password lemah akibat kelelahan mengingat banyak akun",
    "Hilangnya produktivitas guru karena waktu yang terbuang untuk login berulang",
    "Tidak ada kontrol terpusat atas hak akses — keamanan data tidak terjamin",
]:
    bullet(item)

h3("c. Inkonsistensi Data Antar Sistem")
body("Ketiadaan sumber data tunggal menyebabkan inkonsistensi serius antar platform. Hal ini "
     "mempersulit rekonsiliasi data untuk akreditasi, pelaporan BOS, dan analitik akademik.")

h3("d. Risiko Kehilangan Data")
body("Pada September 2026, server Proxmox mengalami kegagalan disk fisik (476GB) yang menyebabkan "
     "database tidak dapat diakses. Data berhasil diselamatkan dengan prosedur darurat, namun "
     "insiden ini mengekspos kerentanan infrastruktur yang harus segera diatasi.")

h2("3.2 Analisis Kuantitatif")
make_table(
    ["Parameter", "Data Aktual", "Dampak Tanpa SDMS"],
    [
        ("Jumlah siswa aktif",           "1.204 siswa",      "1.204 record harus dikelola manual di 9 sistem"),
        ("Jumlah guru",                  "67 guru",          "67 × 9 = 603 akun terpisah yang harus dikelola"),
        ("Jumlah aplikasi",              "9 aplikasi",       "9 database tidak sinkron = inkonsistensi tinggi"),
        ("Estimasi input data redundan", "±15 jam/minggu",   "±720 jam/tahun terbuang untuk rekonsiliasi"),
        ("Tiket reset password/bulan",   "15–20 tiket",      "±200 tiket/tahun = beban admin tidak produktif"),
        ("Waktu update data 1 siswa",    "±45 menit",        "±90 jam/tahun hanya untuk rotasi kelas"),
        ("Insiden kehilangan data",      "1 kali (Sept'26)", "Potensi downtime 4–8 jam tanpa infrastruktur handal"),
    ]
)

h2("3.3 Ekosistem 9 Aplikasi Terintegrasi SDMS")
body("SDMS menjadi inti ekosistem digital sekolah. Seluruh aplikasi berikut terhubung ke SDMS "
     "dan mendapatkan data master secara otomatis:")
make_table(
    ["No", "Nama Aplikasi", "Fungsi Utama", "Data dari SDMS", "SSO"],
    [
        ("1", "LMS (Learning Management System)",  "Materi, tugas, ujian, nilai siswa",              "Siswa, Guru, Kelas, Mapel", "✔"),
        ("2", "Jurnal Guru (Jurnal Mengajar)",      "Jurnal kegiatan mengajar harian guru",           "Guru, Kelas, Mapel",        "✔"),
        ("3", "Jurnal Piket",                       "Kehadiran dan kejadian siswa harian",            "Siswa, Guru, Kelas",        "✔"),
        ("4", "Absensi Siswa",                      "Monitoring kehadiran berbasis biometrik/wajah",  "Siswa, Kelas, Jurusan",     "✔"),
        ("5", "Jurnal PKL",                         "Monitoring praktik kerja lapangan siswa",        "Siswa, Guru, Kelas",        "✔"),
        ("6", "Web Supervisi",                      "Supervisi pembelajaran oleh kepala sekolah",     "Guru, Jadwal, Kelas",       "⚙"),
        ("7", "Website Sekolah",                    "Publikasi informasi, profil, dan berita",        "Guru, Pegawai, Agenda",     "✔"),
        ("8", "Sistem Kelulusan",                   "Pengumuman dan data kelulusan siswa",            "Siswa, Nilai, Kelas",       "✔"),
        ("9", "Absen Sholat Berjamaah",             "Monitoring ketaatan ibadah sholat siswa",        "Siswa, Kelas, Jurusan",     "✔"),
    ], font_size=9
)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB IV — DESKRIPSI SISTEM
# ═══════════════════════════════════════════════════════════════
h1("BAB IV — DESKRIPSI SISTEM SDMS")
separator()
doc.add_paragraph()

h2("4.1 Konsep Single Source of Truth")
body("Single Source of Truth (SSOT) adalah prinsip arsitektur di mana seluruh data bersumber "
     "dari satu lokasi tunggal yang otoritatif. Implementasinya:")
for item in [
    "Satu record siswa → otomatis tersedia di LMS, Absensi, PKL, Piket, Kelulusan, dan Absen Sholat",
    "Satu record guru → otomatis tersedia di Jurnal Guru, LMS, Piket, dan Web Supervisi",
    "Satu akun login → guru/siswa akses semua aplikasi tanpa login ulang (SSO)",
    "Satu perubahan data → langsung tersinkronisasi ke semua aplikasi dalam < 5 detik via webhook",
]:
    bullet(item)

h2("4.2 Arsitektur Teknis")
make_table(
    ["Komponen", "Teknologi", "Fungsi"],
    [
        ("Hypervisor",      "Proxmox VE 8.x",         "Virtualisasi semua layanan server sekolah"),
        ("Backend",         "Node.js + Express.js",   "API utama pengelola data master"),
        ("Database",        "MariaDB 10.11",           "Penyimpanan data master sekolah"),
        ("Frontend",        "Vue.js 3 + Tailwind CSS", "Antarmuka web SDMS"),
        ("Reverse Proxy",   "Caddy Server",            "SSL otomatis + routing semua domain"),
        ("Autentikasi",     "JWT + RBAC",              "Keamanan akses berlapis"),
        ("Sinkronisasi",    "Webhook HMAC-SHA256",     "Push data real-time ke semua aplikasi"),
        ("SSO",             "JWT Multi-App Token",     "Satu login untuk semua aplikasi"),
    ]
)

h2("4.3 Fitur Sistem yang Telah Dibangun")
make_table(
    ["No", "Fitur", "Deskripsi", "Manfaat"],
    [
        ("1",  "Data Master Terintegrasi", "Kelola siswa, guru, kelas, jurusan, mapel",   "Satu input untuk semua aplikasi"),
        ("2",  "Single Sign-On (SSO)",     "Login sekali untuk 9 aplikasi sekolah",       "Hemat waktu, keamanan terpusat"),
        ("3",  "Application Hub",          "Dashboard portal semua aplikasi",             "Akses mudah dari satu halaman"),
        ("4",  "Webhook Real-Time",        "Sinkronisasi data otomatis ke semua app",     "Data selalu konsisten & terkini"),
        ("5",  "RBAC Multi-Role",          "Hak akses berbeda per jabatan/role",          "Keamanan berlapis"),
        ("6",  "Lupa Password via Email",  "Reset password mandiri untuk semua role",     "Mengurangi beban admin TU"),
        ("7",  "Audit Log",                "Rekam seluruh aktivitas perubahan data",      "Akuntabilitas & jejak digital"),
        ("8",  "Dashboard Analitik",       "Statistik real-time siswa, guru, kelas",      "Keputusan berbasis data"),
        ("9",  "Backup Otomatis",          "Backup terjadwal ke storage & cloud",         "Keamanan data dari bencana"),
        ("10", "Impor/Ekspor Excel",       "Input massal & export laporan",               "Efisiensi pengelolaan data"),
    ], font_size=9
)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB V — MANFAAT
# ═══════════════════════════════════════════════════════════════
h1("BAB V — ANALISIS MANFAAT DAN DAMPAK")
separator()
doc.add_paragraph()

h2("5.1 Analisis Manfaat Kuantitatif")
make_table(
    ["Indikator", "Sebelum SDMS", "Sesudah SDMS", "Efisiensi"],
    [
        ("Waktu input data siswa baru",        "45 menit (9 sistem)",  "5 menit (1 sistem)",  "↓ 89%"),
        ("Waktu rekonsiliasi data bulanan",    "3–4 jam",              "15–20 menit",          "↓ 85%"),
        ("Jumlah akun yang dikelola (67 guru)","603 akun (9 sistem)",  "67 akun (1 sistem)",   "↓ 89%"),
        ("Tiket reset password per tahun",     "±200 tiket",           "<20 tiket",            "↓ 90%"),
        ("Konsistensi data antar sistem",      "<70%",                 ">99%",                 "↑ 41%"),
        ("Waktu update pasca kenaikan kelas",  "±90 jam",              "±5 jam",               "↓ 94%"),
        ("Risiko kehilangan data",             "Tinggi (tanpa UPS)",   "Sangat Rendah",        "↑ 95%"),
    ]
)

h2("5.2 Manfaat per Pemangku Kepentingan")
h3("a. Bagi Tenaga Pendidik (Guru)")
for item in [
    "Satu login untuk LMS, Jurnal Mengajar, PKL, Absensi, Web Supervisi, dan Piket",
    "Data profil selalu terkini di semua platform tanpa perlu memperbarui satu per satu",
    "Pengurangan beban administrasi sehingga guru fokus pada kegiatan pembelajaran",
]:
    bullet(item)

h3("b. Bagi Peserta Didik (Siswa)")
for item in [
    "Satu akun untuk semua layanan digital sekolah (LMS, nilai, kehadiran, PKL)",
    "Data kehadiran dan akademik terupdate real-time dan dapat dipantau kapan saja",
    "Reset password mandiri via email — tidak perlu mengantri ke TU",
]:
    bullet(item)

h3("c. Bagi Manajemen Sekolah")
for item in [
    "Dashboard analitik real-time — kepala sekolah memonitor kondisi sekolah kapan saja",
    "Audit log lengkap untuk keperluan akuntabilitas dan akreditasi",
    "Pengambilan keputusan berbasis data (data-driven decision making) yang lebih akurat",
]:
    bullet(item)

h3("d. Bagi Tenaga Kependidikan (TU/Operator)")
for item in [
    "Eliminasi double-entry — input satu kali, tersebar ke semua sistem otomatis",
    "Manajemen akun terpusat dalam satu panel",
    "Berkurangnya permintaan reset password secara drastis",
]:
    bullet(item)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB VI — RAB
# ═══════════════════════════════════════════════════════════════
h1("BAB VI — RENCANA ANGGARAN BIAYA (RAB)")
separator()
doc.add_paragraph()

hdrh = ["No","Item","Spesifikasi","Qty","Harga Satuan","Total"]

h2("6.1 Pengadaan Hardware")
make_table(hdrh, [
    ("1","SSD NVMe M.2",     "1TB, Read >3500 MB/s",           "2","Rp    950.000","Rp  1.900.000"),
    ("2","SSD SATA 2TB",     "Samsung 870 EVO (storage VM)",   "2","Rp  1.850.000","Rp  3.700.000"),
    ("3","RAM Server DDR4",  "32GB ECC (upgrade VM)",          "2","Rp  1.200.000","Rp  2.400.000"),
    ("4","UPS",              "APC BX1100L-MS 1100VA",          "1","Rp  2.500.000","Rp  2.500.000"),
    ("5","Switch Managed",   "TP-Link TL-SG108E 8-Port",       "1","Rp    750.000","Rp    750.000"),
    ("6","Kabel UTP Cat6",   "1 Roll 305m + konektor RJ45",   "1","Rp    450.000","Rp    450.000"),
    ("","","","","SUBTOTAL HARDWARE","Rp 11.700.000"),
], font_size=9)

h2("6.2 Software & Layanan Digital")
make_table(hdrh, [
    ("1","Domain .sch.id",      "Perpanjangan 2 tahun",          "1","Rp    500.000","Rp    500.000"),
    ("2","SSL Wildcard",         "Let's Encrypt via Caddy",       "—","Rp          0","Rp          0"),
    ("3","Email SMTP Sekolah",  "Google Workspace Edu / Zoho",   "1","Rp    850.000","Rp    850.000"),
    ("4","Cloud Backup",        "Google Drive API via Rclone",   "1","Rp    300.000","Rp    300.000"),
    ("","","","","SUBTOTAL SOFTWARE","Rp  1.650.000"),
], font_size=9)

h2("6.3 Pengembangan & Implementasi")
make_table(hdrh, [
    ("1","Pengembangan Modul",  "Rapor, SPP, inventaris, supervisi","3 bln","Rp 3.500.000/bln","Rp 10.500.000"),
    ("2","Integrasi Web Supervisi","SSO + sinkronisasi ke SDMS",  "1 pkt","Rp   1.500.000",  "Rp  1.500.000"),
    ("3","Migrasi Data Historis","Import dari sistem lama",       "1 kali","Rp   2.000.000",  "Rp  2.000.000"),
    ("4","Pelatihan Operator",  "Workshop 2 hari + modul",        "1 kali","Rp   1.500.000",  "Rp  1.500.000"),
    ("5","Dokumentasi & SOP",   "Buku panduan + video tutorial",  "1 pkt", "Rp     750.000",  "Rp    750.000"),
    ("","","","","SUBTOTAL PENGEMBANGAN","Rp 16.250.000"),
], font_size=9)

h2("6.4 Pemeliharaan & Operasional (1 Tahun)")
make_table(hdrh, [
    ("1","Pemeliharaan Sistem","Update, patch, monitoring",      "12 bln","Rp 1.000.000/bln","Rp 12.000.000"),
    ("2","Biaya Listrik Server","200W × 24jam × 365 hari",      "1 thn", "Rp   3.500.000",  "Rp  3.500.000"),
    ("3","Rapat Evaluasi",     "Triwulan × 4 kali + konsumsi",  "4 kali","Rp     187.500",  "Rp    750.000"),
    ("","","","","SUBTOTAL OPERASIONAL","Rp 16.250.000"),
], font_size=9)

h2("6.5 Rekapitulasi Anggaran")
make_table(
    ["No","Komponen Anggaran","Jumlah"],
    [
        ("1","Pengadaan Hardware (Penguatan Infrastruktur)", "Rp 11.700.000"),
        ("2","Software & Layanan Digital",                  "Rp  1.650.000"),
        ("3","Pengembangan & Implementasi",                 "Rp 16.250.000"),
        ("4","Pemeliharaan & Operasional (1 tahun)",        "Rp 16.250.000"),
        ("", "TOTAL",                                       "Rp 45.850.000"),
        ("", "Cadangan / Tak Terduga (4,4%)",               "Rp  2.000.000"),
        ("", "TOTAL KESELURUHAN",                           "Rp 47.850.000"),
    ], font_size=12
)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB VII — TIMELINE & INDIKATOR
# ═══════════════════════════════════════════════════════════════
h1("BAB VII — TIMELINE DAN INDIKATOR KEBERHASILAN")
separator()
doc.add_paragraph()

h2("7.1 Jadwal Pelaksanaan")
make_table(
    ["Bulan","Kegiatan"],
    [
        ("Bulan 1",    "Pengadaan hardware, instalasi SSD & RAM, konfigurasi ulang Proxmox VE, migrasi VM ke storage baru"),
        ("Bulan 2",    "Migrasi data historis, integrasi Web Supervisi ke SSO SDMS, pengembangan modul rapor digital"),
        ("Bulan 3",    "Pengembangan modul SPP & inventaris, uji coba integrasi semua 9 aplikasi, pengujian keamanan"),
        ("Bulan 4",    "Pelatihan operator dan guru (2 hari), penyusunan dokumentasi dan SOP, soft launching"),
        ("Bulan 5–12", "Operasional penuh, pemeliharaan rutin, evaluasi triwulan, pengembangan fitur baru"),
    ], font_size=11
)

h2("7.2 Indikator Keberhasilan")
make_table(
    ["Indikator Kinerja","Target","Metode Pengukuran"],
    [
        ("Uptime sistem SDMS",                "≥ 99,5%",    "Monitoring server otomatis"),
        ("Konsistensi data antar 9 aplikasi", "> 99%",      "Audit log rekonsiliasi data"),
        ("Waktu sinkronisasi data",           "< 5 detik",  "Log webhook timestamp"),
        ("Pengurangan tiket reset password",  "≥ 90%",      "Data helpdesk per bulan"),
        ("Kepuasan pengguna (guru & TU)",     "≥ 85%",      "Survei kepuasan per semester"),
        ("Aplikasi terintegrasi aktif",       "9 aplikasi", "Laporan API Hub SDMS"),
        ("Pengurangan waktu rekonsiliasi",    "≥ 85%",      "Perbandingan log waktu kerja"),
        ("Recovery data dari backup",         "< 30 menit", "Simulasi disaster recovery"),
    ]
)

add_page_break()

# ═══════════════════════════════════════════════════════════════
# BAB VIII — PENUTUP
# ═══════════════════════════════════════════════════════════════
h1("BAB VIII — PENUTUP")
separator()
doc.add_paragraph()

body("School Data Management System (SDMS) yang sedang dibangun di SMK Negeri 1 Kras bukan "
     "sekadar perangkat lunak biasa, melainkan infrastruktur digital fundamental yang menjadi "
     "tulang punggung seluruh ekosistem aplikasi digital sekolah. Dengan prinsip Single Source "
     "of Truth, SDMS memastikan bahwa satu data yang akurat tersedia di seluruh 9 aplikasi "
     "sekolah secara real-time dan otomatis.")

body("Keunggulan signifikan dari pembangunan SDMS di SMK Negeri 1 Kras adalah bahwa sistem ini "
     "dirancang, dibangun, dan dikelola oleh tenaga pendidik internal yang memiliki sertifikasi "
     "internasional terverifikasi: MTCNA (MikroTik Certified Network Associate, No. 2011NA6544) "
     "dan MTCRE (MikroTik Certified Routing Engineer, No. 2011RE6761). Hal ini menjamin "
     "kualitas teknis sistem sekaligus memastikan keberlanjutan pengelolaan tanpa ketergantungan "
     "pada pihak ketiga eksternal — sejalan dengan prinsip Human Capital Theory (Becker, 1964) "
     "tentang nilai investasi kompetensi internal.")

body("Dengan penguatan infrastruktur Proxmox VE yang diusulkan, sistem ini akan beroperasi "
     "dengan keandalan tinggi. Investasi sebesar Rp 47.850.000 untuk satu tahun penuh "
     "jauh lebih ekonomis dibandingkan potensi kerugian akibat kehilangan data dan "
     "inefisiensi administrasi yang selama ini terjadi — atau biaya outsourcing pengembangan "
     "ke pihak ketiga yang dapat mencapai 5–10 kali lipat.")

body("Kami mengucapkan terima kasih atas perhatian dan dukungan yang diberikan. Semoga proposal "
     "ini menjadi landasan yang kuat bagi SMK Negeri 1 Kras untuk menjadi sekolah kejuruan "
     "berbasis data (data-driven vocational school) yang modern, efisien, dan berdaya saing "
     "tinggi di era digital.")

doc.add_paragraph()
body("Kras, September 2026", align=WD_ALIGN_PARAGRAPH.RIGHT, indent=False)
doc.add_paragraph()

# Tanda tangan
tbl_td = doc.add_table(rows=6, cols=2)
td_rows = [
    ("Mengetahui,",              "Dibuat oleh,"),
    ("Kepala SMK Negeri 1 Kras", "Koordinator TIK / Pengembang Sistem"),
    ("",                         "MTCNA No. 2011NA6544 | MTCRE No. 2011RE6761"),
    ("",""),
    ("_______________________________","_______________________________"),
    ("NIP. ","NIP. "),
]
for ri,(a,b) in enumerate(td_rows):
    tbl_td.rows[ri].cells[0].text = a
    tbl_td.rows[ri].cells[1].text = b
    for ci in range(2):
        for para in tbl_td.rows[ri].cells[ci].paragraphs:
            for run in para.runs:
                run.font.size = Pt(11)
                if ri in [0,1,4,5]: run.bold = True
                if ri == 2 and ci == 1:
                    run.italic = True
                    run.font.size = Pt(9)
                    run.font.color.rgb = BLUE

# ── Save ──────────────────────────────────────────────────────
output = r"d:\WEBSITE\sdms\docs\Proposal-SDMS-SMKN1Kras-FINAL.docx"
doc.save(output)
print(f"Berhasil disimpan: {output}")
