#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Update Manual: Jurnal Guru Sync Service
# ═══════════════════════════════════════════════════════════════
# Jalankan di VPS SDMS (/var/www/sdms) untuk update file-file
# yang berubah tanpa perlu git push/pull.
#
# Cara pakai:
#   cd /var/www/sdms
#   bash docs/update-jurnal-sync.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "🔧 Updating Jurnal Guru Sync Service..."

# 1. Buat jurnalSyncService.js
cat > backend/src/services/jurnalSyncService.js << 'JURNAL_SERVICE_EOF'
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const JURNAL_BASE_URL = config.apps.jurnal;
const JURNAL_USER = process.env.JURNAL_SYNC_USER || '';
const JURNAL_PASS = process.env.JURNAL_SYNC_PASS || '';

let jurnalToken = null;
let tokenExpiry = 0;

const loginJurnal = async () => {
  if (!JURNAL_USER || !JURNAL_PASS) {
    throw new Error('JURNAL_SYNC_USER dan JURNAL_SYNC_PASS belum di-set di .env');
  }
  try {
    const res = await axios.post(`${JURNAL_BASE_URL}/api/auth/login`, {
      username: JURNAL_USER, password: JURNAL_PASS,
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

const jurnalApi = async () => {
  if (!jurnalToken || Date.now() > tokenExpiry) await loginJurnal();
  return axios.create({
    baseURL: JURNAL_BASE_URL, timeout: 30000,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jurnalToken}` },
  });
};

const syncKelas = async (kelasList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;
  for (const kelas of kelasList) {
    try {
      const checkRes = await api.get('/api/kelas').catch(() => ({ data: { data: [] } }));
      const existing = (checkRes.data?.data || []).find(k => k.nama === (kelas.nama_kelas || kelas.nama));
      const payload = { nama: kelas.nama_kelas || kelas.nama, tingkat: kelas.tingkat, jurusan: kelas.jurusan?.nama || kelas.jurusan || '', tahunAjaran: kelas.tahunPelajaran?.nama || '', jumlahSiswa: kelas.jumlahSiswa || 0, waliKelas: kelas.waliKelas?.nama_lengkap || '' };
      if (existing) { await api.put(`/api/kelas/${existing._id}`, payload).catch(() => null); updated++; }
      else { await api.post('/api/kelas', payload).catch(() => null); created++; }
    } catch { failed++; }
  }
  logger.info(`[JurnalSync] Kelas: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

const syncSiswa = async (siswaList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;
  for (const siswa of siswaList) {
    try {
      const payload = { nisn: siswa.nisn, nis: siswa.nis, nama: siswa.nama_lengkap || siswa.nama, namaLengkap: siswa.nama_lengkap || siswa.nama, tempatLahir: siswa.tempat_lahir, tanggalLahir: siswa.tanggal_lahir, jenisKelamin: siswa.jenis_kelamin, alamat: siswa.alamat, namaOrangTua: siswa.nama_ortu, noTelp: siswa.no_telepon, status: siswa.status || 'Aktif', kelasNama: siswa.kelas?.nama_kelas || siswa.kelasNama || '' };
      const checkRes = await api.get('/api/siswa').catch(() => ({ data: { data: [] } }));
      const siswaData = checkRes.data?.data || checkRes.data?.siswa || [];
      const existing = siswaData.find(s => s.nisn === siswa.nisn);
      if (existing) { await api.put(`/api/siswa/${existing._id}`, payload).catch(() => null); updated++; }
      else { await api.post('/api/siswa', payload).catch(() => null); created++; }
    } catch { failed++; }
  }
  logger.info(`[JurnalSync] Siswa: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

const syncGuru = async (guruList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;
  for (const guru of guruList) {
    try {
      const payload = { nip: guru.nip, nama: guru.nama_lengkap || guru.nama, namaLengkap: guru.nama_lengkap || guru.nama, email: guru.email, mataPelajaran: guru.mata_pelajaran, noTelepon: guru.no_telepon, is_active: guru.is_active };
      const checkRes = await api.get('/api/guru').catch(() => ({ data: { data: [] } }));
      const guruData = checkRes.data?.data || checkRes.data?.guru || [];
      const existing = guruData.find(g => g.nip === guru.nip);
      if (existing) { await api.put(`/api/guru/${existing._id}`, payload).catch(() => null); updated++; }
      else { await api.post('/api/guru', payload).catch(() => null); created++; }
    } catch { failed++; }
  }
  logger.info(`[JurnalSync] Guru: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

const syncMapel = async (mapelList) => {
  const api = await jurnalApi();
  let created = 0, updated = 0, failed = 0;
  for (const mapel of mapelList) {
    try {
      const payload = { nama: mapel.nama_mapel || mapel.nama, kode: mapel.kode };
      const checkRes = await api.get('/api/mapping-mapel').catch(() => ({ data: { data: [] } }));
      const mapelData = checkRes.data?.data || [];
      const existing = mapelData.find(m => m.nama === payload.nama);
      if (existing) { await api.put(`/api/mapping-mapel/${existing._id}`, payload).catch(() => null); updated++; }
      else { await api.post('/api/mapping-mapel', payload).catch(() => null); created++; }
    } catch { failed++; }
  }
  logger.info(`[JurnalSync] Mapel: ${created} baru, ${updated} update, ${failed} gagal`);
  return { created, updated, failed };
};

const fullSync = async () => {
  const startTime = Date.now();
  logger.info('[JurnalSync] ═══ Full Sync dimulai ═══');
  const { Guru, Siswa, Kelas, MataPelajaran } = require('../models');
  const [guruList, siswaList, kelasList, mapelList] = await Promise.all([
    Guru.findAll({ where: { is_active: true } }),
    Siswa.findAll({ where: { status: 'Aktif' } }),
    Kelas.findAll({ where: { is_active: true }, include: ['jurusan', 'waliKelas', 'tahunPelajaran'] }),
    MataPelajaran.findAll({ where: { is_active: true } }),
  ]);
  logger.info(`[JurnalSync] Data: ${guruList.length} guru, ${siswaList.length} siswa, ${kelasList.length} kelas, ${mapelList.length} mapel`);
  const results = {};
  try { results.kelas = await syncKelas(kelasList.map(k => k.toJSON())); } catch (e) { results.kelas = { error: e.message }; }
  try { results.siswa = await syncSiswa(siswaList.map(s => s.toJSON())); } catch (e) { results.siswa = { error: e.message }; }
  try { results.guru = await syncGuru(guruList.map(g => g.toJSON())); } catch (e) { results.guru = { error: e.message }; }
  try { results.mapel = await syncMapel(mapelList.map(m => m.toJSON())); } catch (e) { results.mapel = { error: e.message }; }
  const duration = Date.now() - startTime;
  logger.info(`[JurnalSync] ═══ Full Sync selesai (${duration}ms) ═══`);
  return { success: true, duration_ms: duration, results, summary: { guru: guruList.length, siswa: siswaList.length, kelas: kelasList.length, mapel: mapelList.length } };
};

const testConnection = async () => {
  const startTime = Date.now();
  try {
    const healthRes = await axios.get(`${JURNAL_BASE_URL}/api/guru`, { timeout: 5000 });
    const latency = Date.now() - startTime;
    let loginOk = false;
    if (JURNAL_USER && JURNAL_PASS) { try { await loginJurnal(); loginOk = true; } catch { loginOk = false; } }
    return { success: true, url: JURNAL_BASE_URL, latency_ms: latency, http_status: healthRes.status, login_ok: loginOk, credentials_configured: !!(JURNAL_USER && JURNAL_PASS) };
  } catch (err) {
    return { success: false, url: JURNAL_BASE_URL, error: err.message, credentials_configured: !!(JURNAL_USER && JURNAL_PASS) };
  }
};

module.exports = { fullSync, syncKelas, syncSiswa, syncGuru, syncMapel, testConnection, loginJurnal };
JURNAL_SERVICE_EOF

echo "✅ jurnalSyncService.js updated"

# 2. Tambah route ke gateway.routes.js (jika belum ada)
if ! grep -q "jurnal/test" backend/src/gateway/gateway.routes.js 2>/dev/null; then
  echo "⚠️  Route /gateway/jurnal/test belum ada di gateway.routes.js"
  echo "   Kamu perlu update manual file backend/src/gateway/gateway.routes.js"
  echo "   Atau jalankan: cp docs/gateway.routes.js.updated backend/src/gateway/gateway.routes.js"
else
  echo "✅ Routes sudah ada"
fi

# 3. Restart backend
echo "🔄 Restarting backend..."
pm2 restart sdms-backend --update-env 2>/dev/null || pm2 restart sdms-backend

echo ""
echo "✅ Update selesai!"
echo ""
echo "📋 Selanjutnya:"
echo "   1. Set JURNAL_SYNC_USER & JURNAL_SYNC_PASS di .env"
echo "   2. Buka Application Hub → cek status koneksi"
echo "   3. Klik 'Sinkron Semua Data'"
