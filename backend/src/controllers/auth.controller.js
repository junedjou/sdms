const { Op } = require('sequelize');
const { User, Role, Permission, RolePermission } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  blacklistToken,
} = require('../middleware/auth');
const { verifyPassword, hashPassword } = require('../utils/helpers');
const { writeAuditLog } = require('../middleware/auditLog');
const { getClientIp } = require('../utils/helpers');
const { success, unauthorized, badRequest, error } = require('../utils/response');
const { redisClient } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Ambil permissions milik user dari role-nya
 */
const getUserPermissions = async (roleId) => {
  const rolePerms = await RolePermission.findAll({
    where: { role_id: roleId },
    include: [{ model: Permission, as: 'permission', attributes: ['name'] }],
  });
  return rolePerms.map((rp) => rp.permission?.name).filter(Boolean);
};

// POST /api/v1/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;
  const ip = getClientIp(req);

  try {
    // Cari user beserta role-nya (unscoped agar password ikut)
    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
        is_active: true,
      },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      await writeAuditLog({ action: 'LOGIN', resource: 'auth', description: `Login gagal: username ${username} tidak ditemukan`, ipAddress: ip, status: 'failed' });
      return unauthorized(res, 'Username atau password salah.');
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      await writeAuditLog({ userId: user.id, username: user.username, action: 'LOGIN', resource: 'auth', description: 'Login gagal: password salah', ipAddress: ip, status: 'failed' });
      return unauthorized(res, 'Username atau password salah.');
    }

    // Ambil permissions
    const permissions = await getUserPermissions(user.role_id);

    // Build token payload
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role?.name,
      extra_roles: user.extra_roles || [],
      permissions,
    };

    const accessToken  = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: user.id });

    // Simpan refresh token di Redis (7d)
    try {
      await redisClient.setex(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken);
    } catch { /* Redis tidak tersedia */ }

    // Update last_login
    await user.update({ last_login_at: new Date(), refresh_token: refreshToken });

    await writeAuditLog({ userId: user.id, username: user.username, action: 'LOGIN', resource: 'auth', description: 'Login berhasil', ipAddress: ip, status: 'success' });

    return success(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: '8h',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar,
        role: user.role?.name,
        role_label: user.role?.label,
        extra_roles: user.extra_roles || [],
        permissions,
      },
    }, 'Login berhasil');
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    return error(res, 'Terjadi kesalahan saat login');
  }
};

// POST /api/v1/auth/refresh
const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  try {
    const decoded = verifyRefreshToken(refresh_token);

    const user = await User.unscoped().findOne({
      where: { id: decoded.id, is_active: true },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) return unauthorized(res, 'User tidak ditemukan atau tidak aktif');

    // Validasi refresh token di Redis
    try {
      const stored = await redisClient.get(`refresh:${user.id}`);
      if (stored && stored !== refresh_token) {
        return unauthorized(res, 'Refresh token tidak valid');
      }
    } catch { /* skip */ }

    const permissions = await getUserPermissions(user.role_id);
    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role?.name,
      permissions,
    });

    return success(res, { access_token: newAccessToken, expires_in: '8h' }, 'Token diperbarui');
  } catch (err) {
    return unauthorized(res, 'Refresh token tidak valid atau sudah kadaluarsa');
  }
};

// POST /api/v1/auth/logout
const logout = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  const ip = getClientIp(req);

  if (token) await blacklistToken(token);

  // Hapus refresh token dari Redis
  try {
    await redisClient.del(`refresh:${req.user.id}`);
  } catch { /* skip */ }

  await User.update({ refresh_token: null }, { where: { id: req.user.id } });

  await writeAuditLog({ userId: req.user.id, username: req.user.username, action: 'LOGOUT', resource: 'auth', description: 'Logout berhasil', ipAddress: ip });

  return success(res, null, 'Logout berhasil');
};

// GET /api/v1/auth/me
const getMe = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id },
    include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }],
  });
  if (!user) return unauthorized(res, 'User tidak ditemukan');

  return success(res, {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    avatar: user.avatar,
    role: user.role?.name,
    role_label: user.role?.label,
    permissions: user.role?.permissions?.map((p) => p.name) || [],
    last_login_at: user.last_login_at,
  });
};

// PATCH /api/v1/auth/change-password
const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;

  const user = await User.unscoped().findByPk(req.user.id);
  if (!user) return unauthorized(res, 'User tidak ditemukan');

  const isMatch = await verifyPassword(old_password, user.password);
  if (!isMatch) return badRequest(res, 'Password lama tidak sesuai');

  const hashed = await hashPassword(new_password);
  await user.update({ password: hashed, password_changed_at: new Date() });

  await writeAuditLog({ userId: user.id, username: user.username, action: 'UPDATE', resource: 'auth', description: 'Password diubah' });

  return success(res, null, 'Password berhasil diubah');
};

module.exports = { login, refreshToken, logout, getMe, changePassword };
