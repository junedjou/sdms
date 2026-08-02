const { masterDB } = require('../config/database');
const logger = require('../utils/logger');

// Import semua model
const Role            = require('./Role');
const Permission      = require('./Permission');
const RolePermission  = require('./RolePermission');
const User            = require('./User');
const Jurusan         = require('./Jurusan');
const TahunPelajaran  = require('./TahunPelajaran');
const Semester        = require('./Semester');
const Guru            = require('./Guru');
const Pegawai         = require('./Pegawai');
const OrangTua        = require('./OrangTua');
const Siswa           = require('./Siswa');
const Kelas           = require('./Kelas');
const SiswaKelas      = require('./SiswaKelas');
const MataPelajaran   = require('./MataPelajaran');
const KalenderAkademik = require('./KalenderAkademik');
const { AuditLog }   = require('../middleware/auditLog');

// ============================================================
// ASOSIASI / RELASI
// ============================================================

// Role <-> Permission (many-to-many via RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

// RolePermission -> Permission & Role (untuk query langsung)
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' });
RolePermission.belongsTo(Role,       { foreignKey: 'role_id',       as: 'role' });
Permission.hasMany(RolePermission,   { foreignKey: 'permission_id', as: 'rolePermissions' });
Role.hasMany(RolePermission,         { foreignKey: 'role_id',       as: 'rolePermissions' });

// User -> Role
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// User -> Guru / Siswa / Pegawai (opsional)
User.belongsTo(Guru,    { foreignKey: 'guru_id',    as: 'guru' });
User.belongsTo(Siswa,   { foreignKey: 'siswa_id',   as: 'siswa' });
User.belongsTo(Pegawai, { foreignKey: 'pegawai_id', as: 'pegawai' });

// Guru -> Jurusan
Guru.belongsTo(Jurusan,    { foreignKey: 'jurusan_id', as: 'jurusan' });
Jurusan.hasMany(Guru,      { foreignKey: 'jurusan_id', as: 'guru' });
Jurusan.belongsTo(Guru,    { foreignKey: 'kepala_jurusan_id', as: 'kepalaJurusan' });

// Siswa -> Jurusan, OrangTua
Siswa.belongsTo(Jurusan,   { foreignKey: 'jurusan_id',  as: 'jurusan' });
Jurusan.hasMany(Siswa,     { foreignKey: 'jurusan_id',  as: 'siswa' });
Siswa.belongsTo(OrangTua,  { foreignKey: 'orang_tua_id', as: 'orangTua' });
OrangTua.hasOne(Siswa,     { foreignKey: 'orang_tua_id', as: 'siswa' });

// Kelas -> Jurusan, Guru (wali kelas), TahunPelajaran
Kelas.belongsTo(Jurusan,       { foreignKey: 'jurusan_id',       as: 'jurusan' });
Kelas.belongsTo(Guru,          { foreignKey: 'wali_kelas_id',    as: 'waliKelas' });
Kelas.belongsTo(TahunPelajaran,{ foreignKey: 'tahun_pelajaran_id', as: 'tahunPelajaran' });
TahunPelajaran.hasMany(Kelas,  { foreignKey: 'tahun_pelajaran_id', as: 'kelas' });

// Semester -> TahunPelajaran
Semester.belongsTo(TahunPelajaran, { foreignKey: 'tahun_pelajaran_id', as: 'tahunPelajaran' });
TahunPelajaran.hasMany(Semester,   { foreignKey: 'tahun_pelajaran_id', as: 'semester' });

// SiswaKelas (pivot) -> Siswa, Kelas, TahunPelajaran, Semester
SiswaKelas.belongsTo(Siswa,          { foreignKey: 'siswa_id',          as: 'siswa' });
SiswaKelas.belongsTo(Kelas,          { foreignKey: 'kelas_id',          as: 'kelas' });
SiswaKelas.belongsTo(TahunPelajaran, { foreignKey: 'tahun_pelajaran_id', as: 'tahunPelajaran' });
SiswaKelas.belongsTo(Semester,       { foreignKey: 'semester_id',        as: 'semester' });
Siswa.hasMany(SiswaKelas,            { foreignKey: 'siswa_id',           as: 'riwayatKelas' });
Kelas.hasMany(SiswaKelas,            { foreignKey: 'kelas_id',           as: 'anggotaKelas' });

// MataPelajaran -> Jurusan
MataPelajaran.belongsTo(Jurusan, { foreignKey: 'jurusan_id', as: 'jurusan' });
Jurusan.hasMany(MataPelajaran,   { foreignKey: 'jurusan_id', as: 'mataPelajaran' });

// KalenderAkademik -> TahunPelajaran, Semester
KalenderAkademik.belongsTo(TahunPelajaran, { foreignKey: 'tahun_pelajaran_id', as: 'tahunPelajaran' });
KalenderAkademik.belongsTo(Semester,       { foreignKey: 'semester_id',        as: 'semester' });
TahunPelajaran.hasMany(KalenderAkademik,   { foreignKey: 'tahun_pelajaran_id', as: 'kalender' });

// ============================================================
// SYNC ke database
// ============================================================
const syncModels = async () => {
  try {
    // force:false, alter:false — hanya buat tabel jika belum ada, tidak mengubah struktur
    // Aman untuk production dan menghindari error "Too many keys" di MariaDB
    await masterDB.sync({ force: false, alter: false });
    logger.info('Semua model berhasil di-sync ke MariaDB Master');
  } catch (err) {
    logger.error(`Gagal sync model: ${err.message}`);
    throw err;
  }
};

module.exports = {
  masterDB,
  syncModels,
  // Export semua model
  Role,
  Permission,
  RolePermission,
  User,
  Jurusan,
  TahunPelajaran,
  Semester,
  Guru,
  Pegawai,
  OrangTua,
  Siswa,
  Kelas,
  SiswaKelas,
  MataPelajaran,
  KalenderAkademik,
  AuditLog,
};
