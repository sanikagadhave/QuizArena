// src/services/leaderboard.service.js
// ===================== LEADERBOARD SERVICE =====================
// Owns: leaderboard_entries table. Future standalone microservice - it
// only ever reads a denormalized table it owns, so it never needs to
// join into the Attempt service's tables at query time.
const { v4: uuid } = require('uuid');
const db = require('../config/db');

// Called by the Attempt service right after an attempt is graded.
// Each user keeps only their BEST entry per quiz on the leaderboard.
function syncLeaderboardEntry(attempt) {
  const existingBest = db.prepare(`
    SELECT * FROM leaderboard_entries WHERE user_id = ? AND quiz_id = ?
    ORDER BY score DESC LIMIT 1
  `).get(attempt.user_id, attempt.quiz_id);

  const shouldInsert = !existingBest || attempt.score > existingBest.score;
  if (!shouldInsert) return;

  db.prepare(`
    INSERT INTO leaderboard_entries (id, user_id, quiz_id, attempt_id, score, total_points, time_taken_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuid(), attempt.user_id, attempt.quiz_id, attempt.id, attempt.score, attempt.total_points, attempt.time_taken_seconds);
}

// Per-quiz leaderboard: best score per user, ranked by score desc then
// fastest time as tiebreaker.
function getQuizLeaderboard(quizId, limit = 20) {
  const rows = db.prepare(`
    SELECT le.*, u.name as user_name, u.avatar_color
    FROM leaderboard_entries le
    JOIN users u ON u.id = le.user_id
    WHERE le.quiz_id = ?
    GROUP BY le.user_id
    HAVING le.score = MAX(le.score)
    ORDER BY le.score DESC, le.time_taken_seconds ASC
    LIMIT ?
  `).all(quizId, limit);

  return rows.map((r, idx) => ({
    rank: idx + 1,
    userId: r.user_id,
    userName: r.user_name,
    avatarColor: r.avatar_color,
    score: r.score,
    totalPoints: r.total_points,
    percentage: r.total_points > 0 ? Math.round((r.score / r.total_points) * 100) : 0,
    timeTakenSeconds: r.time_taken_seconds,
  }));
}

// Global leaderboard: aggregate total score across all quizzes per user.
function getGlobalLeaderboard(limit = 20) {
  const rows = db.prepare(`
    SELECT u.id as user_id, u.name as user_name, u.avatar_color,
           SUM(le.score) as total_score,
           COUNT(DISTINCT le.quiz_id) as quizzes_played,
           AVG(le.score * 100.0 / NULLIF(le.total_points,0)) as avg_pct
    FROM leaderboard_entries le
    JOIN users u ON u.id = le.user_id
    GROUP BY u.id
    ORDER BY total_score DESC
    LIMIT ?
  `).all(limit);

  return rows.map((r, idx) => ({
    rank: idx + 1,
    userId: r.user_id,
    userName: r.user_name,
    avatarColor: r.avatar_color,
    totalScore: r.total_score,
    quizzesPlayed: r.quizzes_played,
    avgPct: Math.round(r.avg_pct || 0),
  }));
}

module.exports = { syncLeaderboardEntry, getQuizLeaderboard, getGlobalLeaderboard };
