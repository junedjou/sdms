const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

const Permission = masterDB.define('Permission', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Format: resource:action, contoh: siswa:create, guru:delete',
  },
  label: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Label tampilan, contoh: Tambah Data Siswa',
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Grup permission, contoh: master_data, lms, jurnal',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
});

module.exports = Permission;
