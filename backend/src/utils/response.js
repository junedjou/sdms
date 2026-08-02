/**
 * Standar format response API SDMS
 */

const success = (res, data = null, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const created = (res, data = null, message = 'Data berhasil dibuat') => {
  return success(res, data, message, 201);
};

const paginated = (res, data, meta, message = 'Berhasil') => {
  return res.status(200).json({
    status: 'success',
    message,
    data,
    meta: {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
};

const error = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const body = { status: 'error', message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const badRequest = (res, message = 'Request tidak valid', errors = null) => {
  return error(res, message, 400, errors);
};

const unauthorized = (res, message = 'Tidak terautentikasi') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Akses ditolak') => {
  return error(res, message, 403);
};

const notFound = (res, message = 'Data tidak ditemukan') => {
  return error(res, message, 404);
};

const conflict = (res, message = 'Data sudah ada') => {
  return error(res, message, 409);
};

module.exports = { success, created, paginated, error, badRequest, unauthorized, forbidden, notFound, conflict };
