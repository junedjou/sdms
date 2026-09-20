const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { loginRateLimiter, strictRateLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

// POST /api/v1/auth/login
router.post('/login',
  loginRateLimiter,
  validate(schemas.login),
  asyncHandler(ctrl.login)
);

// POST /api/v1/auth/refresh
router.post('/refresh',
  validate(schemas.refreshToken),
  asyncHandler(ctrl.refreshToken)
);

// POST /api/v1/auth/logout  (butuh token)
router.post('/logout',
  authenticate,
  asyncHandler(ctrl.logout)
);

// GET /api/v1/auth/me
router.get('/me',
  authenticate,
  asyncHandler(ctrl.getMe)
);

// PATCH /api/v1/auth/change-password
router.patch('/change-password',
  authenticate,
  strictRateLimiter,
  validate(schemas.changePassword),
  asyncHandler(ctrl.changePassword)
);

// POST /api/v1/auth/forgot-password  — kirim link reset ke email (tidak perlu login)
router.post('/forgot-password',
  strictRateLimiter,
  validate(schemas.forgotPassword),
  asyncHandler(ctrl.forgotPassword)
);

// POST /api/v1/auth/reset-password  — reset password pakai token dari email (tidak perlu login)
router.post('/reset-password',
  strictRateLimiter,
  validate(schemas.resetPassword),
  asyncHandler(ctrl.resetPassword)
);

// GET  /api/v1/auth/profile/siswa  — baca data pribadi siswa yang login
router.get('/profile/siswa',
  authenticate,
  asyncHandler(ctrl.getMySiswaProfile)
);

// PATCH /api/v1/auth/profile/siswa  — siswa update data pribadi sendiri
router.patch('/profile/siswa',
  authenticate,
  asyncHandler(ctrl.updateMySiswaProfile)
);

module.exports = router;
