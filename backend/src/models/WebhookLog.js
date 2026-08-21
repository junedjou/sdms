const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

/**
 * WebhookLog — mencatat setiap pengiriman webhook.
 *
 * Berguna untuk:
 * - Debug: lihat payload apa yang dikirim
 * - Monitoring: berapa banyak yang berhasil/gagal
 * - Retry: log status untuk retry mechanism
 */
const WebhookLog = masterDB.define('WebhookLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  api_client_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID aplikasi tujuan',
  },
  event: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nama event (misal: siswa.created)',
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Data yang dikirim',
  },
  webhook_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL tujuan webhook',
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'retrying'),
    defaultValue: 'pending',
    comment: 'Status pengiriman',
  },
  http_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HTTP response code dari server tujuan',
  },
  response_body: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Response body (dipotong jika terlalu panjang)',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message jika gagal',
  },
  attempt: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Percobaan ke-berapa (1 = pertama, max 3)',
  },
  duration_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lama pengiriman dalam milidetik',
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Waktu pengiriman',
  },
}, {
  tableName: 'webhook_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['api_client_id'] },
    { fields: ['event'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
  ],
});

module.exports = WebhookLog;
