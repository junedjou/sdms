const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Role = masterDB.define('Role', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Contoh: super_admin, admin, guru, pegawai, siswa',
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Label tampilan, contoh: Super Administrator',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
});

module.exports = Role;
