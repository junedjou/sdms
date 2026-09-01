/**
 * ═══════════════════════════════════════════════════════════════
 * Jurnal Guru Sync Service
 * ═══════════════════════════════════════════════════════════════
 * 
 * Push data dari SDMS ke Jurnal Guru (https://jurnal.smkn1kras.sch.id)
 * Menggunakan API yang sudah ada di Jurnal Guru.
 * 
 * Flow:
 *   1. Login ke Jurnal Guru dapat token JWT
 *   2. Sync kelas → POST/PUT /api/kelas
 *   3. Sync siswa → POST/PUT /api/siswa  
 *   4. Sync guru  → POST/PUT /api/guru
 *   5. Sync mapel → POST/PUT /api/mapping-mapel
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const JURNAL_BASE_URL = config.apps.jurnal;
const JURNAL_USER = process.env.JURNAL_SYNC_USER || '';
const JURNAL_PASS = process.env.JURNAL_SYNC_PASS || '';

let jurnalToken = null;
let tokenExpiry = 0;

// ══════════════════════════════════════════════════════════════
// LOGIN ke Jurnal Guru
// ══════════════════════════════════════════════════════════════

const loginJurnal = async () => {
  if (!JURNAL_USER || !JURNAL_PASS) {
    throw new Error('JURNAL_SYNC_USER dan JURNAL_SYNC_PASS belum di-set di .env');
  }

  try {
    const res = await axios.post(`${JURNAL_BASE_URL}/api/auth/login`, {
      username: JURNAL_USER,
      password: JURNAL_PASS,
    }, { timeout: 10000 });

    if (res.data?.success && res.data?.token) {
      jurnalToken = res.data.token;
      tokenExpiry = Date.now() + (res.data.expiresIn || 86400) * 1000;
      logger.info('[JurnalSync] Login berhasil ke Jurnal Guru');
      return jurnalToken;
    }

    throw new Error(res.data?.message || 'Login gagal');
  } catch (err) {
    logger.error(`[JurnalSync] Login gagal: ${err.message}`);
    throw err;
  }
};

// ══════════════════════════════════════════════════════════════
// HELPER: buat axios instance dengan token
// ══════════════════════════════════════════════════════════════

const jurnalApi = async () => {
  // Refresh token jika expired
  if (!jurnalToken || Date.now() > tokenExpiry) {
    await loginJurnal();
  }

  return axios.create({
    baseURL: JURNAL_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jurnalToken}`,
    },
  });
};

// ══════════════════════════════════════════════════════════════
// SYNC: Kelas
// ══════════════════════════════════════════════════════════════

const syncKelas = async (kelasList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;

  for (const kelas of kelasList) {
    try {
      // Cek apakah kelas sudah ada (berdasarkan nama)
      const checkRes = await api.get('/api/kelas').catch(() => ({ data: { data: [] } }));
      const existing = (checkRes.data?.data || []).find(
        k => k.nama === kelas.nama_kelas || k.nama === kelas.nama
      );

      const payload = {
        nama: kelas.nama_kelas || kelas.nama,
        tingkat: kelas.tingkat,
        jurusan: kelas.jurusan?.nama || kelas.jurusan || '',
        tahunAjaran: kelas.tahunPelajaran?.nama || '',
        jumlahSiswa: kelas.jumlahSiswa || 0,
        waliKelas: kelas.waliKelas?.nama_lengkap || '',
      };

      if (existing) {
        // Update
        await api.put(`/api/kelas/${existing._id}`, payload).catch(() => null);
        updated++;
      } else {
        // Create
        await api.post('/api/kelas', payload).catch(() => null);
        created++;
      }
    } catch {
      failed++;
    }
  }

  logger.info(`[JurnalSync] Kelas: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

// ══════════════════════════════════════════════════════════════
// SYNC: Siswa
// ══════════════════════════════════════════════════════════════

const syncSiswa = async (siswaList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;

  for (const siswa of siswaList) {
    try {
      const payload = {
        nisn: siswa.nisn,
        nis: siswa.nis,
        nama: siswa.nama_lengkap || siswa.nama,
        namaLengkap: siswa.nama_lengkap || siswa.nama,
        tempatLahir: siswa.tempat_lahir,
        tanggalLahir: siswa.tanggal_lahir,
        jenisKelamin: siswa.jenis_kelamin,
        alamat: siswa.alamat,
        namaOrangTua: siswa.nama_ortu,
        noTelp: siswa.no_telepon,
        status: siswa.status || 'Aktif',
        kelasNama: siswa.kelas?.nama_kelas || siswa.kelasNama || '',
      };

      // Use upsert-like approach: check if exists by NISN
      const checkRes = await api.get('/api/siswa').catch(() => ({ data: { data: [] } }));
      const siswaData = checkRes.data?.data || checkRes.data?.siswa || [];
      const existing = siswaData.find(s => s.nisn === siswa.nisn);

      if (existing) {
        await api.put(`/api/siswa/${existing._id}`, payload).catch(() => null);
        updated++;
      } else {
        await api.post('/api/siswa', payload).catch(() => null);
        created++;
      }
    } catch {
      failed++;
    }
  }

  logger.info(`[JurnalSync] Siswa: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

// ══════════════════════════════════════════════════════════════
// SYNC: Guru
// ══════════════════════════════════════════════════════════════

const syncGuru = async (guruList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;

  for (const guru of guruList) {
    try {
      const payload = {
        nip: guru.nip,
        nama: guru.nama_lengkap || guru.nama,
        namaLengkap: guru.nama_lengkap || guru.nama,
        email: guru.email,
        mataPelajaran: guru.mata_pelajaran,
        noTelepon: guru.no_telepon,
        is_active: guru.is_active,
      };

      const checkRes = await api.get('/api/guru').catch(() => ({ data: { data: [] } }));
      const guruData = checkRes.data?.data || checkRes.data?.guru || [];
      const existing = guruData.find(g => g.nip === guru.nip);

      if (existing) {
        await api.put(`/api/guru/${existing._id}`, payload).catch(() => null);
        updated++;
      } else {
        await api.post('/api/guru', payload).catch(() => null);
        created++;
      }
    } catch {
      failed++;
    }
  }

  logger.info(`[JurnalSync] Guru: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

// ══════════════════════════════════════════════════════════════
// SYNC: Mata Pelajaran
// ══════════════════════════════════════════════════════════════

const syncMapel = async (mapelList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;

  for (const mapel of mapelList) {
    try {
      const payload = {
        nama: mapel.nama_mapel || mapel.nama,
        kode: mapel.kode,
      };

      const checkRes = await api.get('/api/mapping-mapel').catch(() => ({ data: { data: [] } }));
      const mapelData = checkRes.data?.data || [];
      const existing = mapelData.find(m => m.nama === payload.nama);

      if (existing) {
        await api.put(`/api/mapping-mapel/${existing._id}`, payload).catch(() => null);
        updated++;
      } else {
        await api.post('/api/mapping-mapel', payload).catch(() => null);
        created++;
      }
    } catch {
      failed++;
    }
  }

  logger.info(`[JurnalSync] Mapel: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

// ══════════════════════════════════════════════════════════════
// FULL SYNC: Semua data sekaligus
// ══════════════════════════════════════════════════════════════

const fullSync = async () => {
  const startTime = Date.now();
  logger.info('[JurnalSync] ═══ Full Sync dimulai ═══');

  const { Guru, Siswa, Kelas, MataPelajaran } = require('../models');

  // Load semua data dari SDMS
  const [guruList, siswaList, kelasList, mapelList] = await Promise.all([
    Guru.findAll({ where: { is_active: true } }),
    Siswa.findAll({ where: { status: 'Aktif' } }),
    Kelas.findAll({ where: { is_active: true }, include: ['jurusan', 'waliKelas', 'tahunPelajaran'] }),
    MataPelajaran.findAll({ where: { is_active: true } }),
  ]);

  logger.info(`[JurnalSync] Data: ${guruList.length} guru, ${siswaList.length} siswa, ${kelasList.length} kelas, ${mapelList.length} mapel`);

  // Sync per kategori
  const results = {};

  try {
    results.kelas = await syncKelas(kelasList.map(k => k.toJSON()));
  } catch (err) {
    logger.error(`[JurnalSync] Sync kelas gagal: ${err.message}`);
    results.kelas = { error: err.message };
  }

  try {
    results.siswa = await syncSiswa(siswaList.map(s => s.toJSON()));
  } catch (err) {
    logger.error(`[JurnalSync] Sync siswa gagal: ${err.message}`);
    results.siswa = { error: err.message };
  }

  try {
    results.guru = await syncGuru(guruList.map(g => g.toJSON()));
  } catch (err) {
    logger.error(`[JurnalSync] Sync guru gagal: ${err.message}`);
    results.guru = { error: err.message };
  }

  try {
    results.mapel = await syncMapel(mapelList.map(m => m.toJSON()));
  } catch (err) {
    logger.error(`[JurnalSync] Sync mapel gagal: ${err.message}`);
    results.mapel = { error: err.message };
  }

  const duration = Date.now() - startTime;
  logger.info(`[JurnalSync] ═══ Full Sync selesai (${duration}ms) ═══`);

  return {
    success: true,
    duration_ms: duration,
    results,
    summary: {
      guru: guruList.length,
      siswa: siswaList.length,
      kelas: kelasList.length,
      mapel: mapelList.length,
    },
  };
};

// ══════════════════════════════════════════════════════════════
// TEST: Cek koneksi ke Jurnal Guru
// ══════════════════════════════════════════════════════════════

const testConnection = async () => {
  const startTime = Date.now();
  try {
    // Test 1: Health check
    const healthRes = await axios.get(`${JURNAL_BASE_URL}/api/guru`, { timeout: 5000 });
    const latency = Date.now() - startTime;

    // Test 2: Try login
    let loginOk = false;
    if (JURNAL_USER && JURNAL_PASS) {
      try {
        await loginJurnal();
        loginOk = true;
      } catch {
        loginOk = false;
      }
    }

    return {
      success: true,
      url: JURNAL_BASE_URL,
      latency_ms: latency,
      http_status: healthRes.status,
      login_ok: loginOk,
      credentials_configured: !!(JURNAL_USER && JURNAL_PASS),
    };
  } catch (err) {
    return {
      success: false,
      url: JURNAL_BASE_URL,
      error: err.message,
      credentials_configured: !!(JURNAL_USER && JURNAL_PASS),
    };
  }
};

module.exports = {
  fullSync,
  syncKelas,
  syncSiswa,
  syncGuru,
  syncMapel,
  testConnection,
  loginJurnal,
};
