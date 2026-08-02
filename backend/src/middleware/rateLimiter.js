const rateLimit = require('express-rate-limit');
const config = require('../config');
const { error } = require('../utils/response');

/**
 * Rate limiter umum — berlaku untuk semua /api/ routes
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,   // default: 15 menit
  max: config.rateLimit.max,             // default: 100 request
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(
      res,
      `Terlalu banyak request dari IP ini. Coba lagi setelah ${Math.ceil(config.rateLimit.windowMs / 60000)} menit.`,
      429
    );
  },
  keyGenerator: (req) => {
    // Gunakan IP asli (perhatikan Caddy/proxy header)
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.ip
    );
  },
});

/**
 * Rate limiter ketat untuk endpoint login
 * Maks 10 percobaan per 15 menit per IP
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return error(
      res,
      'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.',
      429
    );
  },
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.ip
    );
  },
});

/**
 * Rate limiter untuk endpoint sensitif (password reset, dll)
 * Maks 5 request per 1 jam
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
});

module.exports = { rateLimiter, loginRateLimiter, strictRateLimiter };
