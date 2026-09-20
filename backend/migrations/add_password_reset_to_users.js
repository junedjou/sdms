/**
 * Migration: Tambah kolom password_reset_token dan password_reset_expires ke tabel users
 * Digunakan untuk fitur lupa password (forgot password)
 */
const { masterDB } = require('../src/config/database');

module.exports = {
  async up() {
    const queryInterface = masterDB.getQueryInterface();

    await queryInterface.addColumn('users', 'password_reset_token', {
      type: 'VARCHAR(255)',
      allowNull: true,
      defaultValue: null,
      after: 'password_changed_at',
    });

    await queryInterface.addColumn('users', 'password_reset_expires', {
      type: 'DATETIME',
      allowNull: true,
      defaultValue: null,
      after: 'password_reset_token',
    });

    console.log('✅ Kolom password_reset_token dan password_reset_expires berhasil ditambahkan');
  },

  async down() {
    const queryInterface = masterDB.getQueryInterface();
    await queryInterface.removeColumn('users', 'password_reset_expires');
    await queryInterface.removeColumn('users', 'password_reset_token');
    console.log('✅ Rollback: Kolom password_reset_token dan password_reset_expires berhasil dihapus');
  },
};
