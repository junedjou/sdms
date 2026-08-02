const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Pegawai = masterDB.define('Pegawai', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nip: {
    type: DataTypes.STRING(30),
    allowNull: true,
    unique: true,
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
  jabatan: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Contoh: Staf TU, Bendahara, Kepala TU',
  },
  unit_kerja: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status_kepegawaian: {
    type: DataTypes.ENUM('PNS', 'PPPK', 'PTY', 'PTT', 'Honor'),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'pegawai',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['nama'] }],
});

module.exports = Pegawai;
