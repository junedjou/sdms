const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * SDMS SSO (Single Sign-On) Service
 *
 * Flow:
 *   1. User login ke SDMS → dapat access_token SDMS
 *   2. User klik modul (misal LMS)
 *   3. Frontend minta SSO token dari SDMS: GET /gateway/sso/token?app=lms
 *   4. SDMS buat short-lived SSO token (5 menit) + redirect URL
 *   5. Frontend redirect ke: <LMS_URL>/sso/callback?token=<sso_token>
 *   6. LMS verifikasi SSO token via: POST /gateway/sso/verify
 *   7. LMS buat session lokal untuk user tersebut
 *
 * Secret SSO berbeda per aplikasi untuk isolasi keamanan.
 */

// Secret per aplikasi (bisa berbeda-beda untuk isolasi)
const APP_SSO_SECRETS = {
  lms:        process.env.SSO_SECRET_LMS        || 'sso_secret_lms',
  jurnal:     process.env.SSO_SECRET_JURNAL      || 'sso_secret_jurnal',
  piket:      process.env.SSO_SECRET_PIKET       || 'sso_secret_piket',
  sholat:     process.env.SSO_SECRET_SHOLAT      || 'sso_secret_sholat',
  kegiatan:   process.env.SSO_SECRET_KEGIATAN    || 'sso_secret_kegiatan',
  kelulusan:  process.env.SSO_SECRET_KELULUSAN   || 'sso_secret_kelulusan',
  website:    process.env.SSO_SECRET_WEBSITE     || 'sso_secret_website',
};

/**
 * Buat SSO Token untuk redirect ke aplikasi target
 * @param {object} user - Data user dari req.user
 * @param {string} appName - Nama aplikasi target (lms, jurnal, dll)
 * @returns {{ sso_token: string, redirect_url: string }}
 */
const createSSOToken = (user, appName) => {
  const appUrl = config.apps[appName];
  const secret = APP_SSO_SECRETS[appName];

  if (!appUrl || !secret) {
    throw new Error(`Aplikasi '${appName}' tidak dikenal atau belum dikonfigurasi`);
  }

  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    permissions: user.permissions,
    app: appName,
    iss: 'sdms-core',
    aud: appName,
  };

  // Token sangat singkat — 5 menit cukup untuk redirect
  const sso_token = jwt.sign(payload, secret, { expiresIn: '5m' });

  const redirect_url = `${appUrl}/sso/callback?token=${sso_token}&from=sdms`;

  logger.info(`[SSO] Token dibuat untuk user ${user.username} → ${appName}`);

  return { sso_token, redirect_url, app: appName, app_url: appUrl };
};

/**
 * Verifikasi SSO Token (dipanggil oleh aplikasi target via API Gateway)
 * @param {string} token - SSO token dari header/body
 * @param {string} appName - Nama aplikasi yang memverifikasi
 * @returns {object} decoded payload
 */
const verifySSOToken = (token, appName) => {
  const secret = APP_SSO_SECRETS[appName];
  if (!secret) throw new Error(`Aplikasi '${appName}' tidak dikenal`);

  const decoded = jwt.verify(token, secret, { audience: appName, issuer: 'sdms-core' });
  logger.info(`[SSO] Token terverifikasi: user ${decoded.username} → ${appName}`);
  return decoded;
};

/**
 * Daftar aplikasi yang tersedia beserta statusnya
 */
const getAppList = () => {
  return Object.entries(config.apps).map(([key, url]) => ({
    id: key,
    url,
    sso_enabled: !!APP_SSO_SECRETS[key],
  }));
};

module.exports = { createSSOToken, verifySSOToken, getAppList };
