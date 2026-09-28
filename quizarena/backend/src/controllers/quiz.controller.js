// src/controllers/quiz.controller.js
const quizService = require('../services/quiz.service');

async function listQuizzes(req, res, next) {
  try {
    const { search, category, difficulty } = req.query;
    const publishedOnly = req.user?.role !== 'admin';
    const quizzes = quizService.listQuizzes({ search, category, difficulty, publishedOnly });
    res.json({ success: true, data: quizzes });
  } catch (err) { next(err); }
}

async function getCategories(req, res, next) {
  try {
    res.json({ success: true, data: quizService.getCategories() });
  } catch (err) { next(err); }
}

async function getQuiz(req, res, next) {
  try {
    const includeAnswers = req.user?.role === 'admin';
    const quiz = quizService.getQuizById(req.params.id, { includeAnswers });
    res.json({ success: true, data: quiz });
  } catch (err) { next(err); }
}

async function createQuiz(req, res, next) {
  try {
    const quiz = quizService.createQuiz(req.body, req.user.id);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { next(err); }
}

async function updateQuiz(req, res, next) {
  try {
    const quiz = quizService.updateQuiz(req.params.id, req.body);
    res.json({ success: true, data: quiz });
  } catch (err) { next(err); }
}

async function deleteQuiz(req, res, next) {
  try {
    const result = quizService.deleteQuiz(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { listQuizzes, getCategories, getQuiz, createQuiz, updateQuiz, deleteQuiz };
