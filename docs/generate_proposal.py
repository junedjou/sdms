from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Page margins ──────────────────────────────────────────────
section = doc.sections[0]
section.top_margin    = Cm(3)
section.bottom_margin = Cm(3)
section.left_margin   = Cm(4)
section.right_margin  = Cm(3)

# ── Helpers ───────────────────────────────────────────────────
def h1(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0x1e, 0x40, 0xaf)
    return p

def h2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(0x1e, 0x40, 0xaf)
    return p

def h3(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(12)
    return p

def body(text, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    run = p.add_run(text)
    run.font.size = Pt(12)
    run.bold  = bold
    run.italic = italic
    return p

def bullet(text):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.add_run(text)
    run.font.size = Pt(12)
    return p

def separator():
    doc.add_paragraph('─' * 70)

def table_style(tbl):
    tbl.style = 'Table Grid'
    for row in tbl.rows:
        for cell in row.cells:
            for para in cell.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(10)

# ═══════════════════════════════════════════════════════════════
# HALAMAN JUDUL
# ═══════════════════════════════════════════════════════════════
doc.add_paragraph()
h1("PROPOSAL PENGAJUAN DANA")
h1("Pembangunan School Data Management System (SDMS)")
h1("SMK Negeri 1 Kras — Tahun Anggaran 2026/2027")
doc.add_paragraph()
separator()
doc.add_paragraph()

# Lembar pengesahan
h2("LEMBAR PENGESAHAN")
tbl = doc.add_table(rows=5, cols=2)
data = [
    ("Nama Kegiatan",    "Pembangunan dan Pengembangan School Data Management System (SDMS)"),
    ("Unit Kerja",       "SMK Negeri 1 Kras, Kabupaten Kediri"),
    ("Anggaran Diajukan","Rp 47.850.000,-"),
    ("Sumber Dana",      "Dana BOS / BOP / APBD Kabupaten Kediri"),
    ("Tahun Anggaran",   "2026/2027"),
]
for i, (k, v) in enumerate(data):
    tbl.rows[i].cells[0].text = k
    tbl.rows[i].cells[1].text = v
    for cell in tbl.rows[i].cells:
        for para in cell.paragraphs:
            for run in para.runs:
                run.font.size = Pt(11)
table_style(tbl)
doc.add_paragraph()

# ═══════════════════════════════════════════════════════════════
# BAB I
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB I — PENDAHULUAN")
h3("1.1 Latar Belakang")
body(
    "Pengelolaan data pendidikan yang efisien merupakan fondasi utama dalam mewujudkan "
    "tata kelola sekolah yang baik (good school governance). Dalam konteks Revolusi "
    "Industri 4.0 dan era transformasi digital pendidikan, sekolah dituntut mampu "
    "mengelola data secara terintegrasi, akurat, dan real-time sebagaimana diamanatkan dalam:"
)
for item in [
    "Permendikbud No. 79 Tahun 2015 tentang Data Pokok Pendidikan (Dapodik)",
    "Perpres No. 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)",
    "Renstra Kemendikbudristek 2020–2024 yang menekankan transformasi digital satuan pendidikan",
    "PP No. 57 Tahun 2021 tentang Standar Nasional Pendidikan, khususnya terkait sistem informasi manajemen sekolah",
]:
    bullet(item)

body(
    "SMK Negeri 1 Kras saat ini mengelola lebih dari 1.200 siswa aktif, 67 tenaga pendidik, "
    "dan ratusan data akademik yang tersebar di berbagai aplikasi tidak terintegrasi. "
    "Kondisi ini menyebabkan:"
)
for item in [
    "Redundansi data — data siswa diinput berulang di berbagai platform (Dapodik, LMS, absensi, PKL)",
    "Inkonsistensi data — perbedaan data antar sistem akibat tidak adanya sumber data tunggal (single source of truth)",
    "Inefisiensi administratif — tenaga kependidikan menghabiskan waktu berlebih untuk rekonsiliasi data manual",
    "Kelemahan keamanan — tidak adanya sistem autentikasi terpusat menyebabkan pengelolaan akun tidak terkontrol",
]:
    bullet(item)

h3("1.2 Dasar Akademis")
body(
    "Penelitian oleh Laudon & Laudon (2020) dalam Management Information Systems menegaskan "
    "bahwa integrasi sistem informasi di institusi pendidikan terbukti meningkatkan efisiensi "
    "operasional hingga 40% dan mengurangi kesalahan data hingga 60%. Sementara penelitian "
    "Heeks (2017) tentang e-Government di sektor pendidikan menunjukkan bahwa sistem informasi "
    "terpusat berkontribusi signifikan terhadap peningkatan akuntabilitas dan transparansi "
    "pengelolaan data akademik."
)
body(
    "Konsep Single Sign-On (SSO) yang diimplementasikan dalam SDMS sejalan dengan standar "
    "ISO/IEC 27001 tentang keamanan informasi dan NIST SP 800-63 tentang manajemen identitas digital."
)

# ═══════════════════════════════════════════════════════════════
# BAB II
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB II — DESKRIPSI SISTEM")
h3("2.1 Tentang SDMS (School Data Management System)")
body(
    "SDMS adalah platform manajemen data sekolah terintegrasi berbasis web yang dibangun "
    "dengan arsitektur modern menggunakan Node.js + Express.js + Sequelize ORM untuk backend, "
    "MariaDB sebagai database, Vue.js 3 + Tailwind CSS untuk frontend, serta Proxmox VE "
    "sebagai platform virtualisasi server. Keamanan sistem menggunakan JWT Authentication, "
    "RBAC (Role-Based Access Control), dan HMAC-SHA256 untuk webhook signature."
)

h3("2.2 Fitur Utama yang Sudah Dibangun")
headers = ["No", "Fitur", "Keterangan"]
rows = [
    ("1", "Manajemen Data Master",   "Data siswa, guru, pegawai, kelas, jurusan, mapel"),
    ("2", "Single Sign-On (SSO)",    "Login sekali untuk akses semua aplikasi"),
    ("3", "Application Hub",         "Portal terpusat ke LMS, Absensi, PKL, Piket, dll"),
    ("4", "API Hub & Webhook",       "Sinkronisasi real-time data ke semua aplikasi satelit"),
    ("5", "Manajemen User & Role",   "RBAC untuk superadmin, admin, guru, siswa"),
    ("6", "Lupa Password",           "Reset password via email untuk semua role"),
    ("7", "Audit Log",               "Pencatatan semua perubahan data"),
    ("8", "Dashboard Analitik",      "Statistik siswa, guru, kelas secara real-time"),
    ("9", "Backup Database",         "Backup otomatis terjadwal"),
    ("10","Kalender Akademik",       "Manajemen agenda sekolah"),
]
tbl2 = doc.add_table(rows=len(rows)+1, cols=3)
for i, h in enumerate(headers):
    cell = tbl2.rows[0].cells[i]
    cell.text = h
    for run in cell.paragraphs[0].runs:
        run.bold = True
        run.font.size = Pt(10)
for ri, (n, f, k) in enumerate(rows, 1):
    tbl2.rows[ri].cells[0].text = n
    tbl2.rows[ri].cells[1].text = f
    tbl2.rows[ri].cells[2].text = k
table_style(tbl2)
doc.add_paragraph()

# ═══════════════════════════════════════════════════════════════
# BAB III
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB III — KONDISI INFRASTRUKTUR SAAT INI & PERMASALAHAN")
h3("3.1 Kondisi Server Saat Ini")
hdrs3 = ["Komponen", "Kondisi Saat Ini", "Keterangan"]
rows3 = [
    ("Processor",  "Intel Core i5 gen lama",          "Tidak mendukung virtualisasi optimal"),
    ("RAM",        "28 GB",                            "Kurang untuk menjalankan banyak VM"),
    ("Storage",    "2 disk HDD (1 disk sudah rusak)",  "KRITIS — disk 476GB tidak terdeteksi"),
    ("OS",         "Proxmox VE",                       "Sudah terinstall"),
    ("UPS",        "Tidak ada",                        "Rentan mati listrik mendadak"),
    ("Backup",     "Manual",                           "Tidak ada backup otomatis"),
]
tbl3 = doc.add_table(rows=len(rows3)+1, cols=3)
for i, h in enumerate(hdrs3):
    tbl3.rows[0].cells[i].text = h
    for run in tbl3.rows[0].cells[i].paragraphs[0].runs:
        run.bold = True; run.font.size = Pt(10)
for ri, (a,b,c) in enumerate(rows3,1):
    tbl3.rows[ri].cells[0].text = a
    tbl3.rows[ri].cells[1].text = b
    tbl3.rows[ri].cells[2].text = c
table_style(tbl3)
doc.add_paragraph()

h3("3.2 Insiden yang Telah Terjadi")
body(
    "Pada September 2026, terjadi insiden kritis: disk kedua server Proxmox (476GB) "
    "mengalami kegagalan fisik, menyebabkan MariaDB tidak dapat berjalan akibat I/O Error. "
    "Data berhasil diselamatkan dengan prosedur darurat menggunakan RAM sebagai media sementara, "
    "namun server tetap tidak stabil. Insiden ini menunjukkan risiko kehilangan data sangat tinggi "
    "akibat infrastruktur yang tidak memadai.", bold=False, italic=True
)

# ═══════════════════════════════════════════════════════════════
# BAB IV — RAB
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB IV — RENCANA ANGGARAN BIAYA (RAB)")

h3("4.1 Kebutuhan Hardware")
hdrs4 = ["No","Item","Spesifikasi","Qty","Harga Satuan","Total"]
rows4 = [
    ("1","SSD NVMe M.2",  "Samsung 870 EVO / WD Blue 1TB", "2", "Rp    950.000", "Rp  1.900.000"),
    ("2","SSD SATA 2TB",  "Samsung 870 EVO (storage VM)",  "2", "Rp  1.850.000", "Rp  3.700.000"),
    ("3","RAM Server",    "DDR4 ECC 32GB",                 "2", "Rp  1.200.000", "Rp  2.400.000"),
    ("4","UPS",           "APC BX1100L-MS 1100VA",         "1", "Rp  2.500.000", "Rp  2.500.000"),
    ("5","Switch Managed","TP-Link TL-SG108E 8-Port",      "1", "Rp    750.000", "Rp    750.000"),
    ("6","Kabel UTP Cat6","1 Roll 305m + konektor",        "1", "Rp    450.000", "Rp    450.000"),
    ("", "","","","Subtotal Hardware",                          "Rp 11.700.000"),
]
tbl4 = doc.add_table(rows=len(rows4)+1, cols=6)
for i,h in enumerate(hdrs4):
    tbl4.rows[0].cells[i].text = h
    for run in tbl4.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(9)
for ri,r in enumerate(rows4,1):
    for ci,v in enumerate(r):
        tbl4.rows[ri].cells[ci].text = v
        for run in tbl4.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size=Pt(9)
            if "Subtotal" in v or "Rp 11" in v:
                run.bold = True
table_style(tbl4)
doc.add_paragraph()

h3("4.2 Kebutuhan Software & Lisensi")
rows4b = [
    ("1","Domain .sch.id",       "Perpanjangan 2 tahun",         "1 paket","Rp 500.000","Rp    500.000"),
    ("2","SSL Wildcard",          "Let's Encrypt (gratis)",       "-",      "Rp       0","Rp          0"),
    ("3","Email SMTP Bisnis",     "Google Workspace / Zoho",      "1 tahun","Rp 850.000","Rp    850.000"),
    ("4","Backup Cloud Storage",  "Google Drive API / Rclone",    "1 tahun","Rp 300.000","Rp    300.000"),
    ("","","","","Subtotal Software",                                        "Rp  1.650.000"),
]
tbl4b = doc.add_table(rows=len(rows4b)+1, cols=6)
for i,h in enumerate(hdrs4):
    tbl4b.rows[0].cells[i].text = h
    for run in tbl4b.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(9)
for ri,r in enumerate(rows4b,1):
    for ci,v in enumerate(r):
        tbl4b.rows[ri].cells[ci].text = v
        for run in tbl4b.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size=Pt(9)
            if "Subtotal" in v or "1.650" in v: run.bold=True
table_style(tbl4b)
doc.add_paragraph()

h3("4.3 Kebutuhan Pengembangan & Implementasi")
rows4c = [
    ("1","Pengembangan Fitur","Modul rapor, SPP, inventaris",       "3 bulan","Rp 3.500.000/bln","Rp 10.500.000"),
    ("2","Migrasi Data",      "Import data historis",               "1 kali", "Rp   2.000.000",  "Rp  2.000.000"),
    ("3","Pelatihan Operator","Admin & tendik (2 hari)",            "1 kali", "Rp   1.500.000",  "Rp  1.500.000"),
    ("4","Dokumentasi Teknis","Manual penggunaan & SOP",            "1 paket","Rp     750.000",  "Rp    750.000"),
    ("5","Uji Coba & Evaluasi","QA testing & bug fixing",           "1 bulan","Rp   1.500.000",  "Rp  1.500.000"),
    ("","","","","Subtotal Pengembangan",                                                         "Rp 16.250.000"),
]
tbl4c = doc.add_table(rows=len(rows4c)+1, cols=6)
for i,h in enumerate(hdrs4):
    tbl4c.rows[0].cells[i].text = h
    for run in tbl4c.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(9)
for ri,r in enumerate(rows4c,1):
    for ci,v in enumerate(r):
        tbl4c.rows[ri].cells[ci].text = v
        for run in tbl4c.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size=Pt(9)
            if "Subtotal" in v or "16.250" in v: run.bold=True
table_style(tbl4c)
doc.add_paragraph()

h3("4.4 Pemeliharaan & Operasional (1 Tahun)")
rows4d = [
    ("1","Pemeliharaan Sistem","Update, patch, monitoring",  "12 bulan","Rp 1.000.000/bln","Rp 12.000.000"),
    ("2","Listrik Server",     "200W × 24jam × 365 hari",   "1 tahun", "Rp   3.500.000",  "Rp  3.500.000"),
    ("3","Internet Dedicated", "Min 20 Mbps (sudah ada)",   "12 bulan","Rp           0",  "Rp          0"),
    ("4","Rapat Evaluasi",     "Triwulan × 4 kali",         "4 kali",  "Rp     187.500",  "Rp    750.000"),
    ("","","","","Subtotal Operasional",                                                    "Rp 16.250.000"),
]
tbl4d = doc.add_table(rows=len(rows4d)+1, cols=6)
for i,h in enumerate(hdrs4):
    tbl4d.rows[0].cells[i].text = h
    for run in tbl4d.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(9)
for ri,r in enumerate(rows4d,1):
    for ci,v in enumerate(r):
        tbl4d.rows[ri].cells[ci].text = v
        for run in tbl4d.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size=Pt(9)
            if "Subtotal" in v or "16.250" in v: run.bold=True
table_style(tbl4d)
doc.add_paragraph()

h3("4.5 REKAPITULASI RAB")
rekap = [
    ("1","Hardware",                    "Rp 11.700.000"),
    ("2","Software & Lisensi",          "Rp  1.650.000"),
    ("3","Pengembangan & Implementasi", "Rp 16.250.000"),
    ("4","Pemeliharaan & Operasional",  "Rp 16.250.000"),
    ("", "TOTAL",                       "Rp 45.850.000"),
    ("", "Cadangan 4,4%",               "Rp  2.000.000"),
    ("", "TOTAL KESELURUHAN",           "Rp 47.850.000"),
]
tblr = doc.add_table(rows=len(rekap)+1, cols=3)
for i,h in enumerate(["No","Komponen","Jumlah"]):
    tblr.rows[0].cells[i].text = h
    for run in tblr.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(11)
for ri,(n,k,j) in enumerate(rekap,1):
    tblr.rows[ri].cells[0].text = n
    tblr.rows[ri].cells[1].text = k
    tblr.rows[ri].cells[2].text = j
    for ci in range(3):
        for run in tblr.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size = Pt(11)
            if "TOTAL" in k: run.bold = True
table_style(tblr)
doc.add_paragraph()

# ═══════════════════════════════════════════════════════════════
# BAB V
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB V — MANFAAT DAN DAMPAK")
h3("5.1 Manfaat Akademis")
for item in [
    "Efisiensi Administrasi — Pengurangan waktu penginputan data berulang hingga estimasi 15 jam/minggu per operator",
    "Akurasi Data — Satu sumber data tunggal (single source of truth) menghilangkan inkonsistensi antar sistem",
    "Keamanan Akun — SSO + RBAC memastikan setiap pengguna hanya mengakses data sesuai wewenang",
    "Transparansi — Audit log mencatat setiap perubahan data, mendukung akuntabilitas",
    "Kemudahan Pelaporan — Data terintegrasi memudahkan penyusunan laporan BOS, Dapodik, dan akreditasi",
]:
    bullet(item)

h3("5.2 Indikator Keberhasilan")
hdri = ["Indikator","Target"]
rowsi = [
    ("Waktu rekonsiliasi data",  "Turun dari 3 jam → 15 menit"),
    ("Kesalahan input data",     "Turun ≥ 80%"),
    ("Kepuasan operator",        "≥ 85% (survei)"),
    ("Uptime sistem",            "≥ 99,5%"),
    ("Integrasi aplikasi aktif", "Minimal 5 aplikasi"),
]
tbli = doc.add_table(rows=len(rowsi)+1, cols=2)
for i,h in enumerate(hdri):
    tbli.rows[0].cells[i].text = h
    for run in tbli.rows[0].cells[i].paragraphs[0].runs:
        run.bold=True; run.font.size=Pt(11)
for ri,(a,b) in enumerate(rowsi,1):
    tbli.rows[ri].cells[0].text = a
    tbli.rows[ri].cells[1].text = b
    for ci in range(2):
        for run in tbli.rows[ri].cells[ci].paragraphs[0].runs:
            run.font.size=Pt(11)
table_style(tbli)
doc.add_paragraph()

# ═══════════════════════════════════════════════════════════════
# BAB VI — TIMELINE
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB VI — TIMELINE PELAKSANAAN")
rowst = [
    ("Bulan 1",   "Pengadaan hardware, instalasi SSD, konfigurasi Proxmox"),
    ("Bulan 2",   "Migrasi data, pengembangan fitur lanjutan (modul rapor)"),
    ("Bulan 3",   "Pengembangan fitur (SPP, inventaris), uji coba internal"),
    ("Bulan 4",   "Pelatihan operator, dokumentasi, soft launching"),
    ("Bulan 5–12","Operasional penuh, pemeliharaan, evaluasi berkala"),
]
tblt = doc.add_table(rows=len(rowst)+1, cols=2)
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
table_style(tblt)
doc.add_paragraph()

# ═══════════════════════════════════════════════════════════════
# BAB VII — PENUTUP
# ═══════════════════════════════════════════════════════════════
separator()
h2("BAB VII — PENUTUP")
body(
    "Pembangunan SDMS di SMK Negeri 1 Kras merupakan langkah strategis dalam mewujudkan "
    "transformasi digital pendidikan yang diamanatkan pemerintah. Sistem ini tidak hanya "
    "meningkatkan efisiensi administrasi, tetapi juga memperkuat fondasi data yang akurat "
    "sebagai basis pengambilan keputusan pendidikan yang berkualitas."
)
body(
    "Dengan infrastruktur Proxmox VE yang sudah berjalan dan sistem SDMS yang telah "
    "dikembangkan secara bertahap, investasi yang diperlukan lebih berfokus pada penguatan "
    "infrastruktur hardware dan pengembangan fitur lanjutan — bukan membangun dari nol. "
    "Kami memohon dukungan dan persetujuan atas pengajuan anggaran ini demi terwujudnya "
    "SMK Negeri 1 Kras sebagai sekolah berbasis data (data-driven school) yang modern, "
    "efisien, dan akuntabel."
)
doc.add_paragraph()
body("Kras, September 2026", align=WD_ALIGN_PARAGRAPH.RIGHT)
doc.add_paragraph()

# Tanda tangan
tbls = doc.add_table(rows=5, cols=2)
tbls.rows[0].cells[0].text = "Mengetahui,"
tbls.rows[0].cells[1].text = "Dibuat oleh,"
tbls.rows[1].cells[0].text = "Kepala SMK Negeri 1 Kras"
tbls.rows[1].cells[1].text = "Koordinator TIK / Pengembang Sistem"
tbls.rows[2].cells[0].text = ""
tbls.rows[3].cells[0].text = "_______________________________"
tbls.rows[3].cells[1].text = "_______________________________"
tbls.rows[4].cells[0].text = "NIP."
tbls.rows[4].cells[1].text = "NIP."
for row in tbls.rows:
    for cell in row.cells:
        for para in cell.paragraphs:
            for run in para.runs:
                run.font.size = Pt(11)

# ── Save ──────────────────────────────────────────────────────
output = r"d:\WEBSITE\sdms\docs\Proposal-SDMS-SMKN1Kras.docx"
doc.save(output)
print(f"File berhasil disimpan: {output}")
