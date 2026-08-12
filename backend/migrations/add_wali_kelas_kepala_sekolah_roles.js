/**
 * Migration: Tambah role wali_kelas, kepala_sekolah, dan bk
 *
 * Jalankan sekali di VPS:
 *   node backend/migrations/add_wali_kelas_kepala_sekolah_roles.js
 *
 * Aman dijalankan berulang (idempotent).
 *
 * Role ini bisa digunakan sebagai:
 *  - Role UTAMA (primary role di kolom role_id)
 *  - Role TAMBAHAN (extra_roles JSON, contoh guru yang merangkap bk/wali kelas)
 *
 * Saat SSO ke Aplikasi Piket, role dipetakan:
 *  - bk             → BK
 *  - wali_kelas     → WALI_KELAS
 *  - kepala_sekolah → KEPALA_SEKOLAH
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectAllDatabases } = require('../src/config/database');
const { syncModels, Role, Permission, RolePermission } = require('../src/models');
const logger = require('../src/utils/logger');

const NEW_ROLES = [
  {
    name:        'bk',
    label:       'Guru BK',
    description: 'Guru Bimbingan Konseling, akses data siswa, pelanggaran, surat, dan laporan BK',
    permissions: [
      'dashboard:view',
      'piket:access',
      'sholat:access',
      'siswa:view',
      'kelas:view',
      'guru:view',
      'lms:access',
      'jurnal:access',
      'kegiatan:access',
    ],
  },
  {
    name:        'wali_kelas',
    label:       'Wali Kelas',
    description: 'Guru yang merangkap sebagai wali kelas, akses data siswa kelas binaan + fitur piket wali kelas',
    permissions: [
      'dashboard:view',
      'piket:access',
      'sholat:access',
      'siswa:view',
      'kelas:view',
      'guru:view',
      'lms:access',
      'jurnal:access',
    ],
  },
  {
    name:        'kepala_sekolah',
    label:       'Kepala Sekolah',
    description: 'Akses penuh monitoring seluruh data akademik, absensi, dan laporan sekolah',
    permissions: [
      'dashboard:view',
      'dashboard:analytics',
      'piket:access',
      'sholat:access',
      'siswa:view',
      'kelas:view',
      'guru:view',
      'pegawai:view',
      'master:view',
      'lms:access',
      'jurnal:access',
      'kegiatan:access',
      'kelulusan:access',
    ],
  },
];

const run = async () => {
  try {
    await connectAllDatabases();
    await syncModels();

    for (const roleDef of NEW_ROLES) {
      // 1. Buat role jika belum ada
      const [role, created] = await Role.findOrCreate({
        where: { name: roleDef.name },
        defaults: {
          name:        roleDef.name,
          label:       roleDef.label,
          description: roleDef.description,
          is_active:   true,
        },
      });

      if (created) {
        logger.info(`[migration] Role '${roleDef.name}' berhasil dibuat (id: ${role.id})`);
      } else {
        logger.info(`[migration] Role '${roleDef.name}' sudah ada (id: ${role.id}) — skip create`);
      }

      // 2. Assign permissions
      const perms = await Permission.findAll({ where: { name: roleDef.permissions } });
      let added = 0;

      for (const perm of perms) {
        const [, wasCreated] = await RolePermission.findOrCreate({
          where: { role_id: role.id, permission_id: perm.id },
        });
        if (wasCreated) added++;
      }

      logger.info(`[migration] ${added} permission baru ditambahkan ke role '${roleDef.name}'`);
    }

    logger.info('[migration] Selesai — role bk, wali_kelas, dan kepala_sekolah siap digunakan');
    logger.info('[migration] Cara penggunaan:');
    logger.info('  - Role UTAMA   : pilih "Guru BK" / "Wali Kelas" / "Kepala Sekolah" sebagai role utama');
    logger.info('  - Role TAMBAHAN: centang "Tambahan" untuk guru yang merangkap jabatan');
    logger.info('  - SSO Piket    : bk→BK, wali_kelas→WALI_KELAS, kepala_sekolah→KEPALA_SEKOLAH');
    process.exit(0);
  } catch (err) {
    logger.error(`[migration] Gagal: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
  }
};

run();
