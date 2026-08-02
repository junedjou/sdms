const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const MataPelajaran = masterDB.define('MataPelajaran', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Contoh: MAT, IND, PKK-TKJ',
  },
  nama: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Contoh: Matematika, Bahasa Indonesia',
  },
  kelompok: {
    type: DataTypes.ENUM('A', 'B', 'C', 'Muatan Lokal', 'Pengembangan Diri'),
    allowNull: true,
    comment: 'Kelompok mata pelajaran sesuai kurikulum',
  },
  jurusan_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'jurusan', key: 'id' },
    comment: 'NULL jika mapel umum (semua jurusan)',
  },
  jam_per_minggu: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'mata_pelajaran',
  timestamps: true,
  underscored: true,
});

module.exports = MataPelajaran;
