const router = require('express').Router();
const ctrl = require('../controllers/apiHub.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');

// Semua route butuh auth admin
router.use(authenticate);

// ── Clients ─────────────────────────────────────────────────
router.get('/clients',       requirePermission('master:view'),   asyncHandler(ctrl.getClients));
router.get('/events',        requirePermission('master:view'),   asyncHandler(ctrl.getAvailableEvents));
router.get('/clients/:id',   requirePermission('master:view'),   asyncHandler(ctrl.getClientById));
router.post('/clients',      requirePermission('master:update'), asyncHandler(ctrl.createClient));
router.put('/clients/:id',   requirePermission('master:update'), asyncHandler(ctrl.updateClient));
router.delete('/clients/:id', requirePermission('master:update'), asyncHandler(ctrl.deleteClient));

// ── Keys & Test ─────────────────────────────────────────────
router.post('/clients/:id/regenerate-key', requirePermission('master:update'), asyncHandler(ctrl.regenerateKeys));
router.post('/clients/:id/test',           requirePermission('master:update'), asyncHandler(ctrl.testWebhook));

// ── Bulk Sync ───────────────────────────────────────────────
router.post('/bulk-sync', requirePermission('master:update'), asyncHandler(ctrl.bulkSyncClients));

// ── Logs ────────────────────────────────────────────────────
router.get('/logs',        requirePermission('master:view'),   asyncHandler(ctrl.getLogs));
router.delete('/logs',     requirePermission('master:update'), asyncHandler(ctrl.clearLogs));

module.exports = router;
