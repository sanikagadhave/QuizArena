// src/routes/leaderboard.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/leaderboard.controller');

router.use(authenticate);
router.get('/global', ctrl.globalLeaderboard);
router.get('/quiz/:quizId', ctrl.quizLeaderboard);

module.exports = router;
