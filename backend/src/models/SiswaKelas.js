const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

/**
 * Tabel pivot: penempatan siswa di kelas per tahun pelajaran
 */
const SiswaKelas = masterDB.define('SiswaKelas', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  siswa_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'siswa', key: 'id' },
  },
  kelas_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'kelas', key: 'id' },
  },
  tahun_pelajaran_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'tahun_pelajaran', key: 'id' },
  },
  semester_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'semester', key: 'id' },
  },
  nomor_absen: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_aktif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'siswa_kelas',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['siswa_id', 'kelas_id', 'tahun_pelajaran_id'], unique: true },
  ],
});

module.exports = SiswaKelas;
