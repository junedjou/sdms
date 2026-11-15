'use strict';

/**
 * Seed: Daftarkan Jurnal Guru sebagai ApiClient di SDMS
 *
 * Jalankan: node backend/seed-jurnal-client.js
 *
 * Script ini mendaftarkan Jurnal sebagai target webhook SDMS sehingga
 * setiap perubahan guru/siswa/kelas di SDMS langsung di-push ke Jurnal
 * secara real-time tanpa menunggu polling 10 menit.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { masterDB } = require('./src/config/database');
const ApiClient    = require('./src/models/ApiClient');

async function seedJurnalClient() {
  try {
    await masterDB.authenticate();
    console.log('✅ Database terhubung');

    const JURNAL_URL    = (process.env.JURNAL_URL || 'https://jurnal.smkn1kras.sch.id').replace(/\/$/, '');
    const SDMS_SECRET   = process.env.SYNC_SECRET || 'SDMS_SYNC_SECRET_2026';
    const WEBHOOK_URL   = `${JURNAL_URL}/api/webhooks/sdms`;
    const SLUG          = 'jurnal-guru';

    // Cek apakah sudah terdaftar
    const existing = await ApiClient.findOne({ where: { slug: SLUG } });

    if (existing) {
      // Update URL dan secret agar tetap sinkron
      await existing.update({
        webhook_url: WEBHOOK_URL,
        api_secret:  SDMS_SECRET,
        status:      'active',
        events:      ['guru.created', 'guru.updated', 'guru.deleted',
                      'siswa.created', 'siswa.updated', 'siswa.deleted',
                      'kelas.created', 'kelas.updated', 'kelas.deleted',
                      'bulk.sync'],
      });
      console.log(`✅ ApiClient "${SLUG}" sudah ada — diupdate.`);
      console.log(`   Webhook URL : ${WEBHOOK_URL}`);
    } else {
      const client = await ApiClient.create({
        name:        'Jurnal Guru',
        slug:        SLUG,
        description: 'E-Journal Guru Digital — menerima push data guru/siswa/kelas dari SDMS',
        webhook_url: WEBHOOK_URL,
        api_secret:  SDMS_SECRET,   // pakai SDMS_SYNC_SECRET yang sama dengan Jurnal
        events:      ['guru.created', 'guru.updated', 'guru.deleted',
                      'siswa.created', 'siswa.updated', 'siswa.deleted',
                      'kelas.created', 'kelas.updated', 'kelas.deleted',
                      'bulk.sync'],
        status:      'active',
      });
      console.log(`✅ ApiClient "${SLUG}" berhasil didaftarkan.`);
      console.log(`   Webhook URL : ${WEBHOOK_URL}`);
      console.log(`   API Key     : ${client.api_key}`);
      console.log(`   API Secret  : ${client.api_secret}`);
    }

    console.log('\n📋 Langkah selanjutnya:');
    console.log('   1. Pastikan JURNAL_URL di .env SDMS sudah benar:');
    console.log(`      JURNAL_URL=${JURNAL_URL}`);
    console.log('   2. Restart SDMS: pm2 restart sdms-backend');
    console.log('   3. Test webhook dari SDMS dengan edit salah satu data guru/siswa/kelas');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedJurnalClient();
