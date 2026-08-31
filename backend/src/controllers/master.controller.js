const { Op } = require('sequelize');
const {
  Guru, Siswa, Pegawai, OrangTua, Kelas, Jurusan,
  MataPelajaran, TahunPelajaran, Semester, SiswaKelas, KalenderAkademik,
  User, Role,
} = require('../models');
const { getPagination, hashPassword } = require('../utils/helpers');
const { writeAuditLog } = require('../middleware/auditLog');
const { success, created, paginated, notFound, conflict, badRequest } = require('../utils/response');
const { syncEvent } = require('../services/syncService');

// ============================================================
// GURU
// ============================================================
const getGuru = async (req, res) => {
  const { page = 1, limit = 10, search = '', jurusan_id } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);
  const where = { is_active: true };
  if (search) where[Op.or] = [{ nama: { [Op.like]: `%${search}%` } }, { nip: { [Op.like]: `%${search}%` } }];
  if (jurusan_id) where.jurusan_id = jurusan_id;
  const { count, rows } = await Guru.findAndCountAll({
    where, limit: lim, offset,
    include: [{ association: 'jurusan', attributes: ['id', 'kode', 'nama'] }],
    order: [['nama', 'ASC']],
  });
  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

const getGuruById = async (req, res) => {
  const guru = await Guru.findByPk(req.params.id, { include: ['jurusan'] });
  if (!guru) return notFound(res, 'Data guru tidak ditemukan');
  return success(res, guru);
};

const createGuru = async (req, res) => {
  const { nip, niy } = req.body;
  if (nip) {
    const dup = await Guru.findOne({ where: { nip } });
    if (dup) return conflict(res, 'NIP sudah terdaftar');
  }
  if (niy) {
    const dup = await Guru.findOne({ where: { niy } });
    if (dup) return conflict(res, 'NIY sudah terdaftar');
  }
  const guru = await Guru.create(req.body);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'CREATE', resource: 'guru', resourceId: guru.id, description: `Guru ${guru.nama} dibuat`, newData: req.body });
  await syncEvent('guru.created', guru.toJSON());
  return created(res, guru, 'Data guru berhasil ditambahkan');
};

const updateGuru = async (req, res) => {
  const guru = await Guru.findByPk(req.params.id);
  if (!guru) return notFound(res, 'Data guru tidak ditemukan');
  // Hanya ambil field yang valid, bersihkan nested objects
  const allowed = ['nama', 'nip', 'niy', 'jenis_kelamin', 'status_kepegawaian', 'jurusan_id', 'jabatan', 'mata_pelajaran', 'no_hp', 'email', 'tempat_lahir', 'tanggal_lahir', 'agama', 'alamat', 'foto'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      data[key] = ['jurusan_id'].includes(key) ? (req.body[key] || null) : req.body[key];
    }
  }
  const oldData = guru.toJSON();
  await guru.update(data);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'guru', resourceId: guru.id, description: `Guru ${guru.nama} diperbarui`, oldData, newData: data });
  await syncEvent('guru.updated', guru.toJSON());
  return success(res, guru, 'Data guru berhasil diperbarui');
};

const deleteGuru = async (req, res) => {
  const guru = await Guru.findByPk(req.params.id);
  if (!guru) return notFound(res, 'Data guru tidak ditemukan');
  await guru.update({ is_active: false }); // soft delete
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'DELETE', resource: 'guru', resourceId: guru.id, description: `Guru ${guru.nama} dinonaktifkan` });
  await syncEvent('guru.deleted', { id: guru.id });
  return success(res, null, 'Data guru berhasil dinonaktifkan');
};

// Kolom siswa yang aman di-SELECT (fallback saat migration belum dijalankan)
// Kolom baru (hp_ortu, nama_ayah, nama_ibu, pernah_dapat_bantuan) di-SELECT juga —
// tapi jika DB belum punya kolom ini, gunakan safeAttrs saja.
const SISWA_SAFE_ATTRS = ['id', 'nisn', 'nis', 'nama', 'jenis_kelamin',
  'kelas_id', 'jurusan_id', 'orang_tua_id', 'tahun_masuk', 'status',
  'tempat_lahir', 'tanggal_lahir', 'agama', 'no_hp', 'alamat',
  'created_at', 'updated_at'];

const SISWA_FULL_ATTRS = [...SISWA_SAFE_ATTRS,
  'hp_ortu', 'nama_ayah', 'nama_ibu', 'pernah_dapat_bantuan'];

/**
 * findByPk dengan fallback kolom — aman dipakai sebelum & sesudah migration
 */
const findSiswaById = async (id, extraIncludes = []) => {
  try {
    return await Siswa.findByPk(id, {
      attributes: SISWA_FULL_ATTRS,
      include: extraIncludes,
    });
  } catch (e) {
    if (e.original?.code === 'ER_BAD_FIELD_ERROR') {
      return await Siswa.findByPk(id, {
        attributes: SISWA_SAFE_ATTRS,
        include: extraIncludes,
      });
    }
    throw e;
  }
};


const getSiswa = async (req, res) => {
  const { page = 1, limit = 10, search = '', jurusan_id, kelas_id, status = 'Aktif' } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);
  const where = {};
  if (status) where.status = status;
  if (search) where[Op.or] = [{ nama: { [Op.like]: `%${search}%` } }, { nisn: { [Op.like]: `%${search}%` } }, { nis: { [Op.like]: `%${search}%` } }];
  if (jurusan_id) where.jurusan_id = jurusan_id;
  if (kelas_id) where.kelas_id = kelas_id;

  const include = [
    { association: 'jurusan', attributes: ['id', 'kode', 'nama'] },
    { association: 'kelas', attributes: ['id', 'nama'] },
    { association: 'user', attributes: ['id', 'username', 'is_active'], required: false },
  ];

  let count, rows;
  try {
    ({ count, rows } = await Siswa.findAndCountAll({
      where, limit: lim, offset, attributes: SISWA_FULL_ATTRS, include, order: [['nama', 'ASC']],
    }));
  } catch (e) {
    if (e.original?.code === 'ER_BAD_FIELD_ERROR') {
      ({ count, rows } = await Siswa.findAndCountAll({
        where, limit: lim, offset, attributes: SISWA_SAFE_ATTRS, include, order: [['nama', 'ASC']],
      }));
    } else { throw e; }
  }
  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

const getSiswaById = async (req, res) => {
  const siswa = await findSiswaById(req.params.id, ['jurusan', 'kelas', 'orangTua', 'riwayatKelas']);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');
  return success(res, siswa);
};

const createSiswa = async (req, res) => {
  const { nisn, nis } = req.body;
  if (nisn) {
    const dup = await Siswa.findOne({ where: { nisn } });
    if (dup) return conflict(res, 'NISN sudah terdaftar');
  }
  // Buat orang tua terlebih dahulu jika ada
  let orangTuaId = null;
  if (req.body.orang_tua) {
    const ot = await OrangTua.create(req.body.orang_tua);
    orangTuaId = ot.id;
  }
  const siswa = await Siswa.create({ ...req.body, orang_tua_id: orangTuaId });
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'CREATE', resource: 'siswa', resourceId: siswa.id, description: `Siswa ${siswa.nama} dibuat`, newData: req.body });
  await syncEvent('siswa.created', siswa.toJSON());
  return created(res, siswa, 'Data siswa berhasil ditambahkan');
};

const updateSiswa = async (req, res) => {
  const siswa = await findSiswaById(req.params.id);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');
  // Hanya ambil field yang valid
  const allowed = ['nama', 'nisn', 'nis', 'jenis_kelamin', 'kelas_id', 'jurusan_id', 'tahun_masuk', 'status', 'tempat_lahir', 'tanggal_lahir', 'agama', 'no_hp', 'alamat', 'hp_ortu', 'nama_ayah', 'nama_ibu', 'pernah_dapat_bantuan'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      data[key] = ['jurusan_id', 'kelas_id'].includes(key) ? (req.body[key] || null) : req.body[key];
    }
  }
  const oldData = siswa.toJSON();
  await siswa.update(data);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'siswa', resourceId: siswa.id, description: `Siswa ${siswa.nama} diperbarui`, oldData, newData: data });
  await syncEvent('siswa.updated', siswa.toJSON());
  return success(res, siswa, 'Data siswa berhasil diperbarui');
};

const deleteSiswa = async (req, res) => {
  const siswa = await findSiswaById(req.params.id);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');
  await siswa.update({ status: 'Keluar' });
  await syncEvent('siswa.deleted', { id: siswa.id });
  return success(res, null, 'Data siswa berhasil dinonaktifkan');
};

// POST /master/siswa/:id/create-user
const createSiswaUser = async (req, res) => {
  const siswa = await findSiswaById(req.params.id);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');
  if (!siswa.nisn) return badRequest(res, 'Siswa belum memiliki NISN. Isi NISN terlebih dahulu');

  // Cek apakah akun sudah pernah dibuat
  const existing = await User.unscoped().findOne({ where: { siswa_id: siswa.id } });
  if (existing) return conflict(res, `Akun login sudah ada (username: ${existing.username})`);

  // Cari role 'siswa'
  const role = await Role.findOne({ where: { name: 'siswa' } });
  if (!role) return badRequest(res, "Role 'siswa' belum ada di sistem. Buat role siswa terlebih dahulu");

  const username = siswa.nisn.trim();
  const email    = `${username}@sdms.local`;
  const password = 'smkn1kras';

  // Pastikan username & email belum dipakai user lain
  const dupUser = await User.unscoped().findOne({ where: { [Op.or]: [{ username }, { email }] } });
  if (dupUser) return conflict(res, `Username ${username} sudah digunakan user lain`);

  const hashed = await hashPassword(password);
  const user = await User.create({
    username,
    email,
    full_name: siswa.nama,
    role_id:   role.id,
    password:  hashed,
    siswa_id:  siswa.id,
    is_active: true,
  });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'CREATE', resource: 'users', resourceId: user.id,
    description: `Akun siswa dibuat: ${username} (${siswa.nama})`,
  });

  return created(res, {
    username,
    full_name: siswa.nama,
    role: role.label || role.name,
    note: 'Password default: smkn1kras — minta siswa segera ganti password',
  }, 'Akun login siswa berhasil dibuat');
};

// POST /master/siswa/bulk-create-user
// Buat akun login massal untuk banyak siswa sekaligus
const bulkCreateSiswaUser = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return badRequest(res, 'ids harus berupa array dan tidak boleh kosong');
  }

  // Cari role 'siswa' sekali saja
  const role = await Role.findOne({ where: { name: 'siswa' } });
  if (!role) return badRequest(res, "Role 'siswa' belum ada di sistem. Buat role siswa terlebih dahulu");

  const password = 'smkn1kras';
  const hashed   = await hashPassword(password);

  const results = { berhasil: [], gagal: [] };

  for (const id of ids) {
    const siswa = await findSiswaById(id);
    if (!siswa) { results.gagal.push({ id, alasan: 'Siswa tidak ditemukan' }); continue; }
    if (!siswa.nisn) { results.gagal.push({ id, nama: siswa.nama, alasan: 'Belum punya NISN' }); continue; }

    const username = siswa.nisn.trim();
    const email    = `${username}@sdms.local`;

    // Cek akun sudah ada (linked ke siswa ini)
    const existBySiswa = await User.unscoped().findOne({ where: { siswa_id: siswa.id } });
    if (existBySiswa) { results.gagal.push({ id, nama: siswa.nama, alasan: `Akun sudah ada (${existBySiswa.username})` }); continue; }

    // Cek username/email bentrok user lain
    const existByLogin = await User.unscoped().findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (existByLogin) { results.gagal.push({ id, nama: siswa.nama, alasan: `Username ${username} sudah dipakai user lain` }); continue; }

    try {
      await User.create({
        username, email,
        full_name: siswa.nama,
        role_id:   role.id,
        password:  hashed,
        siswa_id:  siswa.id,
        is_active: true,
      });
      results.berhasil.push({ id, nama: siswa.nama, username });
    } catch (e) {
      results.gagal.push({ id, nama: siswa.nama, alasan: e.message });
    }
  }

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'BULK_CREATE', resource: 'users',
    description: `Bulk create akun siswa: ${results.berhasil.length} berhasil, ${results.gagal.length} gagal`,
  });

  return success(res, results,
    `${results.berhasil.length} akun berhasil dibuat, ${results.gagal.length} gagal`
  );
};

// POST /master/siswa/:id/reset-password
// Reset password akun siswa ke default smkn1kras
const resetSiswaPassword = async (req, res) => {
  const siswa = await findSiswaById(req.params.id);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');

  const userAkun = await User.unscoped().findOne({ where: { siswa_id: siswa.id } });
  if (!userAkun) return notFound(res, 'Siswa ini belum memiliki akun login');

  const newPassword = req.body.new_password || 'smkn1kras';
  const hashed = await hashPassword(newPassword);
  await userAkun.update({ password: hashed, password_changed_at: new Date() });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'users', resourceId: userAkun.id,
    description: `Password siswa ${siswa.nama} (${userAkun.username}) direset oleh ${req.user.username}`,
  });

  return success(res, { username: userAkun.username }, `Password akun ${userAkun.username} berhasil direset`);
};

// POST /master/siswa/bulk-reset-password
// Reset password massal akun siswa ke default smkn1kras
const bulkResetSiswaPassword = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return badRequest(res, 'ids harus berupa array dan tidak boleh kosong');
  }

  const newPassword = req.body.new_password || 'smkn1kras';
  const hashed = await hashPassword(newPassword);

  const results = { berhasil: [], gagal: [] };

  for (const id of ids) {
    const siswa = await findSiswaById(id);
    if (!siswa) { results.gagal.push({ id, alasan: 'Siswa tidak ditemukan' }); continue; }

    const userAkun = await User.unscoped().findOne({ where: { siswa_id: siswa.id } });
    if (!userAkun) { results.gagal.push({ id, nama: siswa.nama, alasan: 'Belum punya akun login' }); continue; }

    try {
      await userAkun.update({ password: hashed, password_changed_at: new Date() });
      results.berhasil.push({ id, nama: siswa.nama, username: userAkun.username });
    } catch (e) {
      results.gagal.push({ id, nama: siswa.nama, alasan: e.message });
    }
  }

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'BULK_UPDATE', resource: 'users',
    description: `Bulk reset password siswa: ${results.berhasil.length} berhasil, ${results.gagal.length} gagal`,
  });

  return success(res, results,
    `${results.berhasil.length} password berhasil direset, ${results.gagal.length} gagal`
  );
};

// ============================================================
// PEGAWAI
// ============================================================
const getPegawai = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);
  const where = { is_active: true };
  if (search) where[Op.or] = [{ nama: { [Op.like]: `%${search}%` } }, { nip: { [Op.like]: `%${search}%` } }];
  const { count, rows } = await Pegawai.findAndCountAll({ where, limit: lim, offset, order: [['nama', 'ASC']] });
  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

const createPegawai = async (req, res) => {
  const pegawai = await Pegawai.create(req.body);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'CREATE', resource: 'pegawai', resourceId: pegawai.id, description: `Pegawai ${pegawai.nama} dibuat` });
  syncEvent('pegawai.created', pegawai.toJSON());
  return created(res, pegawai, 'Data pegawai berhasil ditambahkan');
};

const updatePegawai = async (req, res) => {
  const pegawai = await Pegawai.findByPk(req.params.id);
  if (!pegawai) return notFound(res, 'Data pegawai tidak ditemukan');
  await pegawai.update(req.body);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'pegawai', resourceId: pegawai.id, description: `Pegawai ${pegawai.nama} diperbarui` });
  syncEvent('pegawai.updated', pegawai.toJSON());
  return success(res, pegawai, 'Data pegawai berhasil diperbarui');
};

const deletePegawai = async (req, res) => {
  const pegawai = await Pegawai.findByPk(req.params.id);
  if (!pegawai) return notFound(res, 'Data pegawai tidak ditemukan');
  await pegawai.update({ is_active: false });
  syncEvent('pegawai.deleted', { id: pegawai.id });
  return success(res, null, 'Data pegawai berhasil dinonaktifkan');
};

// ============================================================
// JURUSAN
// ============================================================
const getJurusan = async (req, res) => {
  const jurusan = await Jurusan.findAll({ where: { is_active: true }, include: [{ association: 'kepalaJurusan', attributes: ['id', 'nama'] }], order: [['nama', 'ASC']] });
  return success(res, jurusan);
};

const createJurusan = async (req, res) => {
  const dup = await Jurusan.findOne({ where: { kode: req.body.kode } });
  if (dup) return conflict(res, 'Kode jurusan sudah ada');
  const jurusan = await Jurusan.create(req.body);
  return created(res, jurusan, 'Jurusan berhasil ditambahkan');
};

const updateJurusan = async (req, res) => {
  const { Op } = require('sequelize');
  const jurusan = await Jurusan.findByPk(req.params.id);
  if (!jurusan) return notFound(res, 'Jurusan tidak ditemukan');

  // Cek duplikat kode jika kode berubah
  if (req.body.kode && req.body.kode !== jurusan.kode) {
    const dup = await Jurusan.findOne({
      where: { kode: req.body.kode, id: { [Op.ne]: jurusan.id } }
    });
    if (dup) return conflict(res, `Kode jurusan '${req.body.kode}' sudah digunakan`);
  }

  const oldKode = jurusan.kode;
  await jurusan.update(req.body);
  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'jurusan', resourceId: jurusan.id,
    description: `Jurusan ${oldKode} diperbarui${req.body.kode && req.body.kode !== oldKode ? ` (kode: ${oldKode} → ${req.body.kode})` : ''}`,
    newData: req.body,
  });
  return success(res, jurusan, 'Jurusan berhasil diperbarui');
};

// ============================================================
// KELAS
// ============================================================
const getKelas = async (req, res) => {
  const { tahun_pelajaran_id } = req.query;
  const where = { is_active: true };
  if (tahun_pelajaran_id) where.tahun_pelajaran_id = tahun_pelajaran_id;
  const kelas = await Kelas.findAll({
    where,
    include: [
      { association: 'jurusan', attributes: ['id', 'kode', 'nama'] },
      { association: 'waliKelas', attributes: ['id', 'nama'] },
      { association: 'tahunPelajaran', attributes: ['id', 'nama'] },
    ],
    order: [['nama', 'ASC']],
  });
  return success(res, kelas);
};

const createKelas = async (req, res) => {
  const kelas = await Kelas.create(req.body);
  syncEvent('kelas.created', kelas.toJSON());
  return created(res, kelas, 'Kelas berhasil dibuat');
};

const updateKelas = async (req, res) => {
  const kelas = await Kelas.findByPk(req.params.id);
  if (!kelas) return notFound(res, 'Kelas tidak ditemukan');
  // Hanya ambil field yang valid, bersihkan nested objects & convert empty string ke null
  const allowed = ['nama', 'tingkat', 'jurusan_id', 'wali_kelas_id', 'tahun_pelajaran_id', 'kapasitas', 'ruangan', 'is_active'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      // FK fields: empty string → null
      if (['jurusan_id', 'wali_kelas_id', 'tahun_pelajaran_id'].includes(key)) {
        data[key] = req.body[key] || null;
      } else {
        data[key] = req.body[key];
      }
    }
  }
  const oldData = kelas.toJSON();
  await kelas.update(data);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'kelas', resourceId: kelas.id, description: `Kelas ${kelas.nama} diperbarui`, oldData, newData: data });
  syncEvent('kelas.updated', kelas.toJSON());
  return success(res, kelas, 'Kelas berhasil diperbarui');
};

// ============================================================
// MATA PELAJARAN
// ============================================================
const getMapel = async (req, res) => {
  const { jurusan_id } = req.query;
  const where = { is_active: true };
  if (jurusan_id) where[Op.or] = [{ jurusan_id }, { jurusan_id: null }];
  const mapel = await MataPelajaran.findAll({ where, include: [{ association: 'jurusan', attributes: ['id', 'kode', 'nama'] }], order: [['nama', 'ASC']] });
  return success(res, mapel);
};

const createMapel = async (req, res) => {
  const dup = await MataPelajaran.findOne({ where: { kode: req.body.kode } });
  if (dup) return conflict(res, 'Kode mata pelajaran sudah ada');
  // Sanitasi: ubah string kosong ke null untuk field ENUM dan FK
  const data = { ...req.body };
  if (data.kelompok   === '' || data.kelompok   === '--') data.kelompok   = null;
  if (data.jurusan_id === '' || data.jurusan_id === 'Semua') data.jurusan_id = null;
  if (data.jam_per_minggu === '' || data.jam_per_minggu === 0) data.jam_per_minggu = null;
  const mapel = await MataPelajaran.create(data);
  syncEvent('mapel.created', mapel.toJSON());
  return created(res, mapel, 'Mata pelajaran berhasil ditambahkan');
};

const updateMapel = async (req, res) => {
  const mapel = await MataPelajaran.findByPk(req.params.id);
  if (!mapel) return notFound(res, 'Mata pelajaran tidak ditemukan');
  // Sanitasi: ubah string kosong ke null untuk field ENUM dan FK
  const data = { ...req.body };
  if (data.kelompok   === '' || data.kelompok   === '--') data.kelompok   = null;
  if (data.jurusan_id === '' || data.jurusan_id === 'Semua') data.jurusan_id = null;
  if (data.jam_per_minggu === '' || data.jam_per_minggu === 0) data.jam_per_minggu = null;
  await mapel.update(data);
  syncEvent('mapel.updated', mapel.toJSON());
  return success(res, mapel, 'Mata pelajaran berhasil diperbarui');
};

// ============================================================
// TAHUN PELAJARAN & SEMESTER
// ============================================================
const getTahunPelajaran = async (req, res) => {
  const list = await TahunPelajaran.findAll({ include: ['semester'], order: [['nama', 'DESC']] });
  return success(res, list);
};

const createTahunPelajaran = async (req, res) => {
  const dup = await TahunPelajaran.findOne({ where: { nama: req.body.nama } });
  if (dup) return conflict(res, 'Tahun pelajaran sudah ada');
  // Jika is_aktif true, nonaktifkan yang lain
  if (req.body.is_aktif) await TahunPelajaran.update({ is_aktif: false }, { where: {} });
  const tp = await TahunPelajaran.create(req.body);
  return created(res, tp, 'Tahun pelajaran berhasil dibuat');
};

const setTahunAktif = async (req, res) => {
  await TahunPelajaran.update({ is_aktif: false }, { where: {} });
  await TahunPelajaran.update({ is_aktif: true }, { where: { id: req.params.id } });
  return success(res, null, 'Tahun pelajaran aktif berhasil diubah');
};

const getSemester = async (req, res) => {
  const { tahun_pelajaran_id } = req.query;
  const where = tahun_pelajaran_id ? { tahun_pelajaran_id } : {};
  const list = await Semester.findAll({ where, include: ['tahunPelajaran'], order: [['tanggal_mulai', 'ASC']] });
  return success(res, list);
};

const createSemester = async (req, res) => {
  if (req.body.is_aktif) {
    await Semester.update({ is_aktif: false }, { where: { tahun_pelajaran_id: req.body.tahun_pelajaran_id } });
  }
  const semester = await Semester.create(req.body);
  return created(res, semester, 'Semester berhasil dibuat');
};

const updateTahunPelajaran = async (req, res) => {
  const tp = await TahunPelajaran.findByPk(req.params.id);
  if (!tp) return notFound(res, 'Tahun pelajaran tidak ditemukan');
  // Kalau set aktif, nonaktifkan yang lain dulu
  if (req.body.is_aktif) await TahunPelajaran.update({ is_aktif: false }, { where: {} });
  await tp.update(req.body);
  return success(res, tp, 'Tahun pelajaran berhasil diperbarui');
};

const deleteTahunPelajaran = async (req, res) => {
  const tp = await TahunPelajaran.findByPk(req.params.id);
  if (!tp) return notFound(res, 'Tahun pelajaran tidak ditemukan');
  if (tp.is_aktif) return badRequest(res, 'Tidak bisa menghapus tahun pelajaran yang sedang aktif');
  // Cek apakah ada kelas yang menggunakan tahun pelajaran ini
  const kelasCount = await Kelas.count({ where: { tahun_pelajaran_id: tp.id, is_active: true } });
  if (kelasCount > 0) return badRequest(res, `Tidak bisa menghapus — masih ada ${kelasCount} kelas aktif`);
  await tp.destroy();
  return success(res, null, 'Tahun pelajaran berhasil dihapus');
};

const updateSemester = async (req, res) => {
  const sem = await Semester.findByPk(req.params.id);
  if (!sem) return notFound(res, 'Semester tidak ditemukan');
  if (req.body.is_aktif) {
    await Semester.update({ is_aktif: false }, { where: { tahun_pelajaran_id: sem.tahun_pelajaran_id } });
  }
  await sem.update(req.body);
  return success(res, sem, 'Semester berhasil diperbarui');
};

const deleteSemester = async (req, res) => {
  const sem = await Semester.findByPk(req.params.id);
  if (!sem) return notFound(res, 'Semester tidak ditemukan');
  if (sem.is_aktif) return badRequest(res, 'Tidak bisa menghapus semester yang sedang aktif');
  await sem.destroy();
  return success(res, null, 'Semester berhasil dihapus');
};

// ============================================================
// KALENDER AKADEMIK
// ============================================================
const getKalender = async (req, res) => {
  const { tahun_pelajaran_id } = req.query;
  const where = tahun_pelajaran_id ? { tahun_pelajaran_id } : {};
  const list = await KalenderAkademik.findAll({ where, order: [['tanggal_mulai', 'ASC']] });
  return success(res, list);
};

const createKalender = async (req, res) => {
  const item = await KalenderAkademik.create(req.body);
  return created(res, item, 'Kegiatan kalender berhasil ditambahkan');
};

const updateKalender = async (req, res) => {
  const item = await KalenderAkademik.findByPk(req.params.id);
  if (!item) return notFound(res, 'Data kalender tidak ditemukan');
  await item.update(req.body);
  return success(res, item, 'Kalender berhasil diperbarui');
};

const deleteKalender = async (req, res) => {
  const item = await KalenderAkademik.findByPk(req.params.id);
  if (!item) return notFound(res, 'Data kalender tidak ditemukan');
  await item.destroy();
  return success(res, null, 'Kalender berhasil dihapus');
};

// ============================================================
// BULK DELETE
// ============================================================

/**
 * Helper: validasi array ids dari request body
 */
const getIds = (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    badRequest(res, 'ids harus berupa array dan tidak boleh kosong');
    return null;
  }
  return ids;
};

const bulkDeleteGuru = async (req, res) => {
  const ids = getIds(req, res); if (!ids) return;
  // Hard delete — hapus permanen dari database
  await Guru.destroy({ where: { id: ids } });
  ids.forEach(id => syncEvent('guru.deleted', { id }));
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'BULK_DELETE', resource: 'guru', description: `Bulk delete permanen ${ids.length} guru` });
  return success(res, { deleted: ids.length }, `${ids.length} guru berhasil dihapus permanen`);
};

const bulkDeleteSiswa = async (req, res) => {
  const ids = getIds(req, res); if (!ids) return;
  await Siswa.destroy({ where: { id: ids } });
  ids.forEach(id => syncEvent('siswa.deleted', { id }));
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'BULK_DELETE', resource: 'siswa', description: `Bulk delete permanen ${ids.length} siswa` });
  return success(res, { deleted: ids.length }, `${ids.length} siswa berhasil dihapus permanen`);
};

const bulkDeletePegawai = async (req, res) => {
  const ids = getIds(req, res); if (!ids) return;
  await Pegawai.destroy({ where: { id: ids } });
  ids.forEach(id => syncEvent('pegawai.deleted', { id }));
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'BULK_DELETE', resource: 'pegawai', description: `Bulk delete permanen ${ids.length} pegawai` });
  return success(res, { deleted: ids.length }, `${ids.length} pegawai berhasil dihapus permanen`);
};

const bulkDeleteJurusan = async (req, res) => {
  const ids = getIds(req, res); if (!ids) return;
  await Jurusan.destroy({ where: { id: ids } });
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'BULK_DELETE', resource: 'jurusan', description: `Bulk delete permanen ${ids.length} jurusan` });
  return success(res, { deleted: ids.length }, `${ids.length} jurusan berhasil dihapus permanen`);
};

const bulkDeleteKelas = async (req, res) => {
  const ids = getIds(req, res); if (!ids) return;
  await Kelas.destroy({ where: { id: ids } });
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'BULK_DELETE', resource: 'kelas', description: `Bulk delete permanen ${ids.length} kelas` });
  return success(res, { deleted: ids.length }, `${ids.length} kelas berhasil dihapus permanen`);
};

const bulkDeleteMapel = async (req, res) => {
  const ids = getIds(req, res); if (!ids) return;
  await MataPelajaran.destroy({ where: { id: ids } });
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'BULK_DELETE', resource: 'mapel', description: `Bulk delete permanen ${ids.length} mapel` });
  return success(res, { deleted: ids.length }, `${ids.length} mata pelajaran berhasil dihapus permanen`);
};

module.exports = {
  // Guru
  getGuru, getGuruById, createGuru, updateGuru, deleteGuru, bulkDeleteGuru,
  // Siswa
  getSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa, bulkDeleteSiswa, createSiswaUser, bulkCreateSiswaUser, resetSiswaPassword, bulkResetSiswaPassword,
  // Pegawai
  getPegawai, createPegawai, updatePegawai, deletePegawai, bulkDeletePegawai,
  // Jurusan
  getJurusan, createJurusan, updateJurusan, bulkDeleteJurusan,
  // Kelas
  getKelas, createKelas, updateKelas, bulkDeleteKelas,
  // Mapel
  getMapel, createMapel, updateMapel, bulkDeleteMapel,
  // Tahun Pelajaran & Semester
  getTahunPelajaran, createTahunPelajaran, updateTahunPelajaran, deleteTahunPelajaran, setTahunAktif,
  getSemester, createSemester, updateSemester, deleteSemester,
  // Kalender
  getKalender, createKalender, updateKalender, deleteKalender,
};
