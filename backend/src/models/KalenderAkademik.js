const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const KalenderAkademik = masterDB.define('KalenderAkademik', {
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
  semester_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'semester', key: 'id' },
  },
  judul: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Contoh: UTS Semester Ganjil, Libur Idul Fitri',
  },
  tanggal_mulai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  tanggal_selesai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  jenis: {
    type: DataTypes.ENUM('libur', 'ujian', 'kegiatan', 'penerimaan', 'lainnya'),
    defaultValue: 'kegiatan',
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  warna: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Hex color untuk kalender UI, contoh: #FF5733',
  },
}, {
  tableName: 'kalender_akademik',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tahun_pelajaran_id'] },
    { fields: ['tanggal_mulai'] },
  ],
});

module.exports = KalenderAkademik;
