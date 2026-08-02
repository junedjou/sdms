const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

/**
 * Hash password menggunakan bcrypt
 */
const hashPassword = async (password) => {
  // Cost factor 10: ~100ms — aman untuk web app, tidak terasa oleh user
  // (cost 12 membutuhkan ~300-500ms, penyebab utama jeda login)
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verifikasi password
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate UUID v4
 */
const generateId = () => uuidv4();

/**
 * Format tanggal ke string lokal Indonesia
 */
const formatDate = (date, format = 'DD MMMM YYYY') => {
  return dayjs(date).format(format);
};

/**
 * Pagination helper - hitung offset dari page & limit
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  return { limit: parseInt(limit, 10), offset };
};

/**
 * Sanitize string untuk pencarian LIKE
 */
const escapeLike = (str) => str.replace(/[%_\\]/g, '\\$&');

/**
 * Ambil IP dari request
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

module.exports = { hashPassword, verifyPassword, generateId, formatDate, getPagination, escapeLike, getClientIp };
