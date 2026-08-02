const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Semester = masterDB.define('Semester', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tahun_pelajaran_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'tahun_pelajaran', key: 'id' },
  },
  nama: {
    type: DataTypes.ENUM('Ganjil', 'Genap'),
    allowNull: false,
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
  },
}, {
  tableName: 'semester',
  timestamps: true,
  underscored: true,
});

module.exports = Semester;
