const router    = require('express').Router();
const { exec }  = require('child_process');
const path      = require('path');
const fs        = require('fs');
const axios     = require('axios');

const { authenticate }                   = require('../middleware/auth');
const { asyncHandler }                   = require('../middleware/errorHandler');
const { adminOnly }                      = require('../middleware/rbac');
const { success, badRequest, error }     = require('../utils/response');
const { createSSOToken, verifySSOToken, getAppList } = require('../services/ssoService');
const { bulkSync, SYNC_TARGETS }         = require('../services/syncService');
const jurnalSync                         = require('../services/jurnalSyncService');
const logger  = require('../utils/logger');
const config  = require('../config');

// ============================================================
// SSO
// ============================================================

router.get('/sso/token',
  authenticate,
  asyncHandler(async (req, res) => {
    const { app } = req.query;
    if (!app) return badRequest(res, 'Parameter app wajib diisi. Contoh: ?app=lms');
    try {
      const result = createSSOToken(req.user, app.toLowerCase());
      return success(res, result, `SSO token untuk ${app} berhasil dibuat`);
    } catch (err) {
      return badRequest(res, err.message);
    }
  })
);

router.post('/sso/verify',
  asyncHandler(async (req, res) => {
    const { token, app } = req.body;
    if (!token || !app) return badRequest(res, 'token dan app wajib diisi');
    try {
      const decoded = verifySSOToken(token, app.toLowerCase());
      return success(res, {
        valid: true,
        user: {
          id: decoded.sub, username: decoded.username, email: decoded.email,
          full_name: decoded.full_name, role: decoded.role, permissions: decoded.permissions,
        },
      }, 'Token valid');
    } catch {
      return res.status(401).json({ status: 'error', message: 'Token SSO tidak valid atau sudah kadaluarsa', valid: false });
    }
  })
);

// ============================================================
// PROXY
// ============================================================

router.post('/proxy',
  authenticate,
  asyncHandler(async (req, res) => {
    const { app, path: appPath, method = 'GET', data } = req.body;
    if (!app || !appPath) return badRequest(res, 'app dan path wajib diisi');
    const appUrl = config.apps[app.toLowerCase()];
    if (!appUrl) return badRequest(res, `Aplikasi '${app}' tidak dikenal`);
    try {
      const response = await axios({
        method: method.toLowerCase(),
        url: `${appUrl}${appPath}`,
        data: data || undefined,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-SDMS-User-ID': req.user.id,
          'X-SDMS-Username': req.user.username,
          'X-SDMS-Role': req.user.role,
        },
      });
      return res.status(response.status).json(response.data);
    } catch (err) {
      if (err.response) return res.status(err.response.status).json(err.response.data);
      if (err.code === 'ECONNREFUSED') return error(res, `Aplikasi ${app} tidak tersedia`, 503);
      return error(res, `Proxy error: ${err.message}`, 502);
    }
  })
);

// ============================================================
// HEALTH CHECK
// ============================================================

router.get('/health',
  authenticate,
  asyncHandler(async (req, res) => {
    const checks = [];

    // 1. Check hardcoded apps from config
    for (const [name, url] of Object.entries(config.apps)) {
      checks.push((async () => {
        try {
          const start = Date.now();
          // Try /health, /healthz, or just GET / — any response = online
          try {
            await axios.get(`${url}/health`, { timeout: 3000 });
          } catch {
            try {
              await axios.get(`${url}/healthz`, { timeout: 3000 });
            } catch {
              // Just check if the server responds at all
              await axios.get(url, { timeout: 3000, maxRedirects: 0 });
            }
          }
          return { app: name, url, status: 'online', latency_ms: Date.now() - start };
        } catch {
          return { app: name, url, status: 'offline', latency_ms: null };
        }
      })());
    }

    // 2. Check DB-registered apps (webhook targets)
    try {
      const { ApiClient } = require('../models');
      const clients = await ApiClient.findAll({ where: { status: 'active' }, attributes: ['name', 'slug', 'webhook_url'] });
      for (const client of clients) {
        // Skip if already checked via config
        if (config.apps[client.slug]) continue;
        const url = client.webhook_url?.replace(/\/api\/webhooks\/.*$/, '').replace(/\/webhook.*$/, '');
        if (!url) continue;
        checks.push((async () => {
          try {
            const start = Date.now();
            try {
              await axios.get(`${url}/health`, { timeout: 3000 });
            } catch {
              try {
                await axios.get(`${url}/healthz`, { timeout: 3000 });
              } catch {
                await axios.get(url, { timeout: 3000, maxRedirects: 0 });
              }
            }
            return { app: client.slug || client.name, url, status: 'online', latency_ms: Date.now() - start };
          } catch {
            return { app: client.slug || client.name, url, status: 'offline', latency_ms: null };
          }
        })());
      }
    } catch { /* fallback */ }

    const results = await Promise.all(checks);
    return res.json({
      status: 'success', sdms: 'online', integrations: results,
      summary: {
        total: results.length,
        online: results.filter(r => r.status === 'online').length,
        offline: results.filter(r => r.status === 'offline').length,
      },
    });
  })
);

// ============================================================
// SYNC
// ============================================================

router.get('/sync/targets',
  authenticate, adminOnly,
  asyncHandler(async (req, res) => {
    // Gabungkan hardcoded + DB-registered targets
    const hardcoded = SYNC_TARGETS.map(({ name, url, webhookPath, events }) => ({
      name, url, webhookPath, subscribed_events: events, source: 'hardcoded',
    }));

    let dbTargets = [];
    try {
      const { ApiClient } = require('../models');
      const clients = await ApiClient.findAll({ where: { status: 'active' } });
      dbTargets = clients.map(c => ({
        name: c.name, url: c.webhook_url, subscribed_events: c.events,
        total_delivered: c.total_delivered, total_failed: c.total_failed,
        source: 'registered',
      }));
    } catch { /* fallback */ }

    return success(res, [...hardcoded, ...dbTargets]);
  })
);

router.post('/sync/bulk',
  authenticate, adminOnly,
  asyncHandler(async (req, res) => {
    const { target } = req.body;
    bulkSync(target || null).catch(err => logger.error(`Bulk sync error: ${err.message}`));
    return success(res, null, `Bulk sync dimulai${target ? ` untuk ${target}` : ''}`);
  })
);

// POST /api/v1/gateway/sync/test — test kirim 1 event ke target tertentu
router.post('/sync/test',
  authenticate, adminOnly,
  asyncHandler(async (req, res) => {
    const { target, event = 'ping' } = req.body;
    if (!target) return badRequest(res, 'Parameter target wajib diisi (contoh: LMS)');

    const { pushWebhook: _push } = require('../services/syncService');
    const found = SYNC_TARGETS.find(t => t.name.toLowerCase() === target.toLowerCase());
    if (!found) return badRequest(res, `Target '${target}' tidak ditemukan. Tersedia: ${SYNC_TARGETS.map(t => t.name).join(', ')}`);

    const envelope = {
      event,
      payload: { message: 'Test webhook dari SDMS', timestamp: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), source: 'sdms-core', type: 'test' },
    };

    const endpointUrl = `${found.url}${found.webhookPath}`;
    try {
      const axiosLib = require('axios');
      const startMs  = Date.now();
      await axiosLib.post(endpointUrl, envelope, {
        timeout: 15000,   // 15 detik untuk koneksi internal via Caddy/HTTPS
        headers: {
          'Content-Type':   'application/json',
          'X-SDMS-Event':   event,
          'X-SDMS-Secret':  found.secret,
          'X-SDMS-Timestamp': envelope.meta.timestamp,
        },
      });
      return success(res, {
        target: found.name, url: endpointUrl,
        event, latency_ms: Date.now() - startMs,
        status: 'delivered',
      }, `Test webhook berhasil dikirim ke ${found.name}`);
    } catch (err) {
      return success(res, {
        target: found.name, url: endpointUrl,
        event, status: 'failed',
        error: err.message,
      }, `Gagal kirim ke ${found.name}: ${err.message}`);
    }
  })
);

router.get('/apps',
  authenticate,
  asyncHandler(async (req, res) => success(res, getAppList()))
);

// ============================================================
// JURNAL GURU SYNC
// ============================================================

router.get('/jurnal/test',
  authenticate, adminOnly,
  asyncHandler(async (req, res) => {
    const result = await jurnalSync.testConnection();
    return success(res, result, result.success ? 'Koneksi ke Jurnal Guru berhasil' : 'Gagal terhubung ke Jurnal Guru');
  })
);

router.post('/jurnal/sync',
  authenticate, adminOnly,
  asyncHandler(async (req, res) => {
    const { type } = req.body; // 'full', 'kelas', 'siswa', 'guru', 'mapel'

    logger.info(`[JurnalSync] Sync dimulai oleh ${req.user.username} — type: ${type || 'full'}`);

    if (type === 'full' || !type) {
      // Full sync — kirim semua data
      jurnalSync.fullSync()
        .then(result => logger.info('[JurnalSync] Full sync selesai:', JSON.stringify(result.summary)))
        .catch(err => logger.error('[JurnalSync] Full sync gagal:', err.message));
      return success(res, { started: true, type: type || 'full' }, 'Sinkronisasi dimulai — data akan dikirim ke Jurnal Guru');
    }

    // Sync per kategori
    const { Guru, Siswa, Kelas, MataPelajaran } = require('../models');
    let result;

    switch (type) {
      case 'kelas': {
        const data = await Kelas.findAll({ where: { is_active: true } });
        result = await jurnalSync.syncKelas(data.map(k => k.toJSON()));
        break;
      }
      case 'siswa': {
        const data = await Siswa.findAll({ where: { status: 'Aktif' } });
        result = await jurnalSync.syncSiswa(data.map(s => s.toJSON()));
        break;
      }
      case 'guru': {
        const data = await Guru.findAll({ where: { is_active: true } });
        result = await jurnalSync.syncGuru(data.map(g => g.toJSON()));
        break;
      }
      case 'mapel': {
        const data = await MataPelajaran.findAll({ where: { is_active: true } });
        result = await jurnalSync.syncMapel(data.map(m => m.toJSON()));
        break;
      }
      default:
        return badRequest(res, `Type '${type}' tidak dikenal. Gunakan: full, kelas, siswa, guru, mapel`);
    }

    return success(res, result, `Sinkronisasi ${type} selesai`);
  })
);

// ============================================================
// BACKUP DATABASE
// ============================================================

const BACKUP_DIR = path.join(__dirname, '../../../backup/files');

const getSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ status: 'error', message: 'Hanya super admin' });
  }
  next();
};

const findMysqldump = () => {
  const candidates = [
    // XAMPP Windows — path dengan backslash
    'C:\\xampp\\mysql\\bin\\mysqldump.exe',
    'D:\\xampp\\mysql\\bin\\mysqldump.exe',
    'E:\\xampp\\mysql\\bin\\mysqldump.exe',
    // XAMPP dengan forward slash juga dicoba
    'C:/xampp/mysql/bin/mysqldump.exe',
    'D:/xampp/mysql/bin/mysqldump.exe',
    // Laragon
    'C:\\laragon\\bin\\mysql\\mysql-8.0\\bin\\mysqldump.exe',
    'C:\\laragon\\bin\\mysql\\mysql-5.7\\bin\\mysqldump.exe',
    'C:\\laragon\\bin\\mariadb\\mariadb-10.6\\bin\\mysqldump.exe',
    'C:\\laragon\\bin\\mariadb\\mariadb-10.11\\bin\\mysqldump.exe',
    // WampServer
    'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe',
    // Linux/VPS
    '/usr/bin/mysqldump',
    '/usr/local/bin/mysqldump',
    '/opt/lampp/bin/mysqldump',
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        logger.info(`[Backup] mysqldump ditemukan: ${p}`);
        return p;
      }
    } catch { /* skip */ }
  }

  logger.warn('[Backup] mysqldump tidak ditemukan, akan pakai Python fallback');
  return null;
};

// POST /api/v1/gateway/backup — buat backup sekarang
router.post('/backup',
  authenticate, getSuperAdmin,
  asyncHandler(async (req, res) => {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const ts         = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = path.join(BACKUP_DIR, `sdms_${ts}_api.sql`);
    const dbCfg      = config.db.mysql;
    const mysqldump  = findMysqldump();

    let cmd;

    if (mysqldump) {
      // Cara 1: gunakan mysqldump langsung
      const passArg = dbCfg.password ? `--password="${dbCfg.password}"` : '';
      cmd = `"${mysqldump}" --host=${dbCfg.host} --port=${dbCfg.port} --user=${dbCfg.username} ${passArg} --single-transaction --result-file="${backupFile}" ${dbCfg.databases.master}`;
    } else {
      // Cara 2: fallback ke Python script
      const pythonScript = path.join(__dirname, '../../../backup/backup.py');
      if (!fs.existsSync(pythonScript)) {
        return error(res, 'mysqldump tidak ditemukan dan backup.py tidak ada. Install XAMPP atau tambahkan mysqldump ke PATH.', 500);
      }
      cmd = `python "${pythonScript}"`;
    }

    logger.info(`[Backup] Menjalankan: ${mysqldump ? 'mysqldump' : 'Python fallback'}`);

    exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) {
        logger.error(`[Backup] Gagal: ${err.message}`);
        const hint = err.message.includes('not recognized')
          ? ' Pastikan XAMPP MySQL sudah terinstall.'
          : '';
        return res.status(500).json({
          status: 'error',
          message: `Backup gagal: ${err.message}${hint}`,
        });
      }

      // Kalau pakai Python, cari file hasil backup terbaru
      let finalFile = backupFile;
      if (!mysqldump) {
        const files = fs.readdirSync(BACKUP_DIR)
          .filter(f => f.endsWith('.sql'))
          .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
          .sort((a, b) => b.time - a.time);
        if (files.length) finalFile = path.join(BACKUP_DIR, files[0].name);
      }

      if (!fs.existsSync(finalFile)) {
        return res.status(500).json({ status: 'error', message: 'File backup tidak terbentuk' });
      }

      const size   = fs.statSync(finalFile).size;
      const sizeKb = (size / 1024).toFixed(1);

      if (size < 100) {
        return res.status(500).json({ status: 'error', message: 'File backup terlalu kecil — cek koneksi database' });
      }

      logger.info(`[Backup] Berhasil oleh ${req.user.username}: ${path.basename(finalFile)} (${sizeKb} KB)`);
      return success(res, {
        file:       path.basename(finalFile),
        size_kb:    parseFloat(sizeKb),
        created_at: new Date().toISOString(),
      }, `Backup berhasil (${sizeKb} KB)`);
    });
  })
);

// GET /api/v1/gateway/backup/list — daftar file backup
router.get('/backup/list',
  authenticate, getSuperAdmin,
  asyncHandler(async (req, res) => {
    if (!fs.existsSync(BACKUP_DIR)) return success(res, []);

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const fp   = path.join(BACKUP_DIR, f);
        const stat = fs.statSync(fp);
        return {
          file:       f,
          size_kb:    parseFloat((stat.size / 1024).toFixed(1)),
          created_at: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return success(res, files);
  })
);

// DELETE /api/v1/gateway/backup/:filename — hapus file backup
router.delete('/backup/:filename',
  authenticate, getSuperAdmin,
  asyncHandler(async (req, res) => {
    const { filename } = req.params;

    // Cegah path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || !filename.endsWith('.sql')) {
      return badRequest(res, 'Nama file tidak valid');
    }

    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'error', message: 'File tidak ditemukan' });
    }

    fs.unlinkSync(filePath);
    logger.info(`Backup dihapus oleh ${req.user.username}: ${filename}`);
    return success(res, null, 'File backup dihapus');
  })
);

module.exports = router;
