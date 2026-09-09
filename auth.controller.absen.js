/**
 * Auth Controller — Aplikasi Absen
 * ==================================
 * Login biasa + SSO Callback dari SDMS.
 *
 * SSO Flow:
 *   SDMS App Hub → GET /sso/callback?token=<sso_token>&from=sdms
 *   → verifikasi JWT dengan SSO_SECRET_ABSEN
 *   → cari/buat user di DB Absen (Prisma)
 *   → kembalikan accessToken + refreshToken → frontend simpan & redirect ke dashboard
 *
 * Env yang diperlukan di aplikasi Absen:
 *   SDMS_SSO_SECRET_ABSEN=<nilai SSO_SECRET_ABSEN dari .env SDMS>
 *   JWT_SECRET=<secret JWT internal aplikasi Absen>
 *   JWT_REFRESH_SECRET=<secret refresh token internal aplikasi Absen>
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, unauthorized, badRequest, error } = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');

// ── SSO Secret (harus sama dengan SSO_SECRET_ABSEN di .env SDMS) ─────────────
const SSO_SECRET = process.env.SDMS_SSO_SECRET_ABSEN
  || process.env.SSO_SECRET_ABSEN
  || 'sso_secret_absen';

// ── Pemetaan role SDMS → role Absen ──────────────────────────────────────────
function mapRoleSDMS(sdmsRole) {
  const map = {
    super_admin:    'SUPER_ADMIN',
    admin:          'ADMIN',
    guru:           'GURU',
    wali_kelas:     'WALI_KELAS',
    bk:             'BK',
    kepala_sekolah: 'KEPALA_SEKOLAH',
    petugas_piket:  'PETUGAS_PIKET',
    pegawai:        'GURU',
    siswa:          'SISWA',
    operator:       'OPERATOR',
  };
  return map[(sdmsRole || '').toLowerCase()] || 'GURU';
}

// ── Login biasa (username + password) ────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return badRequest(res, 'Username dan password wajib diisi');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username.toLowerCase() },
        { email:    username.toLowerCase() },
      ],
    },
    include: { guru: { select: { id: true, nama: true, nip: true, foto: true } } },
  });

  if (!user)       return unauthorized(res, 'Username atau password salah');
  if (!user.aktif) return unauthorized(res, 'Akun tidak aktif, hubungi administrator');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return unauthorized(res, 'Username atau password salah');

  const payload      = buildPayload(user);
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(user.id, refreshToken);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  return success(res, buildResponse(user, accessToken, refreshToken), 'Login berhasil');
});

// ── Refresh Token ─────────────────────────────────────────────────────────────
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return badRequest(res, 'Refresh token wajib diisi');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return unauthorized(res, 'Refresh token tidak valid atau kadaluarsa');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where:   { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    return unauthorized(res, 'Refresh token tidak valid');
  }
  if (!storedToken.user.aktif) {
    return unauthorized(res, 'Akun tidak aktif');
  }

  await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revoked: true } });

  const newPayload      = buildPayload(storedToken.user);
  const newAccessToken  = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  await saveRefreshToken(storedToken.user.id, newRefreshToken);

  return success(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token diperbarui');
});

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data:  { revoked: true },
    });
  }
  return success(res, null, 'Logout berhasil');
});

// ── Me ────────────────────────────────────────────────────────────────────────
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.user.id },
    select: {
      id: true, username: true, email: true,
      role: true, roles: true, aktif: true,
      lastLogin: true, createdAt: true,
      guru: {
        select: {
          id: true, nama: true, nip: true,
          jenisKelamin: true, telepon: true, foto: true,
        },
      },
    },
  });
  if (!user) return unauthorized(res, 'User tidak ditemukan');
  return success(res, user);
});

// ── SSO Callback ──────────────────────────────────────────────────────────────
// GET /sso/callback?token=<sso_token>&from=sdms
// Dipanggil saat user klik aplikasi Absen dari SDMS App Hub.
const ssoCallback = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) return badRequest(res, 'Token SSO tidak ditemukan');

  // 1. Verifikasi JWT — secret harus sama dengan SSO_SECRET_ABSEN di .env SDMS
  let decoded;
  try {
    decoded = jwt.verify(token, SSO_SECRET, {
      audience: 'absen',
      issuer:   'sdms-core',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token SSO sudah kadaluarsa, silakan coba lagi dari SDMS');
    }
    return unauthorized(res, 'Token SSO tidak valid');
  }

  // 2. Petakan role SDMS → role Absen
  const absenRole      = mapRoleSDMS(decoded.role);
  const extraRoles     = (decoded.extra_roles || []).map(r => mapRoleSDMS(r)).filter(r => r !== absenRole);
  const allRoles       = [...new Set([absenRole, ...extraRoles])];

  // 3. Cari user di DB Absen berdasarkan username SDMS
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: decoded.username },
        // Hanya cari by email jika email bukan placeholder @sdms.local
        ...(decoded.email && !decoded.email.includes('@sdms.local')
          ? [{ email: decoded.email }]
          : []),
      ],
    },
    include: { guru: { select: { id: true, nama: true, nip: true, foto: true } } },
  });

  if (!user) {
    // 4a. Buat user baru secara otomatis
    const randomPass = await bcrypt.hash(Math.random().toString(36).slice(2), 12);
    user = await prisma.user.create({
      data: {
        username: decoded.username,
        email:    decoded.email || `${decoded.username}@sdms.local`,
        password: randomPass,
        role:     absenRole,
        roles:    allRoles,
        aktif:    true,
      },
      include: { guru: { select: { id: true, nama: true, nip: true, foto: true } } },
    });
  } else {
    // 4b. Update role agar selalu sinkron dengan SDMS
    await prisma.user.update({
      where: { id: user.id },
      data:  { role: absenRole, roles: allRoles },
    });
    user.role  = absenRole;
    user.roles = allRoles;
  }

  if (!user.aktif) return unauthorized(res, 'Akun Anda tidak aktif di sistem Absen');

  // 5. Buat token lokal aplikasi Absen
  const payload      = buildPayload(user);
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(user.id, refreshToken);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  return success(res, {
    accessToken,
    refreshToken,
    user: {
      id:       user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
      roles:    [...new Set([user.role, ...(user.roles || [])])],
      nama:     user.guru?.nama || decoded.full_name || user.username,
      nip:      user.guru?.nip  || null,
      foto:     user.guru?.foto || null,
    },
  }, 'SSO login berhasil');
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildPayload(user) {
  return {
    userId: user.id,
    role:   user.role,
    roles:  [...new Set([user.role, ...(user.roles || [])])],
  };
}

async function saveRefreshToken(userId, token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
}

function buildResponse(user, accessToken, refreshToken) {
  return {
    accessToken,
    refreshToken,
    user: {
      id:       user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
      roles:    [...new Set([user.role, ...(user.roles || [])])],
      nama:     user.guru?.nama || user.username,
      nip:      user.guru?.nip  || null,
      foto:     user.guru?.foto || null,
    },
  };
}

module.exports = { login, refresh, logout, me, ssoCallback };
