// src/routes/quiz.routes.js
const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/quiz.controller');

// Public listing (works with or without auth; optionalAuth applied in app.js)
router.get('/', ctrl.listQuizzes);
router.get('/categories', ctrl.getCategories);
router.get('/:id', ctrl.getQuiz);

const quizValidators = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium or Hard.'),
  body('durationMinutes').isInt({ min: 1, max: 180 }).withMessage('Duration must be between 1 and 180 minutes.'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required.'),
];

router.post('/', authenticate, authorize('admin'), quizValidators, validate, ctrl.createQuiz);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateQuiz);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteQuiz);

module.exports = router;
