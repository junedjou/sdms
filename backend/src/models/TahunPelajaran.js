const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const TahunPelajaran = masterDB.define('TahunPelajaran', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Contoh: 2024/2025',
  },
  tanggal_mulai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  tanggal_selesai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  is_aktif: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Hanya satu tahun pelajaran yang aktif',
  },
}, {
  tableName: 'tahun_pelajaran',
  timestamps: true,
  underscored: true,
});

module.exports = TahunPelajaran;
