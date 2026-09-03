#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════
 *  SDMS → Jurnal Guru — Direct MongoDB Sync
 *  Bypass API rate limiting, langsung insert ke database
 * ════════════════════════════════════════════════════════════
 * 
 * Usage: node sync-direct.js <password_admin_jurnal>
 */

const https = require('https');
const http = require('http');

const SDMS_URL = 'https://sdms.smkn1kras.sch.id';
const SDMS_SECRET = 'SDMS_SYNC_SECRET_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jurnal_db';

// ── Helpers ──────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.substring(0, 200))); }
      });
    }).on('error', reject);
  });
}

function log(msg, color) {
  const c = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', reset: '\x1b[0m' };
  console.log((c[color] || '') + msg + c.reset);
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  const adminPass = process.argv[2];
  if (!adminPass) {
    console.error('Usage: node sync-direct.js <password_admin_jurnal>');
    process.exit(1);
  }

  log('═══ SDMS → Jurnal Guru Direct Sync ═══', 'blue');
  log('');

  // 1. Fetch data dari SDMS
  log('📦 Fetching data dari SDMS...', 'blue');
  const sdms = await fetchJSON(`${SDMS_URL}/api/v1/public/sync/data?secret=${SDMS_SECRET}`);
  if (sdms.status !== 'success') throw new Error('Gagal fetch SDMS: ' + sdms.message);
  
  log(`   Guru   : ${sdms.summary.guru}`, 'green');
  log(`   Siswa  : ${sdms.summary.siswa}`, 'green');
  log(`   Kelas  : ${sdms.summary.kelas}`, 'green');
  log(`   Mapel  : ${sdms.summary.mapel}`, 'green');
  log('');

  // 2. Connect MongoDB
  log('🗄️  Connecting ke MongoDB...', 'blue');
  
  // Dynamic import mongoose
  let mongoose;
  try {
    mongoose = require('mongoose');
  } catch (e) {
    log('⚠️  mongoose tidak ditemukan, install dulu: npm install mongoose', 'red');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  log('   ✅ Connected', 'green');

  // 3. Load models dari Jurnal Guru
  const Guru = require('/root/jurnal/models/Guru');
  const Kelas = require('/root/jurnal/models/Kelas');
  const SiswaModel = require('/root/jurnal/models/Siswa');
  
  // Check if MappingMapel exists
  let MappingMapel;
  try {
    MappingMapel = require('/root/jurnal/models/MappingMapel');
  } catch (e) {
    try {
      MappingMapel = require('/root/jurnal/models/Mapel');
    } catch (e2) {
      log('⚠️  Model MappingMapel/Mapel tidak ditemukan, skip mapel sync', 'yellow');
    }
  }

  // ── 4. Sync Kelas ──────────────────────────────────────
  log('🏫 Syncing Kelas...', 'blue');
  let kelasOk = 0, kelasSkip = 0;
  const kelasIdMap = {}; // nama → _id

  // Load existing kelas
  const existingKelas = await Kelas.find({}).lean();
  existingKelas.forEach(k => { kelasIdMap[k.nama] = k._id; });
  log(`   Existing: ${existingKelas.length}`, 'yellow');

  for (const k of sdms.data.kelas) {
    try {
      if (kelasIdMap[k.nama]) {
        kelasSkip++;
        continue;
      }
      const doc = await Kelas.create({
        nama: k.nama,
        tingkat: k.tingkat || '',
        jurusan: k.jurusan || '',
        tahunAjaran: '2026/2027',
        jumlahSiswa: 0
      });
      kelasIdMap[k.nama] = doc._id;
      kelasOk++;
    } catch (e) {
      if (e.code === 11000) {
        // Duplicate - find it
        const existing = await Kelas.findOne({ nama: k.nama }).lean();
        if (existing) kelasIdMap[k.nama] = existing._id;
        kelasSkip++;
      } else {
        log(`   ❌ ${k.nama}: ${e.message}`, 'red');
      }
    }
  }
  log(`   ✅ Kelas: ${kelasOk} baru, ${kelasSkip} skip`, 'green');
  log('');

  // ── 5. Sync Mapel ──────────────────────────────────────
  if (MappingMapel) {
    log('📚 Syncing Mapel...', 'blue');
    let mapelOk = 0, mapelSkip = 0;
    for (const m of sdms.data.mapel) {
      try {
        const exists = await MappingMapel.findOne({ nama: m.nama }).lean();
        if (exists) { mapelSkip++; continue; }
        await MappingMapel.create({ nama: m.nama, kode: m.kode || '' });
        mapelOk++;
      } catch (e) {
        if (e.code === 11000) mapelSkip++;
        else log(`   ❌ ${m.nama}: ${e.message}`, 'red');
      }
    }
    log(`   ✅ Mapel: ${mapelOk} baru, ${mapelSkip} skip`, 'green');
    log('');
  }

  // ── 6. Sync Guru ───────────────────────────────────────
  log('👨‍🏫 Syncing Guru...', 'blue');
  let guruOk = 0, guruSkip = 0, guruFail = 0;
  
  // Load existing guru by username
  const existingGuru = await Guru.find({}).lean();
  const existGuruMap = {};
  existingGuru.forEach(g => { existGuruMap[g.username] = g._id; });
  log(`   Existing: ${existingGuru.length}`, 'yellow');

  for (const g of sdms.data.guru) {
    try {
      // Generate username from NIP or nama
      const username = g.nip ? g.nip.toString() : g.nama.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      
      if (existGuruMap[username]) {
        guruSkip++;
        continue;
      }

      // Guru model needs: username, password, nama
      await Guru.create({
        username: username,
        password: 'guru123', // Default password, will be hashed by pre-save hook
        nama: g.nama || '',
        role: 'guru',
        nip: g.nip || '',
        isWaliKelas: false,
        kelasWali: ''
      });
      existGuruMap[username] = true;
      guruOk++;
    } catch (e) {
      if (e.code === 11000) { guruSkip++; }
      else { guruFail++; log(`   ❌ ${g.nama}: ${e.message}`, 'red'); }
    }
  }
  log(`   ✅ Guru: ${guruOk} baru, ${guruSkip} skip, ${guruFail} gagal`, 'green');
  log('');

  // ── 7. Sync Siswa ──────────────────────────────────────
  log('👩‍🎓 Syncing Siswa...', 'blue');
  log(`   Total dari SDMS: ${sdms.data.siswa.length}`, 'yellow');
  let siswaOk = 0, siswaSkip = 0, siswaFail = 0;

  // Load existing siswa by nisn
  const existingSiswa = await SiswaModel.find({}).select('nisn _id').lean();
  const existSiswaMap = {};
  existingSiswa.forEach(s => { existSiswaMap[s.nisn] = s._id; });
  log(`   Existing di DB: ${existingSiswa.length}`, 'yellow');

  for (let i = 0; i < sdms.data.siswa.length; i++) {
    const s = sdms.data.siswa[i];
    try {
      if (!s.nisn) { siswaSkip++; continue; }
      if (existSiswaMap[s.nisn]) { siswaSkip++; continue; }

      // Find kelasId from kelas name
      let kelasId = null;
      if (s.kelas && kelasIdMap[s.kelas]) {
        kelasId = kelasIdMap[s.kelas];
      }

      await SiswaModel.create({
        nama: s.nama || '',
        nisn: s.nisn,
        nis: s.nis || null,
        kelas: s.kelas || '',
        kelasId: kelasId,
        jenisKelamin: s.jenisKelamin || '',
        tempatLahir: s.tempatLahir || '',
        tanggalLahir: s.tanggalLahir || null,
        alamat: s.alamat || null,
        penerimaBantuan: s.penerimaBantuan || 'Tidak',
        status: 'Aktif',
        guruId: null
      });
      existSiswaMap[s.nisn] = true;
      siswaOk++;
    } catch (e) {
      if (e.code === 11000) { siswaSkip++; }
      else { siswaFail++; if (siswaFail <= 5) log(`   ❌ ${s.nama}: ${e.message}`, 'red'); }
    }

    // Progress setiap 100
    if ((siswaOk + siswaSkip + siswaFail) % 100 === 0) {
      process.stdout.write(`   ... ${siswaOk + siswaSkip + siswaFail}/${sdms.data.siswa.length} processed\r`);
    }
  }
  log('');
  log(`   ✅ Siswa: ${siswaOk} baru, ${siswaSkip} skip, ${siswaFail} gagal`, 'green');

  // ── Summary ────────────────────────────────────────────
  log('');
  log('═══════════════════════════════════════', 'blue');
  log('📊 Ringkasan:', 'blue');
  log(`   Kelas : ${kelasOk} baru, ${kelasSkip} skip`, 'green');
  log(`   Mapel : ${mapelOk || 0} baru`, 'green');
  log(`   Guru  : ${guruOk} baru, ${guruSkip} skip, ${guruFail} gagal`, 'green');
  log(`   Siswa : ${siswaOk} baru, ${siswaSkip} skip, ${siswaFail} gagal`, 'green');
  log('═══════════════════════════════════════', 'blue');
  log('');
  log('✅ Sync selesai! Refresh admin Jurnal Guru untuk lihat hasilnya.', 'green');

  await mongoose.disconnect();
}

main().catch(e => {
  console.error('❌ Fatal error:', e.message);
  process.exit(1);
});
