/**
 * Public Sync API — untuk aplikasi lain tarik data dari SDMS
 * Tidak perlu auth, tapi perlu secret key untuk keamanan.
 * 
 * GET /api/v1/public/sync/data?secret=SDMS_SYNC_SECRET_2026
 * → returns { guru: [...], siswa: [...], kelas: [...], mapel: [...] }
 */

const router = require('express').Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { Guru, Siswa, Kelas, MataPelajaran, Jurusan } = require('../models');

const SYNC_SECRET = process.env.SYNC_SECRET || 'SDMS_SYNC_SECRET_2026';

router.get('/data', asyncHandler(async (req, res) => {
  // Allow CORS for public sync API
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  // Verify secret
  const { secret } = req.query;
  if (secret !== SYNC_SECRET) {
    return res.status(401).json({ status: 'error', message: 'Secret tidak valid' });
  }

  // Load semua data — pakai nama kolom ASLI dari database
  const [guruList, siswaList, kelasList, mapelList] = await Promise.all([
    Guru.findAll({
      where: { is_active: true },
      attributes: ['id', 'nip', 'nama', 'email', 'no_hp', 'mata_pelajaran', 'jenis_kelamin'],
    }),
    Siswa.findAll({
      where: { status: 'Aktif' },
      attributes: ['id', 'nisn', 'nis', 'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'alamat', 'no_hp', 'nama_ayah', 'nama_ibu', 'status', 'kelas_id'],
      include: [{ model: Kelas, as: 'kelas', attributes: ['nama'], required: false }],
    }),
    Kelas.findAll({
      where: { is_active: true },
      attributes: ['id', 'nama', 'tingkat'],
      include: [
        { model: Jurusan, as: 'jurusan', attributes: ['nama'], required: false },
      ],
    }),
    MataPelajaran.findAll({
      where: { is_active: true },
      attributes: ['id', 'nama', 'kode'],
    }),
  ]);

  // Format data untuk Jurnal Guru
  const guru = guruList.map(g => ({
    _id: g.id,
    nip: g.nip,
    nama: g.nama,
    namaLengkap: g.nama,
    email: g.email,
    noTelepon: g.no_hp,
    mataPelajaran: g.mata_pelajaran,
    jenisKelamin: g.jenis_kelamin,
  }));

  const siswa = siswaList.map(s => ({
    _id: s.id,
    nisn: s.nisn,
    nis: s.nis,
    nama: s.nama,
    namaLengkap: s.nama,
    jenisKelamin: s.jenis_kelamin,
    tempatLahir: s.tempat_lahir,
    tanggalLahir: s.tanggal_lahir,
    alamat: s.alamat,
    noTelp: s.no_hp,
    namaOrangTua: s.nama_ayah || s.nama_ibu || '',
    status: s.status,
    kelasNama: s.kelas?.nama || '',
    kelasId: s.kelas_id,
  }));

  const kelas = kelasList.map(k => ({
    _id: k.id,
    nama: k.nama,
    tingkat: k.tingkat,
    jurusan: k.jurusan?.nama || '',
  }));

  const mapel = mapelList.map(m => ({
    _id: m.id,
    nama: m.nama,
    kode: m.kode,
  }));

  return res.json({
    status: 'success',
    message: 'Data sync dari SDMS',
    timestamp: new Date().toISOString(),
    summary: {
      guru: guru.length,
      siswa: siswa.length,
      kelas: kelas.length,
      mapel: mapel.length,
    },
    data: { guru, siswa, kelas, mapel },
  });
}));

// Health check untuk sync
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SDMS Public Sync API aktif', timestamp: new Date().toISOString() });
});

module.exports = router;
