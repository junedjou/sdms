const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Jurusan = masterDB.define('Jurusan', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Contoh: TKJ, RPL, AKL',
  },
  nama: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Contoh: Teknik Komputer dan Jaringan',
  },
  kepala_jurusan_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'guru', key: 'id' },
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'jurusan',
  timestamps: true,
  underscored: true,
});

module.exports = Jurusan;
