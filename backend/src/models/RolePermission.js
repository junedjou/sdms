const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');

/**
 * Tabel pivot: Role <-> Permission (many-to-many)
 */
const RolePermission = masterDB.define('RolePermission', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'roles', key: 'id' },
  },
  permission_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'permissions', key: 'id' },
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['role_id', 'permission_id'], unique: true },
  ],
});

module.exports = RolePermission;
