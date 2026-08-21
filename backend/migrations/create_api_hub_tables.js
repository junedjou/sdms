'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ── api_clients ──────────────────────────────────────────
    await queryInterface.createTable('api_clients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      api_key: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      api_secret: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      events: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'error'),
        defaultValue: 'active',
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      error_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_delivered: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_failed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // ── webhook_logs ─────────────────────────────────────────
    await queryInterface.createTable('webhook_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      api_client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'api_clients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'retrying'),
        defaultValue: 'pending',
      },
      http_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      response_body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attempt: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      duration_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Indexes
    await queryInterface.addIndex('webhook_logs', ['api_client_id']);
    await queryInterface.addIndex('webhook_logs', ['event']);
    await queryInterface.addIndex('webhook_logs', ['status']);
    await queryInterface.addIndex('webhook_logs', ['created_at']);
    await queryInterface.addIndex('api_clients', ['api_key']);
    await queryInterface.addIndex('api_clients', ['slug']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('webhook_logs');
    await queryInterface.dropTable('api_clients');
  },
};
