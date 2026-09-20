/**
 * Email Service — kirim email transaksional via SMTP (nodemailer)
 *
 * Konfigurasi SMTP dibaca dari config/index.js → env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_FROM_NAME
 *
 * Jika SMTP_USER kosong (belum dikonfigurasi), email dicetak ke log saja
 * supaya development tetap bisa berjalan tanpa konfigurasi email.
 */

const nodemailer = require('nodemailer');
const config     = require('../config');
const logger     = require('../utils/logger');

// ── Buat transporter (lazy, dibuat sekali) ───────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!config.smtp.user) {
    // Mode dev: gunakan ethereal / log only
    logger.warn('[emailService] SMTP_USER belum dikonfigurasi. Email akan dicetak ke log saja.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host:   config.smtp.host,
    port:   config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    tls: {
      rejectUnauthorized: false, // toleran untuk self-signed cert
    },
  });

  return _transporter;
}

// ── Template HTML email reset password ───────────────────────
function buildResetPasswordHtml({ appName, schoolName, fullName, resetUrl, expireMinutes }) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header biru -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${appName}</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">${schoolName}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:700;">Reset Password Akun Anda</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                Halo <strong style="color:#1e293b;">${fullName}</strong>,<br/>
                Kami menerima permintaan reset password untuk akun Anda.
                Klik tombol di bawah untuk membuat password baru.
              </p>

              <!-- Tombol -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:4px 0 28px;">
                    <a href="${resetUrl}" target="_blank"
                      style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info kadaluarsa -->
              <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#854d0e;font-size:13px;">
                  ⏳ Link ini hanya berlaku selama <strong>${expireMinutes} menit</strong>.
                  Setelah itu Anda harus meminta ulang.
                </p>
              </div>

              <!-- Link teks fallback -->
              <p style="margin:0 0 8px;color:#64748b;font-size:12px;">Jika tombol tidak berfungsi, copy dan paste link berikut di browser:</p>
              <p style="margin:0 0 28px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#2563eb;font-size:12px;text-decoration:none;">${resetUrl}</a>
              </p>

              <!-- Peringatan -->
              <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:14px 18px;">
                <p style="margin:0;color:#991b1b;font-size:13px;">
                  🔒 Jika Anda tidak merasa meminta reset password, abaikan email ini.
                  Password Anda tidak akan berubah.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                &copy; ${new Date().getFullYear()} ${appName} &mdash; ${schoolName}
              </p>
              <p style="margin:4px 0 0;color:#cbd5e1;font-size:10px;">
                Email ini dikirim secara otomatis. Jangan membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Fungsi kirim email reset password ────────────────────────
/**
 * @param {object} opts
 * @param {string} opts.to          - Alamat email tujuan
 * @param {string} opts.fullName    - Nama lengkap penerima
 * @param {string} opts.resetUrl    - URL reset password (frontend)
 * @param {number} [opts.expireMinutes=60] - Kadaluarsa link (menit)
 */
async function sendResetPasswordEmail({ to, fullName, resetUrl, expireMinutes = 60 }) {
  const appName    = config.app.name;
  const schoolName = config.smtp.fromName !== config.app.name ? config.smtp.fromName : appName;
  const fromLabel  = `"${config.smtp.fromName}" <${config.smtp.from}>`;

  const html = buildResetPasswordHtml({ appName, schoolName, fullName, resetUrl, expireMinutes });
  const text = [
    `Halo ${fullName},`,
    '',
    `Kami menerima permintaan reset password untuk akun Anda.`,
    `Klik link berikut untuk membuat password baru (berlaku ${expireMinutes} menit):`,
    '',
    resetUrl,
    '',
    `Jika Anda tidak meminta reset password, abaikan email ini.`,
    '',
    `Salam,`,
    `Tim ${appName}`,
  ].join('\n');

  const transporter = getTransporter();

  if (!transporter) {
    // Dev mode: cetak ke log
    logger.info(`[emailService] (DEV) Reset password email untuk ${to}:`);
    logger.info(`[emailService] Reset URL: ${resetUrl}`);
    return { dev: true, to, resetUrl };
  }

  const info = await transporter.sendMail({
    from:    fromLabel,
    to,
    subject: `[${appName}] Reset Password Akun Anda`,
    text,
    html,
  });

  logger.info(`[emailService] Email reset password terkirim ke ${to} — messageId: ${info.messageId}`);
  return info;
}

module.exports = { sendResetPasswordEmail };
