const router = require('express').Router();
const ctrl   = require('../controllers/user.controller');
const ie     = require('../controllers/importExport.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly, requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');
const Joi = require('joi');

// Schema validasi
const createUserSchema = Joi.object({
  username:    Joi.string().min(3).max(100).required(),
  email:       Joi.string().email().required(),
  password:    Joi.string().min(8).required(),
  full_name:   Joi.string().max(200).required(),
  role_id:     Joi.string().uuid().required(),
  guru_id:     Joi.string().uuid().allow(null, '').optional(),
  siswa_id:    Joi.string().uuid().allow(null, '').optional(),
  pegawai_id:  Joi.string().uuid().allow(null, '').optional(),
  extra_roles: Joi.array().items(Joi.string().max(100)).allow(null).optional(),
});

const updateUserSchema = Joi.object({
  username:    Joi.string().min(3).max(100).optional(),
  email:       Joi.string().email().optional(),
  full_name:   Joi.string().max(200).optional(),
  role_id:     Joi.string().uuid().optional(),
  is_active:   Joi.boolean().optional(),
  guru_id:     Joi.string().uuid().allow(null, '').optional(),
  siswa_id:    Joi.string().uuid().allow(null, '').optional(),
  pegawai_id:  Joi.string().uuid().allow(null, '').optional(),
  extra_roles: Joi.array().items(Joi.string().max(100)).allow(null).optional(),
});

const resetPasswordSchema = Joi.object({
  new_password: Joi.string().min(8).required(),
});

// Semua route membutuhkan autentikasi
router.use(authenticate);

router.get('/roles',                requirePermission('user:view'),   asyncHandler(ctrl.getRoles));
router.get('/export',               requirePermission('user:view'),   asyncHandler(ie.exportUsers));
router.get('/template',             requirePermission('user:create'), asyncHandler(ie.templateUsers));
router.post('/import',              requirePermission('user:create'), upload.single('file'), asyncHandler(ie.importUsers));
router.get('/guru-search',          requirePermission('user:view'),   asyncHandler(ctrl.getGuruSearch));
router.get('/piket',                requirePermission('user:view'),   asyncHandler(ctrl.getUsersPiket));
router.get('/',                     requirePermission('user:view'),   asyncHandler(ctrl.getUsers));
router.get('/:id',                  requirePermission('user:view'),   asyncHandler(ctrl.getUserById));
router.post('/',                    requirePermission('user:create'), validate(createUserSchema), asyncHandler(ctrl.createUser));
router.put('/:id',                  requirePermission('user:update'), validate(updateUserSchema), asyncHandler(ctrl.updateUser));
router.delete('/:id',               requirePermission('user:delete'), asyncHandler(ctrl.deleteUser));
router.patch('/:id/reset-password', adminOnly, validate(resetPasswordSchema), asyncHandler(ctrl.resetPassword));

module.exports = router;
