const { Op, fn, col, literal } = require('sequelize');
const { masterDB } = require('../config/database');
const {
  Guru, Siswa, Pegawai, Kelas, TahunPelajaran,
  Semester, User, KalenderAkademik, AuditLog,
} = require('../models');
const { success, paginated, error } = require('../utils/response');
const { getPagination } = require('../utils/helpers');
const logger = require('../utils/logger');
const dayjs = require('dayjs');

const CACHE_TTL = 300; // 5 menit

// Cache helper — graceful jika Redis tidak ada
const withCache = async (key, fetchFn) => {
  const { redisClient } = require('../config/database');
  try {
    if (!redisClient._isNoop) {
      const cached = await redisClient.get(key);
      if (cached) return JSON.parse(cached);
      const data = await fetchFn();
      await redisClient.setex(key, CACHE_TTL, JSON.stringify(data));
      return data;
    }
  } catch { /* skip */ }
  return fetchFn();
};

// GET /api/v1/dashboard/stats
const getStats = async (req, res) => {
  try {
    const stats = await withCache('dashboard:stats', async () => {
      const tahunAktif = await TahunPelajaran.findOne({ where: { is_aktif: true } });
      const [totalGuru, totalSiswa, totalPegawai, totalKelas, totalUser] = await Promise.all([
        Guru.count({ where: { is_active: true } }),
        Siswa.count({ where: { status: 'Aktif' } }),
        Pegawai.count({ where: { is_active: true } }),
        tahunAktif ? Kelas.count({ where: { tahun_pelajaran_id: tahunAktif.id, is_active: true } }) : 0,
        User.count({ where: { is_active: true } }),
      ]);
      return { guru: totalGuru, siswa: totalSiswa, pegawai: totalPegawai, kelas: totalKelas, user_aktif: totalUser, tahun_pelajaran: tahunAktif?.nama || '-' };
    });
    return success(res, stats);
  } catch (err) {
    logger.error(`Stats error: ${err.message}`);
    return error(res, 'Gagal mengambil statistik');
  }
};

// GET /api/v1/dashboard/agenda
const getAgenda = async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const nextThreeMonths = dayjs().add(90, 'day').format('YYYY-MM-DD');

    // Coba ambil agenda mendatang dulu
    let agenda = await KalenderAkademik.findAll({
      where: {
        tanggal_selesai: { [Op.gte]: today },
        tanggal_mulai:   { [Op.lte]: nextThreeMonths },
      },
      order: [['tanggal_mulai', 'ASC']],
      limit: 8,
    });

    // Jika tidak ada agenda mendatang, tampilkan 8 agenda terakhir
    if (agenda.length === 0) {
      agenda = await KalenderAkademik.findAll({
        order: [['tanggal_mulai', 'DESC']],
        limit: 8,
      });
      // Balik urutan agar terbaru di atas
      agenda = agenda.reverse();
    }

    return success(res, agenda);
  } catch (err) {
    logger.error(`Agenda error: ${err.message}`);
    return error(res, 'Gagal mengambil agenda');
  }
};

// GET /api/v1/dashboard/summary
const getSummary = async (req, res) => {
  try {
    const summary = await withCache('dashboard:summary', async () => {
      // Siswa per jurusan — gunakan sequelize fn() yang kompatibel semua dialect
      const siswaPerJurusan = await Siswa.findAll({
        attributes: ['jurusan_id', [fn('COUNT', col('Siswa.id')), 'total']],
        where: { status: 'Aktif' },
        include: [{ association: 'jurusan', attributes: ['nama', 'kode'], required: false }],
        group: ['Siswa.jurusan_id', 'jurusan.id'],
        raw: false,
      });

      const guruPerStatus = await Guru.findAll({
        attributes: ['status_kepegawaian', [fn('COUNT', col('id')), 'total']],
        where: { is_active: true },
        group: ['status_kepegawaian'],
        raw: true,
      });

      const siswaPerJK = await Siswa.findAll({
        attributes: ['jenis_kelamin', [fn('COUNT', col('id')), 'total']],
        where: { status: 'Aktif' },
        group: ['jenis_kelamin'],
        raw: true,
      });

      return {
        siswa_per_jurusan: siswaPerJurusan.map((s) => ({
          jurusan: s.jurusan?.nama || 'Tidak diketahui',
          kode:    s.jurusan?.kode || '-',
          total:   parseInt(s.dataValues.total) || 0,
        })),
        guru_per_status: guruPerStatus.map((g) => ({
          status: g.status_kepegawaian || 'Tidak diketahui',
          total:  parseInt(g.total) || 0,
        })),
        siswa_per_jk: siswaPerJK.map((s) => ({
          jenis_kelamin: s.jenis_kelamin,
          total: parseInt(s.total) || 0,
        })),
      };
    });
    return success(res, summary);
  } catch (err) {
    logger.error(`Summary error: ${err.message}`);
    return error(res, 'Gagal mengambil ringkasan');
  }
};

// GET /api/v1/dashboard/app-hub
const getAppHub = async (req, res) => {
  const config = require('../config');
  const userPermissions = req.user.permissions || [];
  const role = req.user.role;

  const apps = [
    { id: 'lms',          name: 'LMS',           label: 'Learning Management System',  icon: 'book-open',         color: '#4F46E5', url: config.apps.lms,       permission: 'lms:access',       description: 'Kelola materi, tugas, dan nilai siswa' },
    { id: 'jurnal',       name: 'Jurnal Guru',   label: 'Jurnal Mengajar',              icon: 'clipboard-list',    color: '#059669', url: config.apps.jurnal,    permission: 'jurnal:access',    description: 'Pencatatan jurnal kegiatan mengajar harian' },
    { id: 'piket',        name: 'Piket',         label: 'Absensi Piket',                icon: 'user-check',        color: '#D97706', url: config.apps.piket,     permission: 'piket:access',     description: 'Rekapitulasi kehadiran siswa harian' },
    { id: 'sholat',       name: 'Sholat',        label: 'Absensi Sholat Berjamaah',     icon: 'moon',              color: '#7C3AED', url: config.apps.sholat,    permission: 'sholat:access',    description: 'Monitoring sholat berjamaah siswa' },
    { id: 'kegiatan',     name: 'Kegiatan',      label: 'Kegiatan Sekolah',             icon: 'calendar',          color: '#DB2777', url: config.apps.kegiatan,  permission: 'kegiatan:access',  description: 'Manajemen kegiatan dan event sekolah' },
    { id: 'kelulusan',    name: 'Kelulusan',     label: 'Data Kelulusan',               icon: 'academic-cap',      color: '#EA580C', url: config.apps.kelulusan, permission: 'kelulusan:access', description: 'Pengumuman dan data kelulusan siswa' },
    { id: 'website',      name: 'Website',       label: 'Website Sekolah',              icon: 'globe',             color: '#0891B2', url: config.apps.website,   permission: 'website:access',   description: 'Kelola konten website sekolah' },
    { id: 'inventaris',   name: 'Inventaris',    label: 'Inventaris Sekolah',           icon: 'archive',           color: '#64748B', url: null, permission: null, status: 'development', description: 'Manajemen aset dan inventaris' },
    { id: 'perpustakaan', name: 'Perpustakaan',  label: 'Perpustakaan Digital',         icon: 'library',           color: '#64748B', url: null, permission: null, status: 'development', description: 'Sistem informasi perpustakaan' },
    { id: 'pkl',          name: 'PKL',           label: 'Praktik Kerja Lapangan',       icon: 'briefcase',         color: '#64748B', url: null, permission: null, status: 'development', description: 'Monitoring PKL dan magang siswa' },
    { id: 'alumni',       name: 'Alumni',        label: 'Data Alumni',                  icon: 'users',             color: '#64748B', url: null, permission: null, status: 'development', description: 'Manajemen data alumni' },
  ];

  const filtered = apps.map((app) => ({
    ...app,
    accessible: app.status === 'development' ? false
      : (role === 'super_admin' || role === 'admin' || !app.permission || userPermissions.includes(app.permission)),
  }));

  return success(res, filtered);
};

// GET /api/v1/dashboard/audit-log
const getAuditLog = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { limit: lim, offset } = getPagination(page, limit);
  const { count, rows } = await AuditLog.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit: lim, offset,
  });
  return paginated(res, rows, { total: count, page: parseInt(page), limit: lim });
};

module.exports = { getStats, getAgenda, getSummary, getAppHub, getAuditLog };
