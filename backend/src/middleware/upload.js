const multer = require('multer');

/**
 * Multer middleware — simpan file di memory (bukan disk)
 * sehingga langsung bisa diproses dengan xlsx tanpa file sementara.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file Excel (.xlsx / .xls) yang diizinkan'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // maks 5 MB
});

module.exports = upload;
