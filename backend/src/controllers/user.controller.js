const { Op } = require('sequelize');
const { User, Role, Permission } = require('../models');
const { hashPassword, getPagination } = require('../utils/helpers');
const { writeAuditLog } = require('../middleware/auditLog');
const { success, created, paginated, notFound, conflict, badRequest } = require('../utils/response');
const Joi = require('joi');

// GET /api/v1/users
const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '', role: roleName } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { full_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const include = [{ model: Role, as: 'role', attributes: ['id', 'name', 'label'] }];

  if (roleName) {
    include[0].where = { name: roleName };
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include,
    limit: lim,
    offset,
    order: [['created_at', 'DESC']],
  });

  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

// GET /api/v1/users/:id
const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }],
  });
  if (!user) return notFound(res, 'User tidak ditemukan');
  return success(res, user);
};

// POST /api/v1/users
const createUser = async (req, res) => {
  const { username, email, password, full_name, role_id, guru_id, siswa_id, pegawai_id, extra_roles } = req.body;

  const existing = await User.unscoped().findOne({ where: { [Op.or]: [{ username }, { email }] } });
  if (existing) return conflict(res, 'Username atau email sudah digunakan');

  const role = await Role.findByPk(role_id);
  if (!role) return badRequest(res, 'Role tidak ditemukan');

  const hashed = await hashPassword(password);
  const user = await User.create({
    username, email, full_name, role_id,
    password: hashed,
    guru_id: guru_id || null,
    siswa_id: siswa_id || null,
    pegawai_id: pegawai_id || null,
    extra_roles: extra_roles || null,
  });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'CREATE', resource: 'users', resourceId: user.id,
    description: `User ${username} dibuat`,
  });

  const newUser = await User.findByPk(user.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'label'] }],
  });
  return created(res, newUser, 'User berhasil dibuat');
};

// PUT /api/v1/users/:id
const updateUser = async (req, res) => {
  const user = await User.unscoped().findByPk(req.params.id);
  if (!user) return notFound(res, 'User tidak ditemukan');

  const { username, email, full_name, role_id, is_active, guru_id, siswa_id, pegawai_id, extra_roles } = req.body;

  // Cek duplikat username/email (kecuali milik user ini sendiri)
  if (username || email) {
    const conditions = [];
    if (username) conditions.push({ username });
    if (email) conditions.push({ email });
    const dup = await User.unscoped().findOne({
      where: { [Op.or]: conditions, id: { [Op.ne]: user.id } },
    });
    if (dup) return conflict(res, 'Username atau email sudah digunakan user lain');
  }

  const oldData = { username: user.username, email: user.email, role_id: user.role_id, is_active: user.is_active };

  await user.update({
    username: username ?? user.username,
    email: email ?? user.email,
    full_name: full_name ?? user.full_name,
    role_id: role_id ?? user.role_id,
    is_active: is_active ?? user.is_active,
    guru_id: guru_id !== undefined ? guru_id : user.guru_id,
    siswa_id: siswa_id !== undefined ? siswa_id : user.siswa_id,
    pegawai_id: pegawai_id !== undefined ? pegawai_id : user.pegawai_id,
    extra_roles: extra_roles !== undefined ? (extra_roles.length ? extra_roles : null) : user.extra_roles,
  });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'users', resourceId: user.id,
    description: `User ${user.username} diperbarui`,
    oldData, newData: req.body,
  });

  const updated = await User.findByPk(user.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'label'] }],
  });
  return success(res, updated, 'User berhasil diperbarui');
};

// DELETE /api/v1/users/:id
const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) return badRequest(res, 'Tidak bisa menghapus akun sendiri');

  const user = await User.findByPk(req.params.id);
  if (!user) return notFound(res, 'User tidak ditemukan');

  await user.destroy();

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'DELETE', resource: 'users', resourceId: req.params.id,
    description: `User ${user.username} dihapus`,
  });

  return success(res, null, 'User berhasil dihapus');
};

// PATCH /api/v1/users/:id/reset-password
const resetPassword = async (req, res) => {
  const { new_password } = req.body;
  const user = await User.unscoped().findByPk(req.params.id);
  if (!user) return notFound(res, 'User tidak ditemukan');

  const hashed = await hashPassword(new_password);
  await user.update({ password: hashed, password_changed_at: new Date() });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'users', resourceId: user.id,
    description: `Password user ${user.username} direset oleh ${req.user.username}`,
  });

  return success(res, null, 'Password berhasil direset');
};

// GET /api/v1/users/roles  — daftar semua role
const getRoles = async (req, res) => {
  const roles = await Role.findAll({
    where: { is_active: true },
    include: [{ model: Permission, as: 'permissions', attributes: ['id', 'name', 'label', 'group'] }],
    order: [['name', 'ASC']],
  });
  return success(res, roles);
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, resetPassword, getRoles };
