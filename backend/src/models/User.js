const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const User = masterDB.define('User', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  role_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'roles', key: 'id' },
  },
  // Relasi opsional ke entitas (salah satu terisi)
  guru_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'guru', key: 'id' },
  },
  siswa_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'siswa', key: 'id' },
  },
  pegawai_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'pegawai', key: 'id' },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  password_changed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  defaultScope: {
    attributes: { exclude: ['password', 'refresh_token'] },
  },
  scopes: {
    withPassword: { attributes: {} }, // semua kolom termasuk password
  },
});

module.exports = User;
