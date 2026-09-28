// src/controllers/leaderboard.controller.js
const leaderboardService = require('../services/leaderboard.service');

async function quizLeaderboard(req, res, next) {
  try {
    const data = leaderboardService.getQuizLeaderboard(req.params.quizId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function globalLeaderboard(req, res, next) {
  try {
    const data = leaderboardService.getGlobalLeaderboard();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { quizLeaderboard, globalLeaderboard };
