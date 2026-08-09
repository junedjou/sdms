/**
 * Migration: tambah kolom extra_roles ke tabel users
 * Jalankan: node migrations/add_extra_roles_to_users.js
 */
require('dotenv').config();
const { masterDB } = require('../src/config/database');

async function run() {
  const qi = masterDB.getQueryInterface();
  const { DataTypes } = require('sequelize');

  try {
    await qi.addColumn('users', 'extra_roles', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Role tambahan untuk user yang merangkap jabatan, contoh: ["wali_kelas","bk"]',
    });
    console.log('✓ Kolom extra_roles berhasil ditambahkan ke tabel users');
  } catch (err) {
    if (err.message.includes('Duplicate column')) {
      console.log('⚠ Kolom extra_roles sudah ada, skip');
    } else {
      throw err;
    }
  }

  await masterDB.close();
  process.exit(0);
}

run().catch(err => { console.error('✗ Error:', err.message); process.exit(1); });
