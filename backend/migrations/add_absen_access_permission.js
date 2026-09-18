/**
 * Migration: Tambah permission absen:access dan assign ke role siswa, guru, wali_kelas, bk, dll.
 *
 * Jalankan: node backend/migrations/add_absen_access_permission.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectAllDatabases } = require('../src/config/database');
const { syncModels, Role, Permission, RolePermission } = require('../src/models');
const logger = require('../src/utils/logger');

// Role yang perlu mendapat permission absen:access
const ROLES_WITH_ABSEN = [
  'siswa',
  'guru',
  'wali_kelas',
  'bk',
  'kepala_sekolah',
  'admin',
  'pegawai',
  'operator',
  'petugas_piket',
];

const run = async () => {
  try {
    await connectAllDatabases();
    await syncModels();

    // 1. Buat permission jika belum ada
    const [perm, created] = await Permission.findOrCreate({
      where: { name: 'absen:access' },
      defaults: { name: 'absen:access', label: 'Akses Absensi Siswa', group: 'apps' },
    });

    if (created) {
      logger.info('Permission absen:access berhasil dibuat');
    } else {
      logger.info('Permission absen:access sudah ada, lanjut assign ke roles');
    }

    // 2. Assign ke roles yang ditentukan
    let assigned = 0;
    for (const roleName of ROLES_WITH_ABSEN) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        logger.warn(`Role '${roleName}' tidak ditemukan, dilewati`);
        continue;
      }

      const [, wasCreated] = await RolePermission.findOrCreate({
        where: { role_id: role.id, permission_id: perm.id },
      });

      if (wasCreated) {
        logger.info(`  ✓ absen:access → ${roleName}`);
        assigned++;
      } else {
        logger.info(`  - absen:access sudah ada di ${roleName}`);
      }
    }

    // 3. Super admin sudah dapat semua permission otomatis via seed,
    //    tapi assign juga sekarang untuk jaga-jaga
    const superAdmin = await Role.findOne({ where: { name: 'super_admin' } });
    if (superAdmin) {
      const [, wasCreated] = await RolePermission.findOrCreate({
        where: { role_id: superAdmin.id, permission_id: perm.id },
      });
      if (wasCreated) {
        logger.info('  ✓ absen:access → super_admin');
        assigned++;
      }
    }

    logger.info(`\nMigration selesai. ${assigned} role diperbarui.`);
    process.exit(0);
  } catch (err) {
    logger.error(`Migration gagal: ${err.message}`);
    process.exit(1);
  }
};

run();
