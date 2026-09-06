'use strict';

const path = require('path');
const fs   = require('fs');
const { AppSetting } = require('../models');
const { success, badRequest } = require('../utils/response');
const { writeAuditLog }       = require('../middleware/auditLog');
const logger = require('../utils/logger');

// ── Default settings ─────────────────────────────────────────
const DEFAULTS = [
  // Branding
  { key: 'app_name',         value: 'SDMS',                                  label: 'Nama Aplikasi',          group: 'branding', type: 'text' },
  { key: 'app_subtitle',     value: 'School Data Management System',         label: 'Sub-judul Aplikasi',      group: 'branding', type: 'text' },
  { key: 'school_name',      value: 'SMK Negeri 1 Kras',                     label: 'Nama Sekolah',            group: 'branding', type: 'text' },
  { key: 'logo_url',         value: '',                                       label: 'URL Logo (kosong=icon)',  group: 'branding', type: 'image' },

  // Sidebar
  { key: 'sidebar_bg',       value: '#0f172a',                               label: 'Warna Background Sidebar', group: 'sidebar',  type: 'color' },
  { key: 'sidebar_accent',   value: '#6366f1',                               label: 'Warna Aksen/Active Sidebar', group: 'sidebar', type: 'color' },
  { key: 'sidebar_text',     value: 'rgba(255,255,255,0.7)',                  label: 'Warna Teks Sidebar',      group: 'sidebar',  type: 'color' },

  // Login panel
  { key: 'login_bg_from',    value: '#0f172a',                               label: 'Warna Background Awal (gradient)', group: 'login', type: 'color' },
  { key: 'login_bg_mid',     value: '#1e1b4b',                               label: 'Warna Background Tengah', group: 'login',    type: 'color' },
  { key: 'login_bg_to',      value: '#0c0a1e',                               label: 'Warna Background Akhir',  group: 'login',    type: 'color' },
  { key: 'login_headline',   value: 'Satu Data.',                            label: 'Headline Baris 1',        group: 'login',    type: 'text' },
  { key: 'login_headline2',  value: 'Satu Sistem.',                          label: 'Headline Baris 2',        group: 'login',    type: 'text' },
  { key: 'login_description', value: 'Kelola seluruh data akademik sekolah dalam satu platform terintegrasi.', label: 'Deskripsi', group: 'login', type: 'textarea' },
  { key: 'login_badge',      value: 'Platform Terpadu',                     label: 'Teks Badge',              group: 'login',    type: 'text' },
];

// ── Pastikan semua default setting ada di DB ─────────────────
const seedDefaults = async () => {
  for (const def of DEFAULTS) {
    await AppSetting.findOrCreate({
      where: { key: def.key },
      defaults: def,
    });
  }
};

// ── GET /api/v1/settings ─────────────────────────────────────
// Publik (tanpa auth) agar frontend bisa load saat startup
const getSettings = async (req, res) => {
  await seedDefaults();
  const rows = await AppSetting.findAll({ order: [['group', 'ASC'], ['id', 'ASC']] });

  // Kembalikan sebagai flat object { key: value } untuk kemudahan frontend
  const flat = {};
  rows.forEach(r => { flat[r.key] = r.value; });

  return success(res, { settings: flat, items: rows });
};

// ── PUT /api/v1/settings ──────────────────────────────────────
const updateSettings = async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return badRequest(res, 'settings harus berupa object { key: value }');
  }

  const updated = [];
  for (const [key, value] of Object.entries(settings)) {
    const row = await AppSetting.findOne({ where: { key } });
    if (!row) continue; // abaikan key tidak dikenal
    await row.update({ value: value ?? '' });
    updated.push(key);
  }

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'settings',
    description: `Settings diperbarui: ${updated.join(', ')}`,
  });

  logger.info(`[Settings] Diperbarui oleh ${req.user.username}: ${updated.join(', ')}`);

  // Kembalikan settings terbaru
  const rows = await AppSetting.findAll({ order: [['group', 'ASC'], ['id', 'ASC']] });
  const flat = {};
  rows.forEach(r => { flat[r.key] = r.value; });

  return success(res, { settings: flat }, 'Pengaturan berhasil disimpan');
};

// ── POST /api/v1/settings/logo ────────────────────────────────
// Upload logo — simpan sebagai base64 di DB (simple, no extra storage)
const uploadLogo = async (req, res) => {
  if (!req.file) return badRequest(res, 'File logo wajib diupload');

  const { mimetype, buffer } = req.file;
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!allowed.includes(mimetype)) {
    return badRequest(res, 'Format logo harus PNG, JPG, SVG, atau WebP');
  }
  if (buffer.length > 500 * 1024) {
    return badRequest(res, 'Ukuran logo maksimal 500KB');
  }

  // Simpan sebagai data URL base64
  const base64 = `data:${mimetype};base64,${buffer.toString('base64')}`;
  await AppSetting.update({ value: base64 }, { where: { key: 'logo_url' } });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'settings',
    description: 'Logo aplikasi diperbarui',
  });

  return success(res, { logo_url: base64 }, 'Logo berhasil diupload');
};

// ── DELETE /api/v1/settings/logo ─────────────────────────────
const deleteLogo = async (req, res) => {
  await AppSetting.update({ value: '' }, { where: { key: 'logo_url' } });
  return success(res, null, 'Logo dihapus, kembali ke icon default');
};

module.exports = { getSettings, updateSettings, uploadLogo, deleteLogo, seedDefaults };

// ── App Hub Config ────────────────────────────────────────────
// Konfigurasi visibility dan maintenance per aplikasi di App Hub.
// Disimpan sebagai JSON di AppSetting key='app_hub_config'.

const APP_HUB_KEY = 'app_hub_config';

// Default config — semua app visible untuk semua role
const DEFAULT_APP_HUB = [
  { id: 'lms',       visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah','pegawai','siswa'], is_maintenance: false },
  { id: 'jurnal',    visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah'], is_maintenance: false },
  { id: 'piket',     visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah','petugas_piket'], is_maintenance: false },
  { id: 'absen',     visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah','petugas_piket','siswa'], is_maintenance: false },
  { id: 'sholat',    visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah','siswa'], is_maintenance: false },
  { id: 'kegiatan',  visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah','pegawai','siswa'], is_maintenance: false },
  { id: 'kelulusan', visible_roles: ['super_admin','admin','guru','wali_kelas','kepala_sekolah'], is_maintenance: false },
  { id: 'website',   visible_roles: ['super_admin','admin','guru','pegawai','siswa'], is_maintenance: false },
];

// GET /api/v1/settings/app-hub — publik, semua role bisa akses
const getAppHubConfig = async (req, res) => {
  let row = await AppSetting.findOne({ where: { key: APP_HUB_KEY } });
  if (!row) {
    // Seed default
    row = await AppSetting.create({
      key: APP_HUB_KEY,
      value: JSON.stringify(DEFAULT_APP_HUB),
      label: 'Konfigurasi App Hub',
      group: 'app_hub',
      type: 'text',
    });
  }
  let config;
  try { config = JSON.parse(row.value); } catch { config = DEFAULT_APP_HUB; }

  // Jika user login, filter hanya app yang visible untuk role-nya
  if (req.user) {
    const userRoles = [req.user.role, ...(req.user.extra_roles || [])];
    const isSuperOrAdmin = ['super_admin', 'admin'].includes(req.user.role);
    // Admin/super_admin lihat semua app + info lengkap
    if (isSuperOrAdmin) {
      return success(res, { config, is_admin: true });
    }
    // Role lain: filter hanya yang boleh dilihat
    const filtered = config.filter(app =>
      app.visible_roles.some(r => userRoles.includes(r))
    );
    return success(res, { config: filtered, is_admin: false });
  }

  return success(res, { config, is_admin: false });
};

// PUT /api/v1/settings/app-hub — hanya super_admin/admin
const updateAppHubConfig = async (req, res) => {
  const { config } = req.body;
  if (!Array.isArray(config)) return badRequest(res, 'config harus berupa array');

  // Validasi struktur
  for (const item of config) {
    if (!item.id || !Array.isArray(item.visible_roles)) {
      return badRequest(res, 'Setiap item harus punya id dan visible_roles[]');
    }
  }

  const [row] = await AppSetting.findOrCreate({
    where: { key: APP_HUB_KEY },
    defaults: { key: APP_HUB_KEY, value: '[]', label: 'Konfigurasi App Hub', group: 'app_hub', type: 'text' },
  });
  await row.update({ value: JSON.stringify(config) });

  await writeAuditLog({
    userId: req.user.id, username: req.user.username,
    action: 'UPDATE', resource: 'settings',
    description: 'Konfigurasi App Hub diperbarui',
  });

  logger.info(`[Settings] App Hub config diperbarui oleh ${req.user.username}`);
  return success(res, { config }, 'Konfigurasi App Hub berhasil disimpan');
};

module.exports = { getSettings, updateSettings, uploadLogo, deleteLogo, seedDefaults, getAppHubConfig, updateAppHubConfig };
