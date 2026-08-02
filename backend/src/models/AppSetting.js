const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

/**
 * AppSetting — menyimpan konfigurasi tampilan aplikasi SDMS
 * Setiap setting disimpan sebagai key-value pair.
 * Hanya bisa diubah oleh super_admin.
 */
const AppSetting = masterDB.define('AppSetting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Kunci setting, contoh: app_name, sidebar_color, login_headline',
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Nilai setting dalam bentuk string (termasuk JSON untuk nilai kompleks)',
  },
  label: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Label tampilan untuk UI',
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general',
    comment: 'Grup: general, branding, sidebar, login',
  },
  type: {
    type: DataTypes.ENUM('text', 'color', 'image', 'textarea', 'boolean'),
    defaultValue: 'text',
    comment: 'Tipe input untuk UI',
  },
}, {
  tableName: 'app_settings',
  timestamps: true,
  underscored: true,
});

module.exports = AppSetting;
