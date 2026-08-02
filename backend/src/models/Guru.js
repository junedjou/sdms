const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Guru = masterDB.define('Guru', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nip: {
    type: DataTypes.STRING(30),
    allowNull: true,
    unique: true,
    comment: 'Nomor Induk Pegawai (NIP ASN) atau NIY (Non-ASN)',
  },
  niy: {
    type: DataTypes.STRING(30),
    allowNull: true,
    unique: true,
    comment: 'Nomor Induk Yayasan',
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
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },
  foto: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status_kepegawaian: {
    type: DataTypes.ENUM('PNS', 'PPPK', 'GTY', 'GTT', 'Honor'),
    allowNull: true,
  },
  jabatan: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Contoh: Wali Kelas, Wakasek Kurikulum, Kepala Sekolah',
  },
  jurusan_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'jurusan', key: 'id' },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'guru',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['nama'] },
    { fields: ['is_active'] },
  ],
});

module.exports = Guru;
