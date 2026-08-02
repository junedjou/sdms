const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Kelas = masterDB.define('Kelas', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Contoh: X TKJ 1, XI RPL 2',
  },
  tingkat: {
    type: DataTypes.ENUM('X', 'XI', 'XII'),
    allowNull: false,
  },
  jurusan_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'jurusan', key: 'id' },
  },
  wali_kelas_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'guru', key: 'id' },
  },
  tahun_pelajaran_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'tahun_pelajaran', key: 'id' },
  },
  kapasitas: {
    type: DataTypes.INTEGER,
    defaultValue: 36,
  },
  ruangan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'kelas',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tahun_pelajaran_id'] },
    { fields: ['jurusan_id'] },
  ],
});

module.exports = Kelas;
