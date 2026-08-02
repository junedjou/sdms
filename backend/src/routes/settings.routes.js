const router = require('express').Router();
const ctrl   = require('../controllers/settings.controller');
const { authenticate }  = require('../middleware/auth');
const { asyncHandler }  = require('../middleware/errorHandler');
const { isSuperAdmin }  = require('../middleware/rbac');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 } });

// GET /api/v1/settings — publik, boleh tanpa auth (untuk load saat startup)
router.get('/', asyncHandler(ctrl.getSettings));

// PUT /api/v1/settings — hanya super_admin
router.put('/', authenticate, isSuperAdmin, asyncHandler(ctrl.updateSettings));

// POST /api/v1/settings/logo — upload logo
router.post('/logo', authenticate, isSuperAdmin, upload.single('logo'), asyncHandler(ctrl.uploadLogo));

// DELETE /api/v1/settings/logo — hapus logo (kembali ke default)
router.delete('/logo', authenticate, isSuperAdmin, asyncHandler(ctrl.deleteLogo));

module.exports = router;
