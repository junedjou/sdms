const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const OrangTua = masterDB.define('OrangTua', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nama_ayah: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  nama_ibu: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  nama_wali: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Diisi jika wali bukan ayah/ibu',
  },
  pekerjaan_ayah: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pekerjaan_ibu: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  no_hp_ayah: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  no_hp_ibu: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  no_hp_wali: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  penghasilan_ayah: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  penghasilan_ibu: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
}, {
  tableName: 'orang_tua',
  timestamps: true,
  underscored: true,
});

module.exports = OrangTua;
