const rateLimit = require('express-rate-limit');
const config = require('../config');
const { error } = require('../utils/response');

/** Ambil IP asli di balik proxy/Caddy */
const getIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.headers['x-real-ip'] ||
  req.ip;

/**
 * Rate limiter umum — berlaku untuk semua /api/ routes
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,   // default: 15 menit
  max: config.rateLimit.max,             // default: 200 request
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(
      res,
      `Terlalu banyak request dari IP ini. Coba lagi setelah ${Math.ceil(config.rateLimit.windowMs / 60000)} menit.`,
      429
    );
  },
  keyGenerator: getIp,
});

/**
 * Rate limiter untuk endpoint login
 *
 * Key = IP + username gabungan — sehingga satu IP sekolah/lab komputer
 * tidak ter-block hanya karena banyak siswa login bergantian.
 *
 * Batas: 15 percobaan per 3 menit per kombinasi IP+username.
 * Jika username berbeda, counter terpisah.
 */
const loginRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,  // 3 menit
  max: 15,                    // 15 percobaan per IP+username
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(
      res,
      'Terlalu banyak percobaan login untuk akun ini. Coba lagi setelah 3 menit.',
      429
    );
  },
  // Key = IP + username — bukan IP saja
  // Sehingga di lab komputer, siswa A yang salah password tidak memblokir siswa B
  keyGenerator: (req) => {
    const ip       = getIp(req);
    const username = (req.body?.username || '').toLowerCase().trim();
    return `${ip}:${username}`;
  },
  // Lewati rate limit jika login berhasil (skip successful requests)
  skip: (req, res) => res.statusCode < 400,
});

/**
 * Rate limiter untuk endpoint sensitif (password reset, dll)
 * Maks 5 request per 1 jam per IP
 */
const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(
      res,
      'Terlalu banyak request untuk operasi ini. Coba lagi setelah 1 jam.',
      429
    );
  },
  keyGenerator: getIp,
});

module.exports = { rateLimiter, loginRateLimiter, strictRateLimiter };
