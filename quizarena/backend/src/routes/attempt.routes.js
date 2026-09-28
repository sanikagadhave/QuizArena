// src/routes/attempt.routes.js
const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/attempt.controller');

router.use(authenticate); // every attempt route requires a logged-in student/admin

router.post('/start', [body('quizId').notEmpty()], validate, ctrl.start);
router.post('/:id/submit', ctrl.submit);
router.post('/:id/auto-submit', ctrl.autoSubmit);
router.get('/:id/review', ctrl.review);
router.get('/history', ctrl.history);
router.get('/stats', ctrl.stats);
router.get('/in-progress/:quizId', ctrl.inProgress);

module.exports = router;
