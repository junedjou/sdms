const { Op } = require('sequelize');
const {
  Guru, Siswa, Pegawai, OrangTua, Kelas, Jurusan,
  MataPelajaran, TahunPelajaran, Semester, SiswaKelas, KalenderAkademik,
} = require('../models');
const { getPagination } = require('../utils/helpers');
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
  const oldData = guru.toJSON();
  await guru.update(req.body);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'guru', resourceId: guru.id, description: `Guru ${guru.nama} diperbarui`, oldData, newData: req.body });
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

// ============================================================
// SISWA
// ============================================================
const getSiswa = async (req, res) => {
  const { page = 1, limit = 10, search = '', jurusan_id, status = 'Aktif' } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);
  const where = {};
  if (status) where.status = status;
  if (search) where[Op.or] = [{ nama: { [Op.like]: `%${search}%` } }, { nisn: { [Op.like]: `%${search}%` } }, { nis: { [Op.like]: `%${search}%` } }];
  if (jurusan_id) where.jurusan_id = jurusan_id;
  const { count, rows } = await Siswa.findAndCountAll({
    where, limit: lim, offset,
    include: [{ association: 'jurusan', attributes: ['id', 'kode', 'nama'] }],
    order: [['nama', 'ASC']],
  });
  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

const getSiswaById = async (req, res) => {
  const siswa = await Siswa.findByPk(req.params.id, { include: ['jurusan', 'orangTua', 'riwayatKelas'] });
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
  const siswa = await Siswa.findByPk(req.params.id);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');
  const oldData = siswa.toJSON();
  await siswa.update(req.body);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'siswa', resourceId: siswa.id, description: `Siswa ${siswa.nama} diperbarui`, oldData, newData: req.body });
  await syncEvent('siswa.updated', siswa.toJSON());
  return success(res, siswa, 'Data siswa berhasil diperbarui');
};

const deleteSiswa = async (req, res) => {
  const siswa = await Siswa.findByPk(req.params.id);
  if (!siswa) return notFound(res, 'Data siswa tidak ditemukan');
  await siswa.update({ status: 'Keluar' });
  await syncEvent('siswa.deleted', { id: siswa.id });
  return success(res, null, 'Data siswa berhasil dinonaktifkan');
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
  return created(res, pegawai, 'Data pegawai berhasil ditambahkan');
};

const updatePegawai = async (req, res) => {
  const pegawai = await Pegawai.findByPk(req.params.id);
  if (!pegawai) return notFound(res, 'Data pegawai tidak ditemukan');
  await pegawai.update(req.body);
  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'UPDATE', resource: 'pegawai', resourceId: pegawai.id, description: `Pegawai ${pegawai.nama} diperbarui` });
  return success(res, pegawai, 'Data pegawai berhasil diperbarui');
};

const deletePegawai = async (req, res) => {
  const pegawai = await Pegawai.findByPk(req.params.id);
  if (!pegawai) return notFound(res, 'Data pegawai tidak ditemukan');
  await pegawai.update({ is_active: false });
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
  return created(res, kelas, 'Kelas berhasil dibuat');
};

const updateKelas = async (req, res) => {
  const kelas = await Kelas.findByPk(req.params.id);
  if (!kelas) return notFound(res, 'Kelas tidak ditemukan');
  await kelas.update(req.body);
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
  const mapel = await MataPelajaran.create(req.body);
  return created(res, mapel, 'Mata pelajaran berhasil ditambahkan');
};

const updateMapel = async (req, res) => {
  const mapel = await MataPelajaran.findByPk(req.params.id);
  if (!mapel) return notFound(res, 'Mata pelajaran tidak ditemukan');
  await mapel.update(req.body);
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

module.exports = {
  // Guru
  getGuru, getGuruById, createGuru, updateGuru, deleteGuru,
  // Siswa
  getSiswa, getSiswaById, createSiswa, updateSiswa, deleteSiswa,
  // Pegawai
  getPegawai, createPegawai, updatePegawai, deletePegawai,
  // Jurusan
  getJurusan, createJurusan, updateJurusan,
  // Kelas
  getKelas, createKelas, updateKelas,
  // Mapel
  getMapel, createMapel, updateMapel,
  // Tahun Pelajaran & Semester
  getTahunPelajaran, createTahunPelajaran, setTahunAktif,
  getSemester, createSemester,
  // Kalender
  getKalender, createKalender, updateKalender, deleteKalender,
};
