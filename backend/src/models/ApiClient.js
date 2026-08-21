const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');
const crypto = require('crypto');

/**
 * ApiClient — mendaftarkan aplikasi eksternal yang terhubung ke SDMS.
 *
 * Setiap aplikasi yang ingin menerima webhook dari SDMS harus
 * terdaftar di sini. ApiClient menyimpan:
 * - webhook_url: URL yang akan menerima push dari SDMS
 * - api_key: kunci API untuk autentikasi (dibuat otomatis)
 * - api_secret: secret untuk verifikasi webhook (dibuat otomatis)
 * - events: array event yang ingin didengar (misal: ['siswa.created', 'guru.updated'])
 * - status: aktif / nonaktif
 */
const ApiClient = masterDB.define('ApiClient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nama aplikasi (misal: LMS, Piket, Website)',
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Identifier unik (misal: lms, piket, website)',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi singkat aplikasi',
  },
  webhook_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL endpoint yang akan menerima webhook dari SDMS',
  },
  api_key: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'API key untuk autentikasi request dari aplikasi ini',
  },
  api_secret: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: 'Secret untuk verifikasi signature webhook',
  },
  events: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array event yang didengar. ["*"] = semua event',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'error'),
    defaultValue: 'active',
    comment: 'Status koneksi aplikasi',
  },
  last_sync_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Terakhir kali webhook berhasil dikirim',
  },
  last_error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error terakhir jika status = error',
  },
  error_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah error berturut-turut (reset saat berhasil)',
  },
  total_delivered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total webhook berhasil terkirim',
  },
  total_failed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total webhook gagal',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID yang mendaftarkan aplikasi',
  },
}, {
  tableName: 'api_clients',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (client) => {
      // Auto-generate API key jika belum ada
      if (!client.api_key) {
        client.api_key = 'sdms_' + crypto.randomBytes(32).toString('hex');
      }
      // Auto-generate API secret jika belum ada
      if (!client.api_secret) {
        client.api_secret = crypto.randomBytes(48).toString('hex');
      }
      // Auto-generate slug dari name
      if (client.name && !client.slug) {
        client.slug = client.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
    },
  },
});

module.exports = ApiClient;
