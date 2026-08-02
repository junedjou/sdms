const EventEmitter = require('eventemitter3');
const logger = require('../utils/logger');

/**
 * SDMS Event Bus
 * Pusat distribusi event antar service di dalam proses Node.js.
 * Jika di masa depan perlu distributed (multi-instance), ganti dengan Redis Pub/Sub atau Bull.
 *
 * Naming convention event: '<resource>.<action>'
 * Contoh: 'siswa.created', 'guru.updated', 'siswa.deleted'
 */
class SDMSEventBus extends EventEmitter {
  constructor() {
    super();
    this._setupLogging();
  }

  /**
   * Publish event ke semua subscriber
   * @param {string} event - Nama event
   * @param {object} payload - Data yang dibawa event
   * @param {object} meta - Metadata tambahan (userId, timestamp, dll)
   */
  publish(event, payload, meta = {}) {
    const envelope = {
      event,
      payload,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'sdms-core',
        ...meta,
      },
    };

    logger.debug(`[EventBus] publish: ${event}`);
    this.emit(event, envelope);

    // Emit ke wildcard listener juga (untuk logging/monitoring)
    this.emit('*', envelope);
  }

  /**
   * Subscribe ke satu event
   */
  subscribe(event, handler) {
    this.on(event, handler);
    logger.debug(`[EventBus] subscribe: ${event}`);
  }

  /**
   * Subscribe ke semua event (wildcard)
   */
  subscribeAll(handler) {
    this.on('*', handler);
  }

  /**
   * Unsubscribe
   */
  unsubscribe(event, handler) {
    this.off(event, handler);
  }

  _setupLogging() {
    // Log semua event di mode development
    if (process.env.NODE_ENV === 'development') {
      this.on('*', (envelope) => {
        logger.debug(`[EventBus] event fired: ${envelope.event} @ ${envelope.meta.timestamp}`);
      });
    }
  }
}

// Singleton instance
const eventBus = new SDMSEventBus();

module.exports = eventBus;
