const XLSX = require('xlsx');
const { Op } = require('sequelize');
const {
  Guru, Siswa, Pegawai, Kelas, Jurusan, MataPelajaran,
  TahunPelajaran, User, Role,
} = require('../models');
const { hashPassword } = require('../utils/helpers');
const { writeAuditLog } = require('../middleware/auditLog');
const { success, badRequest, error: serverError } = require('../utils/response');
const { syncEvent } = require('../services/syncService');
const logger = require('../utils/logger');

// ── Helpers ──────────────────────────────────────────────────

/** Baca buffer Excel → array of plain objects (row 1 = header) */
const parseExcel = (buffer) => {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
};

/** Konversi value ke string bersih, atau null jika kosong */
const str = (v) => (v !== null && v !== undefined && String(v).trim() !== '' ? String(v).trim() : null);

/** Konversi tanggal Excel (number/string/Date) ke YYYY-MM-DD atau null */
const dateStr = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (!s) return null;
  // format DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  // format YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Excel serial number
  if (/^\d+$/.test(s)) {
    const d = XLSX.SSF.parse_date_code(parseInt(s));
    if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
  }
  return null;
};

/** Normalise jenis kelamin: L/P */
const normJK = (v) => {
  const s = str(v)?.toUpperCase();
  if (!s) return null;
  if (s === 'L' || s.startsWith('L') || s === 'LAKI') return 'L';
  if (s === 'P' || s.startsWith('P') || s === 'PEREMPUAN') return 'P';
  return null;
};

/** Buat workbook Excel dengan satu sheet berisi data + styling header */
const buildWorkbook = (sheetName, headers, rows) => {
  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Lebar kolom otomatis
  ws['!cols'] = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[i] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

/** Kirim file Excel sebagai response download */
const sendExcel = (res, buffer, filename) => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  res.end(buffer);
};

// ============================================================
// GURU — Export & Import
// ============================================================

const GURU_HEADERS = [
  'nama','nip','niy','jenis_kelamin','status_kepegawaian',
  'jabatan','jurusan_kode','no_hp','email',
  'tempat_lahir','tanggal_lahir','agama','alamat',
];
const GURU_LABELS = [
  'Nama Lengkap*','NIP','NIY','Jenis Kelamin (L/P)*','Status Kepegawaian',
  'Jabatan','Mata Pelajaran','Kode Jurusan','No HP','Email',
  'Tempat Lahir','Tanggal Lahir (YYYY-MM-DD)','Agama','Alamat',
];

const exportGuru = async (req, res) => {
  const rows = await Guru.findAll({
    where: { is_active: true },
    include: [{ association: 'jurusan', attributes: ['kode'] }],
    order: [['nama', 'ASC']],
  });
  const data = rows.map(g => [
    g.nama, g.nip||'', g.niy||'', g.jenis_kelamin||'',
    g.status_kepegawaian||'', g.jabatan||'', g.mata_pelajaran||'',
    g.jurusan?.kode||'', g.no_hp||'', g.email||'',
    g.tempat_lahir||'', g.tanggal_lahir ? String(g.tanggal_lahir).slice(0,10) : '',
    g.agama||'', g.alamat||'',
  ]);
  const buf = buildWorkbook('Guru', GURU_LABELS, data);
  sendExcel(res, buf, `data_guru_${Date.now()}.xlsx`);
};

const templateGuru = async (req, res) => {
  const sample = [['Budi Santoso','196001011990011001','','L','PNS','Wali Kelas','Matematika','TKJ','08123456789','budi@sekolah.sch.id','Jakarta','1960-01-01','Islam','Jl. Merdeka No.1']];
  const buf = buildWorkbook('Guru', GURU_LABELS, sample);
  sendExcel(res, buf, 'template_import_guru.xlsx');
};

const importGuru = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');
  const jurusanList = await Jurusan.findAll({ where: { is_active: true } });
  const jurusanMap  = Object.fromEntries(jurusanList.map(j => [j.kode.toUpperCase(), j.id]));

  const rows   = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r   = rows[i];
    const row = i + 2; // baris Excel (1=header)
    const nama = str(r['Nama Lengkap*'] ?? r['nama']);
    const jk   = normJK(r['Jenis Kelamin (L/P)*'] ?? r['jenis_kelamin']);
    if (!nama) { errors.push({ row, field: 'nama', message: 'Nama wajib diisi' }); continue; }

    const kodeJurusan = str(r['Kode Jurusan'] ?? r['jurusan_kode'])?.toUpperCase();
    const jurusan_id  = kodeJurusan ? jurusanMap[kodeJurusan] : null;
    if (kodeJurusan && !jurusan_id) {
      errors.push({ row, field: 'jurusan_kode', message: `Kode jurusan '${kodeJurusan}' tidak ditemukan` });
    }

    const nip = str(r['NIP'] ?? r['nip']);
    const niy = str(r['NIY'] ?? r['niy']);
    if (nip) {
      const dup = await Guru.findOne({ where: { nip } });
      if (dup) { errors.push({ row, field: 'nip', message: `NIP ${nip} sudah terdaftar` }); continue; }
    }

    try {
      const guru = await Guru.create({
        nama, nip, niy, jenis_kelamin: jk,
        status_kepegawaian: str(r['Status Kepegawaian'] ?? r['status_kepegawaian']),
        jabatan:       str(r['Jabatan']          ?? r['jabatan']),
        mata_pelajaran: str(r['Mata Pelajaran']  ?? r['mata_pelajaran']),
        jurusan_id,
        no_hp:        str(r['No HP']             ?? r['no_hp']),
        email:        str(r['Email']             ?? r['email']),
        tempat_lahir: str(r['Tempat Lahir']      ?? r['tempat_lahir']),
        tanggal_lahir: dateStr(r['Tanggal Lahir (YYYY-MM-DD)'] ?? r['tanggal_lahir']),
        agama:        str(r['Agama']             ?? r['agama']),
        alamat:       str(r['Alamat']            ?? r['alamat']),
      });
      syncEvent('guru.created', guru.toJSON());
      ok.push(nama);
    } catch (e) {
      errors.push({ row, field: '-', message: e.message });
    }
  }

  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'IMPORT', resource: 'guru', description: `Import guru: ${ok.length} berhasil, ${errors.length} gagal` });
  return success(res, { imported: ok.length, errors }, `${ok.length} guru berhasil diimport, ${errors.length} gagal`);
};

// ============================================================
// SISWA — Export & Import
// ============================================================

// Urutan & label kolom SAMA dengan form input UI
const SISWA_LABELS = [
  'Nama Lengkap*',          // form: Nama Lengkap
  'NISN',                   // form: NISN
  'NIS',                    // form: NIS
  'Jenis Kelamin (L/P)*',   // form: Jenis Kelamin (L=Laki-laki, P=Perempuan)
  'Kelas',                  // form: Kelas (nama kelas, contoh: X TKJ 1)
  'Kode Jurusan',           // form: Jurusan (kode, contoh: TKJ)
  'Tahun Masuk',            // form: Tahun Masuk
  'Status',                 // form: Status (Aktif/Lulus/Pindah/Keluar)
  'Tempat Lahir',           // form: Tempat Lahir
  'Tanggal Lahir',          // form: Tanggal Lahir (format: YYYY-MM-DD)
  'Agama',                  // form: Agama
  'No. HP Siswa',           // form: No. HP
  'Alamat',                 // form: Alamat
  'Nama Ayah',              // form: Nama Ayah
  'Nama Ibu',               // form: Nama Ibu
  'No. HP Orang Tua/Wali',  // form: No. HP Orang Tua / Wali
  'Pernah Dapat Bantuan',   // form: Pernah Dapat Bantuan (1=Ya, 0=Tidak)
];

// Kolom DB — fallback jika migration belum dijalankan
const SISWA_EXPORT_SAFE_ATTRS = [
  'id','nisn','nis','nama','jenis_kelamin','kelas_id','jurusan_id',
  'tahun_masuk','status','tempat_lahir','tanggal_lahir','agama','no_hp','alamat',
];
const SISWA_EXPORT_FULL_ATTRS = [
  ...SISWA_EXPORT_SAFE_ATTRS,
  'nama_ayah','nama_ibu','hp_ortu','pernah_dapat_bantuan',
];

const exportSiswa = async (req, res) => {
  const { status, kelas_id, jurusan_id, search } = req.query;
  const where = {};
  if (status)     where.status     = status;
  if (kelas_id)   where.kelas_id   = kelas_id;
  if (jurusan_id) where.jurusan_id = jurusan_id;
  if (search)     where[Op.or] = [
    { nama: { [Op.like]: `%${search}%` } },
    { nisn: { [Op.like]: `%${search}%` } },
    { nis:  { [Op.like]: `%${search}%` } },
  ];

  const include = [
    { association: 'jurusan', attributes: ['kode'] },
    { association: 'kelas', attributes: ['nama'] },
  ];

  let rows, hasNewCols = true;
  try {
    rows = await Siswa.findAll({ where, attributes: SISWA_EXPORT_FULL_ATTRS, include, order: [['nama', 'ASC']] });
  } catch (e) {
    if (e.original?.code === 'ER_BAD_FIELD_ERROR') {
      hasNewCols = false;
      rows = await Siswa.findAll({ where, attributes: SISWA_EXPORT_SAFE_ATTRS, include, order: [['nama', 'ASC']] });
    } else { throw e; }
  }

  const labels = hasNewCols ? SISWA_LABELS : SISWA_LABELS.slice(0, 13);

  const data = rows.map(s => {
    const tgl = s.tanggal_lahir ? String(s.tanggal_lahir).slice(0, 10) : '';
    const row = [
      s.nama,
      s.nisn        || '',
      s.nis         || '',
      s.jenis_kelamin || '',
      s.kelas?.nama || '',
      s.jurusan?.kode || '',
      s.tahun_masuk || '',
      s.status      || 'Aktif',
      s.tempat_lahir || '',
      tgl,
      s.agama       || '',
      s.no_hp       || '',
      s.alamat      || '',
    ];
    if (hasNewCols) {
      row.push(
        s.nama_ayah  || '',
        s.nama_ibu   || '',
        s.hp_ortu    || '',
        s.pernah_dapat_bantuan ? 1 : 0,
      );
    }
    return row;
  });

  const buf = buildWorkbook('Siswa', labels, data);
  sendExcel(res, buf, `data_siswa_${Date.now()}.xlsx`);
};

const templateSiswa = async (req, res) => {
  // 2 baris contoh realistis agar jelas cara pengisian
  const sample = [
    [
      'Andi Pratama',   // Nama Lengkap*
      '1234567890',     // NISN
      '2024001',        // NIS
      'L',              // Jenis Kelamin (L/P)*
      'X TKJ 1',        // Kelas
      'TKJ',            // Kode Jurusan
      '2024',           // Tahun Masuk
      'Aktif',          // Status
      'Surabaya',       // Tempat Lahir
      '2008-06-15',     // Tanggal Lahir
      'Islam',          // Agama
      '085123456789',   // No. HP Siswa
      'Jl. Pahlawan No. 5 Surabaya', // Alamat
      'Bapak Slamet',   // Nama Ayah
      'Ibu Wati',       // Nama Ibu
      '081298765432',   // No. HP Orang Tua/Wali
      0,                // Pernah Dapat Bantuan (1=Ya, 0=Tidak)
    ],
    [
      'Siti Rahmawati',
      '9876543210',
      '2024002',
      'P',
      'X TKJ 2',
      'TKJ',
      '2024',
      'Aktif',
      'Kediri',
      '2008-03-22',
      'Islam',
      '085234567890',
      'Jl. Melati No. 10 Kediri',
      'Bapak Hasan',
      'Ibu Rina',
      '082134567890',
      1,
    ],
  ];
  const buf = buildWorkbook('Siswa', SISWA_LABELS, sample);
  sendExcel(res, buf, 'template_import_siswa.xlsx');
};

const importSiswa = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');
  const jurusanList = await Jurusan.findAll({ where: { is_active: true } });
  const jurusanMap  = Object.fromEntries(jurusanList.map(j => [j.kode.toUpperCase(), j.id]));
  const kelasList   = await Kelas.findAll({ where: { is_active: true } });
  const kelasMap    = Object.fromEntries(kelasList.map(k => [k.nama.toUpperCase(), k.id]));

  const rows = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; const row = i + 2;
    const nama = str(r['Nama Lengkap*'] ?? r['nama']);
    if (!nama) { errors.push({ row, field: 'nama', message: 'Nama wajib diisi' }); continue; }

    const nisn = str(r['NISN'] ?? r['nisn']);
    if (nisn) {
      const dup = await Siswa.findOne({ where: { nisn } });
      if (dup) { errors.push({ row, field: 'nisn', message: `NISN ${nisn} sudah terdaftar` }); continue; }
    }

    const kodeJurusan = str(r['Kode Jurusan'] ?? r['jurusan_kode'])?.toUpperCase();
    const jurusan_id  = kodeJurusan ? jurusanMap[kodeJurusan] : null;
    const namaKelas   = str(r['Kelas'] ?? r['kelas'])?.toUpperCase();
    const kelas_id    = namaKelas ? kelasMap[namaKelas] : null;

    // Baca pernah_dapat_bantuan — bisa dari kolom baru atau lama
    const bantuanVal = r['Pernah Dapat Bantuan'] ?? r['Pernah Dapat Bantuan (1/0)'] ?? r['pernah_dapat_bantuan'];
    const pernah_dapat_bantuan = bantuanVal == 1 || bantuanVal === 'Ya' || bantuanVal === 'ya' || bantuanVal === true;

    try {
      const siswa = await Siswa.create({
        nama,
        nisn,
        nis:           str(r['NIS']                    ?? r['nis']),
        jenis_kelamin: normJK(r['Jenis Kelamin (L/P)*'] ?? r['jenis_kelamin']),
        jurusan_id,
        kelas_id,
        tahun_masuk:   str(r['Tahun Masuk']             ?? r['tahun_masuk']),
        status:        str(r['Status']                  ?? r['status']) || 'Aktif',
        tempat_lahir:  str(r['Tempat Lahir']            ?? r['tempat_lahir']),
        tanggal_lahir: dateStr(r['Tanggal Lahir']       ?? r['tanggal_lahir']),
        agama:         str(r['Agama']                   ?? r['agama']),
        no_hp:         str(r['No. HP Siswa']            ?? r['No HP'] ?? r['no_hp']),
        alamat:        str(r['Alamat']                  ?? r['alamat']),
        nama_ayah:     str(r['Nama Ayah']               ?? r['nama_ayah']),
        nama_ibu:      str(r['Nama Ibu']                ?? r['nama_ibu']),
        hp_ortu:       str(r['No. HP Orang Tua/Wali']  ?? r['HP Orang Tua'] ?? r['hp_ortu']),
        pernah_dapat_bantuan,
      });
      syncEvent('siswa.created', siswa.toJSON());
      ok.push(nama);
    } catch (e) {
      errors.push({ row, field: '-', message: e.message });
    }
  }
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'IMPORT', resource: 'siswa', description: `Import siswa: ${ok.length} berhasil, ${errors.length} gagal` });
  return success(res, { imported: ok.length, errors }, `${ok.length} siswa berhasil diimport, ${errors.length} gagal`);
};

// ============================================================
// PEGAWAI — Export & Import
// ============================================================

const PEGAWAI_LABELS = [
  'Nama Lengkap*','NIP','Jenis Kelamin (L/P)','Jabatan','Unit Kerja',
  'Status Kepegawaian','No HP','Alamat',
];

const exportPegawai = async (req, res) => {
  const rows = await Pegawai.findAll({ where: { is_active: true }, order: [['nama','ASC']] });
  const data = rows.map(p => [
    p.nama, p.nip||'', p.jenis_kelamin||'', p.jabatan||'',
    p.unit_kerja||'', p.status_kepegawaian||'', p.no_hp||'', p.alamat||'',
  ]);
  const buf = buildWorkbook('Pegawai', PEGAWAI_LABELS, data);
  sendExcel(res, buf, `data_pegawai_${Date.now()}.xlsx`);
};

const templatePegawai = async (req, res) => {
  const sample = [['Siti Rahayu','197005151995032001','P','Staf TU','Tata Usaha','PNS','08129876543','Jl. Sudirman No.10']];
  const buf = buildWorkbook('Pegawai', PEGAWAI_LABELS, sample);
  sendExcel(res, buf, 'template_import_pegawai.xlsx');
};

const importPegawai = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');
  const rows = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; const row = i + 2;
    const nama = str(r['Nama Lengkap*'] ?? r['nama']);
    if (!nama) { errors.push({ row, field: 'nama', message: 'Nama wajib diisi' }); continue; }
    try {
      const pegawai = await Pegawai.create({
        nama,
        nip:               str(r['NIP']                  ?? r['nip']),
        jenis_kelamin:     normJK(r['Jenis Kelamin (L/P)'] ?? r['jenis_kelamin']),
        jabatan:           str(r['Jabatan']               ?? r['jabatan']),
        unit_kerja:        str(r['Unit Kerja']            ?? r['unit_kerja']),
        status_kepegawaian: str(r['Status Kepegawaian']   ?? r['status_kepegawaian']),
        no_hp:             str(r['No HP']                 ?? r['no_hp']),
        alamat:            str(r['Alamat']                ?? r['alamat']),
      });
      syncEvent('pegawai.created', pegawai.toJSON());
      ok.push(nama);
    } catch (e) {
      errors.push({ row, field: '-', message: e.message });
    }
  }
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'IMPORT', resource: 'pegawai', description: `Import pegawai: ${ok.length} berhasil, ${errors.length} gagal` });
  return success(res, { imported: ok.length, errors }, `${ok.length} pegawai berhasil diimport, ${errors.length} gagal`);
};

// ============================================================
// JURUSAN — Export & Import
// ============================================================

const JURUSAN_LABELS = ['Kode*','Nama Jurusan*','Deskripsi'];

const exportJurusan = async (req, res) => {
  const rows = await Jurusan.findAll({ where: { is_active: true }, order: [['kode','ASC']] });
  const data = rows.map(j => [j.kode, j.nama, j.deskripsi||'']);
  const buf = buildWorkbook('Jurusan', JURUSAN_LABELS, data);
  sendExcel(res, buf, `data_jurusan_${Date.now()}.xlsx`);
};

const templateJurusan = async (req, res) => {
  const sample = [['TKJ','Teknik Komputer dan Jaringan','Jurusan bidang IT jaringan'],['RPL','Rekayasa Perangkat Lunak','Jurusan pemrograman']];
  const buf = buildWorkbook('Jurusan', JURUSAN_LABELS, sample);
  sendExcel(res, buf, 'template_import_jurusan.xlsx');
};

const importJurusan = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');
  const rows = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; const row = i + 2;
    const kode = str(r['Kode*'] ?? r['kode']);
    const nama = str(r['Nama Jurusan*'] ?? r['nama']);
    if (!kode) { errors.push({ row, field: 'kode', message: 'Kode wajib diisi' }); continue; }
    if (!nama) { errors.push({ row, field: 'nama', message: 'Nama wajib diisi' }); continue; }
    const dup = await Jurusan.findOne({ where: { kode: kode.toUpperCase() } });
    if (dup) { errors.push({ row, field: 'kode', message: `Kode '${kode}' sudah ada` }); continue; }
    try {
      await Jurusan.create({ kode: kode.toUpperCase(), nama, deskripsi: str(r['Deskripsi'] ?? r['deskripsi']) });
      ok.push(kode);
    } catch (e) { errors.push({ row, field: '-', message: e.message }); }
  }
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'IMPORT', resource: 'jurusan', description: `Import jurusan: ${ok.length} berhasil, ${errors.length} gagal` });
  return success(res, { imported: ok.length, errors }, `${ok.length} jurusan berhasil diimport, ${errors.length} gagal`);
};

// ============================================================
// KELAS — Export & Import
// ============================================================

const KELAS_LABELS = ['Nama Kelas*','Tingkat (X/XI/XII)*','Kode Jurusan','Nama Tahun Pelajaran*','Kapasitas','Ruangan'];

const exportKelas = async (req, res) => {
  const rows = await Kelas.findAll({
    where: { is_active: true },
    include: [{ association: 'jurusan', attributes: ['kode'] }, { association: 'tahunPelajaran', attributes: ['nama'] }],
    order: [['nama','ASC']],
  });
  const data = rows.map(k => [k.nama, k.tingkat, k.jurusan?.kode||'', k.tahunPelajaran?.nama||'', k.kapasitas||'', k.ruangan||'']);
  const buf = buildWorkbook('Kelas', KELAS_LABELS, data);
  sendExcel(res, buf, `data_kelas_${Date.now()}.xlsx`);
};

const templateKelas = async (req, res) => {
  const sample = [['X TKJ 1','X','TKJ','2024/2025','36','Ruang 101'],['XI RPL 1','XI','RPL','2024/2025','34','Ruang 202']];
  const buf = buildWorkbook('Kelas', KELAS_LABELS, sample);
  sendExcel(res, buf, 'template_import_kelas.xlsx');
};

const importKelas = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');
  const jurusanList = await Jurusan.findAll({ where: { is_active: true } });
  const jurusanMap  = Object.fromEntries(jurusanList.map(j => [j.kode.toUpperCase(), j.id]));
  const tpList = await TahunPelajaran.findAll();
  const tpMap  = Object.fromEntries(tpList.map(t => [t.nama.trim(), t.id]));

  const rows = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; const rowNum = i + 2;
    const nama    = str(r['Nama Kelas*']             ?? r['nama']);
    const tingkat = str(r['Tingkat (X/XI/XII)*']     ?? r['tingkat'])?.toUpperCase();
    const tpNama  = str(r['Nama Tahun Pelajaran*']   ?? r['tahun_pelajaran']);
    if (!nama)    { errors.push({ row: rowNum, field: 'nama',    message: 'Nama kelas wajib diisi' }); continue; }
    if (!tingkat) { errors.push({ row: rowNum, field: 'tingkat', message: 'Tingkat wajib diisi (X/XI/XII)' }); continue; }
    if (!tpNama)  { errors.push({ row: rowNum, field: 'tahun_pelajaran', message: 'Tahun pelajaran wajib diisi' }); continue; }

    const tahun_pelajaran_id = tpMap[tpNama];
    if (!tahun_pelajaran_id) { errors.push({ row: rowNum, field: 'tahun_pelajaran', message: `Tahun pelajaran '${tpNama}' tidak ditemukan` }); continue; }

    const kodeJurusan = str(r['Kode Jurusan'] ?? r['jurusan_kode'])?.toUpperCase();
    const jurusan_id  = kodeJurusan ? jurusanMap[kodeJurusan] : null;

    try {
      const kelas = await Kelas.create({ nama, tingkat, jurusan_id, tahun_pelajaran_id, kapasitas: parseInt(str(r['Kapasitas'] ?? r['kapasitas'])) || 36, ruangan: str(r['Ruangan'] ?? r['ruangan']) });
      syncEvent('kelas.created', kelas.toJSON());
      ok.push(nama);
    } catch (e) { errors.push({ row: rowNum, field: '-', message: e.message }); }
  }
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'IMPORT', resource: 'kelas', description: `Import kelas: ${ok.length} berhasil, ${errors.length} gagal` });
  return success(res, { imported: ok.length, errors }, `${ok.length} kelas berhasil diimport, ${errors.length} gagal`);
};

// ============================================================
// MAPEL — Export & Import
// ============================================================

const MAPEL_LABELS = ['Kode*','Nama Mata Pelajaran*','Kelompok (A/B/C/Muatan Lokal)','Kode Jurusan','Jam Per Minggu'];

const exportMapel = async (req, res) => {
  const rows = await MataPelajaran.findAll({
    where: { is_active: true },
    include: [{ association: 'jurusan', attributes: ['kode'] }],
    order: [['kode','ASC']],
  });
  const data = rows.map(m => [m.kode, m.nama, m.kelompok||'', m.jurusan?.kode||'', m.jam_per_minggu||'']);
  const buf = buildWorkbook('Mapel', MAPEL_LABELS, data);
  sendExcel(res, buf, `data_mapel_${Date.now()}.xlsx`);
};

const templateMapel = async (req, res) => {
  const sample = [['MTK','Matematika','A','','4'],['TKJ1','Komputer Jaringan Dasar','C','TKJ','4']];
  const buf = buildWorkbook('Mapel', MAPEL_LABELS, sample);
  sendExcel(res, buf, 'template_import_mapel.xlsx');
};

const importMapel = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');
  const jurusanList = await Jurusan.findAll({ where: { is_active: true } });
  const jurusanMap  = Object.fromEntries(jurusanList.map(j => [j.kode.toUpperCase(), j.id]));

  const rows = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]; const row = i + 2;
    const kode = str(r['Kode*'] ?? r['kode']);
    const nama = str(r['Nama Mata Pelajaran*'] ?? r['nama']);
    if (!kode) { errors.push({ row, field: 'kode', message: 'Kode wajib diisi' }); continue; }
    if (!nama) { errors.push({ row, field: 'nama', message: 'Nama wajib diisi' }); continue; }
    const dup = await MataPelajaran.findOne({ where: { kode } });
    if (dup) { errors.push({ row, field: 'kode', message: `Kode mapel '${kode}' sudah ada` }); continue; }

    const kodeJurusan = str(r['Kode Jurusan'] ?? r['jurusan_kode'])?.toUpperCase();
    const jurusan_id  = kodeJurusan ? jurusanMap[kodeJurusan] : null;
    try {
      const mapel = await MataPelajaran.create({
        kode, nama,
        kelompok:      str(r['Kelompok (A/B/C/Muatan Lokal)'] ?? r['kelompok']),
        jurusan_id,
        jam_per_minggu: parseInt(str(r['Jam Per Minggu'] ?? r['jam_per_minggu'])) || null,
      });
      syncEvent('mapel.created', mapel.toJSON());
      ok.push(kode);
    } catch (e) { errors.push({ row, field: '-', message: e.message }); }
  }
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'IMPORT', resource: 'mapel', description: `Import mapel: ${ok.length} berhasil, ${errors.length} gagal` });
  return success(res, { imported: ok.length, errors }, `${ok.length} mapel berhasil diimport, ${errors.length} gagal`);
};

// ============================================================
// Exports
// ============================================================
// ============================================================
// USER (Akun Login) — Export & Import
// ============================================================

const USER_LABELS = [
  'Nama Lengkap*', 'Username*', 'Email*', 'Password (kosong=Username123!)',
  'Role* (super_admin/admin/guru/pegawai/siswa)', 'Aktif (1=ya, 0=tidak)',
];

const exportUsers = async (req, res) => {
  const { role: roleName } = req.query;
  const include = [{ model: Role, as: 'role', attributes: ['name', 'label'] }];
  const where   = {};
  if (roleName) {
    include[0].where = { name: roleName };
  }
  const rows = await User.findAll({ where, include, order: [['full_name', 'ASC']] });
  const data = rows.map(u => [
    u.full_name, u.username, u.email,
    '',                              // password dikosongkan — tidak boleh export
    u.role?.name || '',
    u.is_active ? 1 : 0,
  ]);
  const suffix = roleName ? `_${roleName}` : '';
  const buf = buildWorkbook('Users', USER_LABELS, data);
  sendExcel(res, buf, `data_user${suffix}_${Date.now()}.xlsx`);
};

const templateUsers = async (req, res) => {
  const sample = [
    ['Budi Santoso', 'budi.santoso', 'budi@sekolah.sch.id', 'Rahasia123!', 'guru', 1],
    ['Siti Rahayu',  'siti.rahayu',  'siti@sekolah.sch.id', 'Rahasia123!', 'guru', 1],
    ['Ahmad Yusuf',  'ahmad.yusuf',  'ahmad@sekolah.sch.id', '',           'pegawai', 1],
  ];
  const buf = buildWorkbook('Users', USER_LABELS, sample);
  sendExcel(res, buf, 'template_import_user.xlsx');
};

const importUsers = async (req, res) => {
  if (!req.file) return badRequest(res, 'File Excel wajib diupload');

  // Cache semua role
  const roleList = await Role.findAll({ where: { is_active: true } });
  const roleMap  = Object.fromEntries(roleList.map(r => [r.name.toLowerCase(), r.id]));

  const rows = parseExcel(req.file.buffer);
  const ok = [], errors = [];

  for (let i = 0; i < rows.length; i++) {
    const r   = rows[i];
    const row = i + 2;

    const full_name = str(r['Nama Lengkap*']  ?? r['nama_lengkap'] ?? r['full_name']);
    const username  = str(r['Username*']       ?? r['username']);
    const email     = str(r['Email*']          ?? r['email']);
    const roleName  = str(r['Role* (super_admin/admin/guru/pegawai/siswa)'] ?? r['role'])?.toLowerCase();

    if (!full_name) { errors.push({ row, field: 'full_name', message: 'Nama lengkap wajib diisi' }); continue; }
    if (!username)  { errors.push({ row, field: 'username',  message: 'Username wajib diisi' }); continue; }
    if (!email)     { errors.push({ row, field: 'email',     message: 'Email wajib diisi' }); continue; }
    if (!roleName || !roleMap[roleName]) {
      errors.push({ row, field: 'role', message: `Role '${roleName}' tidak valid. Gunakan: ${Object.keys(roleMap).join(', ')}` });
      continue;
    }

    // Cek duplikat username / email
    const dup = await User.unscoped().findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (dup) {
      errors.push({ row, field: dup.username === username ? 'username' : 'email', message: `${dup.username === username ? 'Username' : 'Email'} sudah terdaftar` });
      continue;
    }

    // Password: ambil dari kolom atau default Username123!
    const rawPw    = str(r['Password (kosong=Username123!)'] ?? r['password']);
    const password = rawPw && rawPw.length >= 8 ? rawPw : 'Username123!';
    const hashed   = await hashPassword(password);

    // Aktif: default true
    const aktifVal = r['Aktif (1=ya, 0=tidak)'] ?? r['is_active'];
    const is_active = aktifVal === 0 || aktifVal === '0' ? false : true;

    try {
      await User.create({
        full_name, username, email,
        password: hashed,
        role_id:  roleMap[roleName],
        is_active,
      });
      ok.push(username);
    } catch (e) {
      errors.push({ row, field: '-', message: e.message });
    }
  }

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'IMPORT', resource: 'users',
    description: `Import user: ${ok.length} berhasil, ${errors.length} gagal`,
  });

  return success(res, { imported: ok.length, errors },
    `${ok.length} user berhasil diimport, ${errors.length} gagal`
  );
};

module.exports = {
  exportGuru, templateGuru, importGuru,
  exportSiswa, templateSiswa, importSiswa,
  exportPegawai, templatePegawai, importPegawai,
  exportJurusan, templateJurusan, importJurusan,
  exportKelas, templateKelas, importKelas,
  exportMapel, templateMapel, importMapel,
  exportUsers, templateUsers, importUsers,
};
