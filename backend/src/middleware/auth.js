const jwt = require('jsonwebtoken');
const config = require('../config');
const { redisClient } = require('../config/database');
const { unauthorized } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Verifikasi JWT Access Token
 * Memeriksa header Authorization: Bearer <token>
 * Juga cek apakah token sudah di-blacklist di Redis (logout)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.');
    }

    const token = authHeader.split(' ')[1];

    // Cek blacklist di Redis
    try {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return unauthorized(res, 'Token sudah tidak valid. Silakan login ulang.');
      }
    } catch {
      // Redis tidak tersedia — lewati pengecekan blacklist
      logger.warn('Redis tidak tersedia, blacklist check dilewati');
    }

    // Verifikasi token
    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      full_name: decoded.full_name,
      role: decoded.role,
      extra_roles: decoded.extra_roles || [],
      permissions: decoded.permissions || [],
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token sudah kadaluarsa. Silakan refresh token.');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Token tidak valid.');
    }
    logger.error(`Auth middleware error: ${err.message}`);
    return unauthorized(res, 'Autentikasi gagal.');
  }
};

/**
 * Verifikasi Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Generate Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
};

/**
 * Blacklist token saat logout (simpan ke Redis dengan TTL sesuai exp token)
 */
const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.setex(`blacklist:${token}`, ttl, '1');
      }
    }
  } catch (err) {
    logger.warn(`Gagal blacklist token: ${err.message}`);
  }
};

module.exports = { authenticate, verifyRefreshToken, generateAccessToken, generateRefreshToken, blacklistToken };
