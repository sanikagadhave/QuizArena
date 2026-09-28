// src/controllers/attempt.controller.js
const attemptService = require('../services/attempt.service');

async function start(req, res, next) {
  try {
    const result = attemptService.startAttempt(req.user.id, req.body.quizId);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function submit(req, res, next) {
  try {
    const { answers } = req.body;
    const result = attemptService.gradeAndSubmit(req.params.id, req.user.id, answers || [], { auto: false });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function autoSubmit(req, res, next) {
  try {
    const { answers } = req.body;
    const result = attemptService.gradeAndSubmit(req.params.id, req.user.id, answers || [], { auto: true });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function review(req, res, next) {
  try {
    const result = attemptService.getAttemptReview(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function history(req, res, next) {
  try {
    res.json({ success: true, data: attemptService.getUserHistory(req.user.id) });
  } catch (err) { next(err); }
}

async function stats(req, res, next) {
  try {
    res.json({ success: true, data: attemptService.getUserStats(req.user.id) });
  } catch (err) { next(err); }
}

async function inProgress(req, res, next) {
  try {
    const attempt = attemptService.getInProgressAttempt(req.user.id, req.params.quizId);
    res.json({ success: true, data: attempt ? attemptService.attemptPublic(attempt) : null });
  } catch (err) { next(err); }
}

module.exports = { start, submit, autoSubmit, review, history, stats, inProgress };
