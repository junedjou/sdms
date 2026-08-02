const { DataTypes } = require('sequelize');
const { masterDB } = require('../config/database');
const logger = require('../utils/logger');
const { getClientIp } = require('../utils/helpers');

// ── Model AuditLog ────────────────────────────────────────────
const AuditLog = masterDB.define('AuditLog', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id:     { type: DataTypes.CHAR(36), allowNull: true },
  username:    { type: DataTypes.STRING(100), allowNull: true },
  action:      { type: DataTypes.STRING(50), allowNull: false },  // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  resource:    { type: DataTypes.STRING(100), allowNull: false },
  resource_id: { type: DataTypes.STRING(100), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  old_data:    { type: DataTypes.JSON, allowNull: true },
  new_data:    { type: DataTypes.JSON, allowNull: true },
  ip_address:  { type: DataTypes.STRING(45), allowNull: true },
  user_agent:  { type: DataTypes.TEXT, allowNull: true },
  status:      { type: DataTypes.ENUM('success', 'failed'), defaultValue: 'success' },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['resource'] },
    { fields: ['created_at'] },
  ],
});

// ── Tulis log ─────────────────────────────────────────────────
const writeAuditLog = async ({ userId = null, username = null, action, resource, resourceId = null, description = null, oldData = null, newData = null, ipAddress = null, userAgent = null, status = 'success' }) => {
  try {
    await AuditLog.create({ user_id: userId, username, action, resource, resource_id: resourceId, description, old_data: oldData, new_data: newData, ip_address: ipAddress, user_agent: userAgent, status });
  } catch (err) {
    logger.warn(`Audit log gagal: ${err.message}`);
  }
};

// ── Middleware otomatis ───────────────────────────────────────
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      await writeAuditLog({ userId: req.user?.id, username: req.user?.username, action, resource, resourceId: req.params?.id, description: `${req.method} ${req.originalUrl}`, ipAddress: getClientIp(req), userAgent: req.headers['user-agent'], status: isSuccess ? 'success' : 'failed' });
      return originalJson(body);
    };
    next();
  };
};

module.exports = { AuditLog, writeAuditLog, auditMiddleware };
