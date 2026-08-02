const router = require('express').Router();
const ctrl = require('../controllers/master.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

// ── Guru ─────────────────────────────────────────────────────
router.get('/guru',                requirePermission('guru:view'),   asyncHandler(ctrl.getGuru));
router.get('/guru/:id',            requirePermission('guru:view'),   asyncHandler(ctrl.getGuruById));
router.post('/guru',               requirePermission('guru:create'), asyncHandler(ctrl.createGuru));
router.put('/guru/:id',            requirePermission('guru:update'), asyncHandler(ctrl.updateGuru));
router.delete('/guru/:id',         requirePermission('guru:delete'), asyncHandler(ctrl.deleteGuru));

// ── Siswa ─────────────────────────────────────────────────────
router.get('/siswa',               requirePermission('siswa:view'),   asyncHandler(ctrl.getSiswa));
router.get('/siswa/:id',           requirePermission('siswa:view'),   asyncHandler(ctrl.getSiswaById));
router.post('/siswa',              requirePermission('siswa:create'), asyncHandler(ctrl.createSiswa));
router.put('/siswa/:id',           requirePermission('siswa:update'), asyncHandler(ctrl.updateSiswa));
router.delete('/siswa/:id',        requirePermission('siswa:delete'), asyncHandler(ctrl.deleteSiswa));

// ── Pegawai ───────────────────────────────────────────────────
router.get('/pegawai',             requirePermission('pegawai:view'),   asyncHandler(ctrl.getPegawai));
router.post('/pegawai',            requirePermission('pegawai:create'), asyncHandler(ctrl.createPegawai));
router.put('/pegawai/:id',         requirePermission('pegawai:update'), asyncHandler(ctrl.updatePegawai));
router.delete('/pegawai/:id',      requirePermission('pegawai:delete'), asyncHandler(ctrl.deletePegawai));

// ── Jurusan ───────────────────────────────────────────────────
router.get('/jurusan',             requirePermission('jurusan:view'),   asyncHandler(ctrl.getJurusan));
router.post('/jurusan',            requirePermission('jurusan:create'), asyncHandler(ctrl.createJurusan));
router.put('/jurusan/:id',         requirePermission('jurusan:update'), asyncHandler(ctrl.updateJurusan));

// ── Kelas ─────────────────────────────────────────────────────
router.get('/kelas',               requirePermission('kelas:view'),   asyncHandler(ctrl.getKelas));
router.post('/kelas',              requirePermission('kelas:create'), asyncHandler(ctrl.createKelas));
router.put('/kelas/:id',           requirePermission('kelas:update'), asyncHandler(ctrl.updateKelas));

// ── Mata Pelajaran ────────────────────────────────────────────
router.get('/mapel',               requirePermission('mapel:view'),   asyncHandler(ctrl.getMapel));
router.post('/mapel',              requirePermission('mapel:create'), asyncHandler(ctrl.createMapel));
router.put('/mapel/:id',           requirePermission('mapel:update'), asyncHandler(ctrl.updateMapel));

// ── Tahun Pelajaran ───────────────────────────────────────────
router.get('/tahun-pelajaran',            requirePermission('master:view'), asyncHandler(ctrl.getTahunPelajaran));
router.post('/tahun-pelajaran',           requirePermission('master:view'), asyncHandler(ctrl.createTahunPelajaran));
router.patch('/tahun-pelajaran/:id/aktif', requirePermission('master:view'), asyncHandler(ctrl.setTahunAktif));

// ── Semester ──────────────────────────────────────────────────
router.get('/semester',            requirePermission('master:view'), asyncHandler(ctrl.getSemester));
router.post('/semester',           requirePermission('master:view'), asyncHandler(ctrl.createSemester));

// ── Kalender Akademik ─────────────────────────────────────────
router.get('/kalender',            requirePermission('master:view'), asyncHandler(ctrl.getKalender));
router.post('/kalender',           requirePermission('master:view'), asyncHandler(ctrl.createKalender));
router.put('/kalender/:id',        requirePermission('master:view'), asyncHandler(ctrl.updateKalender));
router.delete('/kalender/:id',     requirePermission('master:view'), asyncHandler(ctrl.deleteKalender));

module.exports = router;
