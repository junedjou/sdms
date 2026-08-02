const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');
const { requirePermission, adminOnly } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/stats',    requirePermission('dashboard:view'), asyncHandler(ctrl.getStats));
router.get('/agenda',   requirePermission('dashboard:view'), asyncHandler(ctrl.getAgenda));
router.get('/summary',  requirePermission('dashboard:view'), asyncHandler(ctrl.getSummary));
router.get('/app-hub',  requirePermission('dashboard:view'), asyncHandler(ctrl.getAppHub));
router.get('/audit-log', requirePermission('audit:view'),   asyncHandler(ctrl.getAuditLog));

module.exports = router;
