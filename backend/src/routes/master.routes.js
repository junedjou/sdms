const router = require('express').Router();
const ctrl = require('../controllers/master.controller');
const ie   = require('../controllers/importExport.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');
const upload = require('../middleware/upload');

router.use(authenticate);

// ── Guru ─────────────────────────────────────────────────────
router.get('/guru',                requirePermission('guru:view'),   asyncHandler(ctrl.getGuru));
router.get('/guru/export',         requirePermission('guru:view'),   asyncHandler(ie.exportGuru));
router.get('/guru/template',       requirePermission('guru:create'), asyncHandler(ie.templateGuru));
router.post('/guru/import',        requirePermission('guru:create'), upload.single('file'), asyncHandler(ie.importGuru));
router.delete('/guru/bulk',        requirePermission('guru:delete'), asyncHandler(ctrl.bulkDeleteGuru));
router.get('/guru/:id',            requirePermission('guru:view'),   asyncHandler(ctrl.getGuruById));
router.post('/guru',               requirePermission('guru:create'), asyncHandler(ctrl.createGuru));
router.put('/guru/:id',            requirePermission('guru:update'), asyncHandler(ctrl.updateGuru));
router.delete('/guru/:id',         requirePermission('guru:delete'), asyncHandler(ctrl.deleteGuru));

// ── Siswa ─────────────────────────────────────────────────────
router.get('/siswa',               requirePermission('siswa:view'),   asyncHandler(ctrl.getSiswa));
router.get('/siswa/export',        requirePermission('siswa:view'),   asyncHandler(ie.exportSiswa));
router.get('/siswa/template',      requirePermission('siswa:create'), asyncHandler(ie.templateSiswa));
router.post('/siswa/import',       requirePermission('siswa:create'), upload.single('file'), asyncHandler(ie.importSiswa));
router.delete('/siswa/bulk',       requirePermission('siswa:delete'), asyncHandler(ctrl.bulkDeleteSiswa));
router.get('/siswa/:id',           requirePermission('siswa:view'),   asyncHandler(ctrl.getSiswaById));
router.post('/siswa',              requirePermission('siswa:create'), asyncHandler(ctrl.createSiswa));
router.put('/siswa/:id',           requirePermission('siswa:update'), asyncHandler(ctrl.updateSiswa));
router.delete('/siswa/:id',        requirePermission('siswa:delete'), asyncHandler(ctrl.deleteSiswa));

// ── Pegawai ───────────────────────────────────────────────────
router.get('/pegawai',             requirePermission('pegawai:view'),   asyncHandler(ctrl.getPegawai));
router.get('/pegawai/export',      requirePermission('pegawai:view'),   asyncHandler(ie.exportPegawai));
router.get('/pegawai/template',    requirePermission('pegawai:create'), asyncHandler(ie.templatePegawai));
router.post('/pegawai/import',     requirePermission('pegawai:create'), upload.single('file'), asyncHandler(ie.importPegawai));
router.delete('/pegawai/bulk',     requirePermission('pegawai:delete'), asyncHandler(ctrl.bulkDeletePegawai));
router.post('/pegawai',            requirePermission('pegawai:create'), asyncHandler(ctrl.createPegawai));
router.put('/pegawai/:id',         requirePermission('pegawai:update'), asyncHandler(ctrl.updatePegawai));
router.delete('/pegawai/:id',      requirePermission('pegawai:delete'), asyncHandler(ctrl.deletePegawai));

// ── Jurusan ───────────────────────────────────────────────────
router.get('/jurusan',             requirePermission('jurusan:view'),   asyncHandler(ctrl.getJurusan));
router.get('/jurusan/export',      requirePermission('jurusan:view'),   asyncHandler(ie.exportJurusan));
router.get('/jurusan/template',    requirePermission('jurusan:create'), asyncHandler(ie.templateJurusan));
router.post('/jurusan/import',     requirePermission('jurusan:create'), upload.single('file'), asyncHandler(ie.importJurusan));
router.delete('/jurusan/bulk',     requirePermission('jurusan:delete'), asyncHandler(ctrl.bulkDeleteJurusan));
router.post('/jurusan',            requirePermission('jurusan:create'), asyncHandler(ctrl.createJurusan));
router.put('/jurusan/:id',         requirePermission('jurusan:update'), asyncHandler(ctrl.updateJurusan));

// ── Kelas ─────────────────────────────────────────────────────
router.get('/kelas',               requirePermission('kelas:view'),   asyncHandler(ctrl.getKelas));
router.get('/kelas/export',        requirePermission('kelas:view'),   asyncHandler(ie.exportKelas));
router.get('/kelas/template',      requirePermission('kelas:create'), asyncHandler(ie.templateKelas));
router.post('/kelas/import',       requirePermission('kelas:create'), upload.single('file'), asyncHandler(ie.importKelas));
router.delete('/kelas/bulk',       requirePermission('kelas:delete'), asyncHandler(ctrl.bulkDeleteKelas));
router.post('/kelas',              requirePermission('kelas:create'), asyncHandler(ctrl.createKelas));
router.put('/kelas/:id',           requirePermission('kelas:update'), asyncHandler(ctrl.updateKelas));

// ── Mata Pelajaran ────────────────────────────────────────────
router.get('/mapel',               requirePermission('mapel:view'),   asyncHandler(ctrl.getMapel));
router.get('/mapel/export',        requirePermission('mapel:view'),   asyncHandler(ie.exportMapel));
router.get('/mapel/template',      requirePermission('mapel:create'), asyncHandler(ie.templateMapel));
router.post('/mapel/import',       requirePermission('mapel:create'), upload.single('file'), asyncHandler(ie.importMapel));
router.delete('/mapel/bulk',       requirePermission('mapel:delete'), asyncHandler(ctrl.bulkDeleteMapel));
router.post('/mapel',              requirePermission('mapel:create'), asyncHandler(ctrl.createMapel));
router.put('/mapel/:id',           requirePermission('mapel:update'), asyncHandler(ctrl.updateMapel));

// ── Tahun Pelajaran ───────────────────────────────────────────
router.get('/tahun-pelajaran',             requirePermission('master:view'), asyncHandler(ctrl.getTahunPelajaran));
router.post('/tahun-pelajaran',            requirePermission('master:view'), asyncHandler(ctrl.createTahunPelajaran));
router.put('/tahun-pelajaran/:id',         requirePermission('master:view'), asyncHandler(ctrl.updateTahunPelajaran));
router.delete('/tahun-pelajaran/:id',      requirePermission('master:view'), asyncHandler(ctrl.deleteTahunPelajaran));
router.patch('/tahun-pelajaran/:id/aktif', requirePermission('master:view'), asyncHandler(ctrl.setTahunAktif));

// ── Semester ──────────────────────────────────────────────────
router.get('/semester',            requirePermission('master:view'), asyncHandler(ctrl.getSemester));
router.post('/semester',           requirePermission('master:view'), asyncHandler(ctrl.createSemester));
router.put('/semester/:id',        requirePermission('master:view'), asyncHandler(ctrl.updateSemester));
router.delete('/semester/:id',     requirePermission('master:view'), asyncHandler(ctrl.deleteSemester));

// ── Kalender Akademik ─────────────────────────────────────────
router.get('/kalender',            requirePermission('master:view'), asyncHandler(ctrl.getKalender));
router.post('/kalender',           requirePermission('master:view'), asyncHandler(ctrl.createKalender));
router.put('/kalender/:id',        requirePermission('master:view'), asyncHandler(ctrl.updateKalender));
router.delete('/kalender/:id',     requirePermission('master:view'), asyncHandler(ctrl.deleteKalender));

module.exports = router;
