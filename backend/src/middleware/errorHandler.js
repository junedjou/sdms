const logger = require('../utils/logger');
const config = require('../config');

/**
 * Global error handler — dipasang paling akhir di app.js
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const errors = err.errors?.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ status: 'error', message: 'Validasi data gagal', errors });
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    message = 'Data masih digunakan oleh data lain, tidak bisa dihapus.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ status: 'error', message: 'Validasi data gagal', errors });
  }

  // CORS error
  if (err.message?.includes('CORS')) {
    statusCode = 403;
    message = 'CORS: Origin tidak diizinkan';
  }

  // Log error (tidak log 4xx kecuali mode dev)
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });
  } else if (config.app.env === 'development') {
    logger.warn(`[${statusCode}] ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  const response = { status: 'error', message };

  // Tampilkan stack trace hanya di development
  if (config.app.env === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Wrapper async untuk menangkap error di route handler tanpa try-catch
 * Penggunaan: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, asyncHandler };
