require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectAllDatabases } = require('../src/config/database');
const { syncModels, Role, Permission, RolePermission, User } = require('../src/models');
const { hashPassword } = require('../src/utils/helpers');
const logger = require('../src/utils/logger');

const PERMISSIONS = [
  // Master Data
  { name: 'master:view',           label: 'Lihat Master Data',         group: 'master_data' },
  { name: 'guru:view',             label: 'Lihat Data Guru',           group: 'master_data' },
  { name: 'guru:create',           label: 'Tambah Data Guru',          group: 'master_data' },
  { name: 'guru:update',           label: 'Ubah Data Guru',            group: 'master_data' },
  { name: 'guru:delete',           label: 'Hapus Data Guru',           group: 'master_data' },
  { name: 'siswa:view',            label: 'Lihat Data Siswa',          group: 'master_data' },
  { name: 'siswa:create',          label: 'Tambah Data Siswa',         group: 'master_data' },
  { name: 'siswa:update',          label: 'Ubah Data Siswa',           group: 'master_data' },
  { name: 'siswa:delete',          label: 'Hapus Data Siswa',          group: 'master_data' },
  { name: 'pegawai:view',          label: 'Lihat Data Pegawai',        group: 'master_data' },
  { name: 'pegawai:create',        label: 'Tambah Data Pegawai',       group: 'master_data' },
  { name: 'pegawai:update',        label: 'Ubah Data Pegawai',         group: 'master_data' },
  { name: 'pegawai:delete',        label: 'Hapus Data Pegawai',        group: 'master_data' },
  { name: 'kelas:view',            label: 'Lihat Data Kelas',          group: 'master_data' },
  { name: 'kelas:create',          label: 'Tambah Data Kelas',         group: 'master_data' },
  { name: 'kelas:update',          label: 'Ubah Data Kelas',           group: 'master_data' },
  { name: 'kelas:delete',          label: 'Hapus Data Kelas',          group: 'master_data' },
  { name: 'jurusan:view',          label: 'Lihat Data Jurusan',        group: 'master_data' },
  { name: 'jurusan:create',        label: 'Tambah Data Jurusan',       group: 'master_data' },
  { name: 'jurusan:update',        label: 'Ubah Data Jurusan',         group: 'master_data' },
  { name: 'jurusan:delete',        label: 'Hapus Data Jurusan',        group: 'master_data' },
  { name: 'mapel:view',            label: 'Lihat Data Mapel',          group: 'master_data' },
  { name: 'mapel:create',          label: 'Tambah Data Mapel',         group: 'master_data' },
  { name: 'mapel:update',          label: 'Ubah Data Mapel',           group: 'master_data' },
  { name: 'mapel:delete',          label: 'Hapus Data Mapel',          group: 'master_data' },
  // User Management
  { name: 'user:view',             label: 'Lihat Data User',           group: 'user_management' },
  { name: 'user:create',           label: 'Tambah User',               group: 'user_management' },
  { name: 'user:update',           label: 'Ubah User',                 group: 'user_management' },
  { name: 'user:delete',           label: 'Hapus User',                group: 'user_management' },
  { name: 'role:manage',           label: 'Kelola Role & Permission',  group: 'user_management' },
  // Dashboard
  { name: 'dashboard:view',        label: 'Akses Dashboard',           group: 'dashboard' },
  { name: 'dashboard:analytics',   label: 'Lihat Analitik',            group: 'dashboard' },
  // Modul Aplikasi
  { name: 'lms:access',            label: 'Akses LMS',                 group: 'apps' },
  { name: 'jurnal:access',         label: 'Akses Jurnal Guru',         group: 'apps' },
  { name: 'piket:access',          label: 'Akses Piket',               group: 'apps' },
  { name: 'sholat:access',         label: 'Akses Absensi Sholat',      group: 'apps' },
  { name: 'kegiatan:access',       label: 'Akses Kegiatan Sekolah',    group: 'apps' },
  { name: 'kelulusan:access',      label: 'Akses Kelulusan',           group: 'apps' },
  { name: 'website:access',        label: 'Akses Website Sekolah',     group: 'apps' },
  // Audit
  { name: 'audit:view',            label: 'Lihat Audit Log',           group: 'system' },
];

const ROLES = [
  { name: 'super_admin',     label: 'Super Administrator', description: 'Akses penuh ke seluruh sistem' },
  { name: 'admin',           label: 'Administrator',        description: 'Kelola data master dan user' },
  { name: 'guru',            label: 'Guru',                 description: 'Akses modul pembelajaran dan jurnal' },
  { name: 'wali_kelas',      label: 'Wali Kelas',           description: 'Guru yang merangkap wali kelas, akses data siswa kelas binaan + fitur piket wali kelas' },
  { name: 'kepala_sekolah',  label: 'Kepala Sekolah',       description: 'Akses penuh monitoring seluruh data akademik, absensi, dan laporan sekolah' },
  { name: 'pegawai',         label: 'Pegawai TU',           description: 'Akses data siswa dan administrasi' },
  { name: 'siswa',           label: 'Siswa',                description: 'Akses LMS dan informasi akademik' },
  { name: 'operator',        label: 'Operator',             description: 'Input data absensi dan piket' },
  { name: 'petugas_piket',   label: 'Petugas Piket',        description: 'Akses penuh fitur absensi di Aplikasi Piket' },
];

// Permission per role (selain super_admin yang dapat semua)
const ROLE_PERMISSIONS = {
  admin: [
    'master:view', 'guru:view', 'guru:create', 'guru:update',
    'siswa:view', 'siswa:create', 'siswa:update',
    'pegawai:view', 'pegawai:create', 'pegawai:update',
    'kelas:view', 'kelas:create', 'kelas:update',
    'jurusan:view', 'mapel:view',
    'user:view', 'user:create', 'user:update',
    'dashboard:view', 'dashboard:analytics',
    'lms:access', 'jurnal:access', 'piket:access', 'sholat:access',
    'kegiatan:access', 'kelulusan:access', 'website:access',
  ],
  guru: [
    'dashboard:view', 'lms:access', 'jurnal:access',
    'piket:access', 'sholat:access', 'kegiatan:access',
    'siswa:view', 'kelas:view',
  ],
  pegawai: [
    'dashboard:view', 'siswa:view', 'guru:view', 'kelas:view',
    'piket:access', 'sholat:access', 'kegiatan:access', 'kelulusan:access',
  ],
  siswa: [
    'dashboard:view', 'lms:access',
  ],
  operator: [
    'dashboard:view', 'piket:access', 'sholat:access',
    'siswa:view', 'kelas:view', 'guru:view',
  ],
  petugas_piket: [
    'dashboard:view', 'piket:access', 'sholat:access',
    'siswa:view', 'kelas:view', 'guru:view',
  ],
  wali_kelas: [
    'dashboard:view',
    'piket:access', 'sholat:access',
    'siswa:view', 'kelas:view', 'guru:view',
    'lms:access', 'jurnal:access',
  ],
  kepala_sekolah: [
    'dashboard:view', 'dashboard:analytics',
    'piket:access', 'sholat:access',
    'siswa:view', 'kelas:view', 'guru:view', 'pegawai:view',
    'master:view',
    'lms:access', 'jurnal:access', 'kegiatan:access', 'kelulusan:access',
  ],
};

const runSeed = async () => {
  try {
    logger.info('Menjalankan seed data awal...');

    await connectAllDatabases();
    await syncModels();

    // 1. Seed Permissions
    logger.info('Seeding permissions...');
    for (const perm of PERMISSIONS) {
      await Permission.findOrCreate({ where: { name: perm.name }, defaults: perm });
    }
    logger.info(`${PERMISSIONS.length} permissions selesai`);

    // 2. Seed Roles
    logger.info('Seeding roles...');
    for (const role of ROLES) {
      await Role.findOrCreate({ where: { name: role.name }, defaults: role });
    }
    logger.info(`${ROLES.length} roles selesai`);

    // 3. Assign permissions ke roles
    logger.info('Assigning permissions ke roles...');
    const allPermissions = await Permission.findAll();
    const permMap = Object.fromEntries(allPermissions.map((p) => [p.name, p.id]));

    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) continue;
      for (const permName of permNames) {
        const permId = permMap[permName];
        if (permId) {
          await RolePermission.findOrCreate({
            where: { role_id: role.id, permission_id: permId },
          });
        }
      }
    }

    // Super admin: assign semua permission
    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    if (superAdminRole) {
      for (const perm of allPermissions) {
        await RolePermission.findOrCreate({
          where: { role_id: superAdminRole.id, permission_id: perm.id },
        });
      }
    }
    logger.info('Role permissions selesai');

    // 4. Buat Super Admin user default
    const existingAdmin = await User.unscoped().findOne({ where: { username: 'superadmin' } });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('Admin@SDMS2024!');
      await User.create({
        username: 'superadmin',
        email: 'admin@sekolah.sch.id',
        password: hashedPassword,
        full_name: 'Super Administrator SDMS',
        role_id: superAdminRole.id,
        is_active: true,
      });
      logger.info('Super admin user dibuat: username=superadmin, password=Admin@SDMS2024!');
      logger.warn('PENTING: Ganti password super admin setelah login pertama!');
    } else {
      logger.info('Super admin sudah ada, skip.');
    }

    logger.info('Seed data awal selesai!');
    process.exit(0);
  } catch (err) {
    logger.error(`Seed gagal: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
  }
};

runSeed();
