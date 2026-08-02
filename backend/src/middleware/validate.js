const Joi = require('joi');
const { badRequest } = require('../utils/response');

/**
 * Middleware validasi request menggunakan Joi schema
 *
 * Penggunaan:
 *   router.post('/login', validate(loginSchema), authController.login)
 *
 * @param {Joi.ObjectSchema} schema - Joi schema untuk validasi
 * @param {'body'|'query'|'params'} target - Bagian request yang divalidasi
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,    // Tampilkan semua error sekaligus
      allowUnknown: false,  // Tolak field yang tidak ada di schema
      stripUnknown: true,   // Hapus field yang tidak dikenal
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return badRequest(res, 'Validasi data gagal', errors);
    }

    // Ganti dengan nilai yang sudah di-sanitize
    req[target] = value;
    next();
  };
};

// ============================================================
// Joi schemas reusable
// ============================================================
const schemas = {
  // Auth
  login: Joi.object({
    username: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Username minimal 3 karakter',
      'any.required': 'Username wajib diisi',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password minimal 6 karakter',
      'any.required': 'Password wajib diisi',
    }),
  }),

  refreshToken: Joi.object({
    refresh_token: Joi.string().required().messages({
      'any.required': 'Refresh token wajib diisi',
    }),
  }),

  changePassword: Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().min(8).required(),
    confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
      'any.only': 'Konfirmasi password tidak cocok',
    }),
  }),

  // Pagination query
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow('').optional(),
    sort: Joi.string().max(50).optional(),
    order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('ASC'),
  }),
};

module.exports = { validate, schemas };
