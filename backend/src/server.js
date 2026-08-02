require('dotenv').config();
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectAllDatabases } = require('./config/database');

const PORT = config.app.port;

const startServer = async () => {
  try {
    logger.info('====================================================');
    logger.info(`  ${config.app.name} - School Data Management System`);
    logger.info(`  Visi: One Login • One Data • One Dashboard`);
    logger.info('====================================================');

    // Koneksikan semua database
    await connectAllDatabases();

    // Sync model Master DB (alter: true — aman untuk dev)
    const { syncModels } = require('./models');
    await syncModels();

    // Inisialisasi Data Synchronization Service
    const { initSyncService } = require('./services/syncService');
    initSyncService();

    // Jalankan server
    app.listen(PORT, () => {
      logger.info(`Server berjalan di port ${PORT} [${config.app.env}]`);
      logger.info(`API Base URL: ${config.app.url}/api/v1`);
    });
  } catch (err) {
    logger.error(`Gagal menjalankan server: ${err.message}`);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();
