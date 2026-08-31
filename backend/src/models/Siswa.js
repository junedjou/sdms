const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Siswa = masterDB.define('Siswa', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nisn: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Nomor Induk Siswa Nasional',
  },
  nis: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Nomor Induk Siswa (internal sekolah)',
  },
  nama: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false,
  },
  tempat_lahir: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tanggal_lahir: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  agama: {
    type: DataTypes.ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'),
    allowNull: true,
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  no_hp: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  hp_ortu: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Nomor HP orang tua/wali',
  },
  nama_ayah: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nama ayah kandung',
  },
  nama_ibu: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nama ibu kandung',
  },
  pernah_dapat_bantuan: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Apakah siswa pernah mendapat bantuan (KIP, PIP, dll)',
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },
  foto: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  jurusan_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'jurusan', key: 'id' },
  },
  kelas_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'kelas', key: 'id' },
    comment: 'Kelas aktif siswa saat ini',
  },
  orang_tua_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'orang_tua', key: 'id' },
  },
  tahun_masuk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tahun masuk sekolah, contoh: 2022',
  },
  status: {
    type: DataTypes.ENUM('Aktif', 'Lulus', 'Pindah', 'Keluar', 'Meninggal'),
    defaultValue: 'Aktif',
  },
}, {
  tableName: 'siswa',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['nama'] },
    { fields: ['nisn'] },
    { fields: ['status'] },
    { fields: ['jurusan_id'] },
    { fields: ['kelas_id'] },
  ],
});

module.exports = Siswa;
