// src/routes/admin.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/admin.controller');

router.use(authenticate, authorize('admin'));
router.get('/overview', ctrl.overview);

module.exports = router;
