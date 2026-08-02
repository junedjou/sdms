const { forbidden } = require('../utils/response');

/**
 * RBAC - Role Based Access Control
 *
 * Penggunaan:
 *   router.get('/users', authenticate, requireRole('admin'), handler)
 *   router.delete('/data', authenticate, requirePermission('master:delete'), handler)
 */

/**
 * Cek apakah user memiliki salah satu dari role yang diizinkan
 * @param {...string} roles - Daftar role yang diizinkan
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Akses ditolak. Tidak terautentikasi.');
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return forbidden(
        res,
        `Akses ditolak. Role '${userRole}' tidak memiliki izin untuk aksi ini. Diperlukan: [${roles.join(', ')}]`
      );
    }

    next();
  };
};

/**
 * Cek apakah user memiliki permission spesifik
 * Format permission: 'resource:action', contoh: 'siswa:create', 'guru:delete'
 * @param {...string} permissions - Daftar permission yang diperlukan (salah satu saja cukup)
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Akses ditolak. Tidak terautentikasi.');
    }

    // Super admin bypass semua permission check
    if (req.user.role === 'super_admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return forbidden(
        res,
        `Akses ditolak. Permission yang dibutuhkan: [${permissions.join(', ')}]`
      );
    }

    next();
  };
};

/**
 * Cek apakah user memiliki SEMUA permission yang disebutkan
 * @param {...string} permissions
 */
const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Akses ditolak. Tidak terautentikasi.');
    }

    if (req.user.role === 'super_admin') return next();

    const userPermissions = req.user.permissions || [];
    const missingPermissions = permissions.filter((p) => !userPermissions.includes(p));

    if (missingPermissions.length > 0) {
      return forbidden(
        res,
        `Akses ditolak. Permission yang kurang: [${missingPermissions.join(', ')}]`
      );
    }

    next();
  };
};

/**
 * Super admin only
 */
const superAdminOnly = requireRole('super_admin');

/**
 * Alias isSuperAdmin untuk middleware settings
 */
const isSuperAdmin = superAdminOnly;

/**
 * Admin atau super admin
 */
const adminOnly = requireRole('super_admin', 'admin');

module.exports = { requireRole, requirePermission, requireAllPermissions, superAdminOnly, isSuperAdmin, adminOnly };
