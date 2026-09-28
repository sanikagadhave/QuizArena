// src/controllers/admin.controller.js
// Admin-only aggregate dashboard endpoint - pulls a summary across the
// quiz + attempt domains for the admin dashboard UI.
const db = require('../config/db');

async function overview(req, res, next) {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get().c;
    const totalQuizzes = db.prepare('SELECT COUNT(*) as c FROM quizzes').get().c;
    const totalAttempts = db.prepare("SELECT COUNT(*) as c FROM attempts WHERE status != 'in_progress'").get().c;
    const avgScore = db.prepare(`
      SELECT AVG(score * 100.0 / NULLIF(total_points,0)) as avg
      FROM attempts WHERE status != 'in_progress'
    `).get().avg;

    const recentAttempts = db.prepare(`
      SELECT a.id, u.name as user_name, q.title as quiz_title, a.score, a.total_points, a.submitted_at, a.status
      FROM attempts a
      JOIN users u ON u.id = a.user_id
      JOIN quizzes q ON q.id = a.quiz_id
      WHERE a.status != 'in_progress'
      ORDER BY a.submitted_at DESC
      LIMIT 10
    `).all();

    const quizPopularity = db.prepare(`
      SELECT q.title, COUNT(a.id) as attempt_count
      FROM quizzes q LEFT JOIN attempts a ON a.quiz_id = q.id AND a.status != 'in_progress'
      GROUP BY q.id ORDER BY attempt_count DESC LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalQuizzes,
        totalAttempts,
        avgScorePct: Math.round(avgScore || 0),
        recentAttempts: recentAttempts.map(r => ({
          id: r.id, userName: r.user_name, quizTitle: r.quiz_title,
          score: r.score, totalPoints: r.total_points, submittedAt: r.submitted_at, status: r.status,
        })),
        quizPopularity: quizPopularity.map(q => ({ title: q.title, attempts: q.attempt_count })),
      },
    });
  } catch (err) { next(err); }
}

module.exports = { overview };
