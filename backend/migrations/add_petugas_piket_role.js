/**
 * Migration: Tambah role petugas_piket
 *
 * Jalankan sekali di VPS:
 *   node backend/migrations/add_petugas_piket_role.js
 *
 * Aman dijalankan berulang (idempotent — tidak duplikat jika role sudah ada).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectAllDatabases } = require('../src/config/database');
const { syncModels, Role, Permission, RolePermission } = require('../src/models');
const logger = require('../src/utils/logger');

const run = async () => {
  try {
    await connectAllDatabases();
    await syncModels();

    // 1. Buat role petugas_piket jika belum ada
    const [role, created] = await Role.findOrCreate({
      where: { name: 'petugas_piket' },
      defaults: {
        name:        'petugas_piket',
        label:       'Petugas Piket',
        description: 'Akses penuh fitur absensi di Aplikasi Piket',
        is_active:   true,
      },
    });

    if (created) {
      logger.info(`[migration] Role 'petugas_piket' berhasil dibuat (id: ${role.id})`);
    } else {
      logger.info(`[migration] Role 'petugas_piket' sudah ada (id: ${role.id}) — skip create`);
    }

    // 2. Assign permissions yang dibutuhkan
    const NEEDED_PERMISSIONS = [
      'dashboard:view',
      'piket:access',
      'sholat:access',
      'siswa:view',
      'kelas:view',
      'guru:view',
    ];

    const perms = await Permission.findAll({ where: { name: NEEDED_PERMISSIONS } });
    let added = 0;

    for (const perm of perms) {
      const [, wasCreated] = await RolePermission.findOrCreate({
        where: { role_id: role.id, permission_id: perm.id },
      });
      if (wasCreated) added++;
    }

    logger.info(`[migration] ${added} permission baru ditambahkan ke role 'petugas_piket'`);
    logger.info('[migration] Selesai — role petugas_piket siap digunakan');
    process.exit(0);
  } catch (err) {
    logger.error(`[migration] Gagal: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
  }
};

run();
