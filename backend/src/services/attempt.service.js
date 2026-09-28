// src/services/attempt.service.js
// ============== ATTEMPT / SCORING SERVICE ==============
// Owns: attempts, attempt_answers tables. Future standalone microservice.
// Talks to the Quiz service's data only to read question/answer keys
// (via direct query here since we're a monolith today; in a real split
// this would be an internal API call to the Quiz service instead).
const { v4: uuid } = require('uuid');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const { syncLeaderboardEntry } = require('./leaderboard.service');

function attemptPublic(a) {
  return {
    id: a.id,
    userId: a.user_id,
    quizId: a.quiz_id,
    startedAt: a.started_at,
    submittedAt: a.submitted_at,
    status: a.status,
    score: a.score,
    totalPoints: a.total_points,
    correctCount: a.correct_count,
    totalQuestions: a.total_questions,
    timeTakenSeconds: a.time_taken_seconds,
  };
}

// Start a new attempt: snapshots question count/points so grading is stable
// even if the quiz is edited mid-attempt.
function startAttempt(userId, quizId) {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
  if (!quiz) throw new ApiError(404, 'Quiz not found.');

  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quizId);
  if (questions.length === 0) throw new ApiError(400, 'This quiz has no questions yet.');

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const id = uuid();

  db.prepare(`
    INSERT INTO attempts (id, user_id, quiz_id, total_points, total_questions)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, quizId, totalPoints, questions.length);

  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(id);
  return {
    attempt: attemptPublic(attempt),
    quiz: {
      id: quiz.id,
      title: quiz.title,
      durationMinutes: quiz.duration_minutes,
    },
    // Questions WITHOUT correct answers - this is what the student sees
    questions: questions
      .sort((a, b) => a.order_index - b.order_index)
      .map(q => ({
        id: q.id,
        questionText: q.question_text,
        options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
        points: q.points,
        orderIndex: q.order_index,
      })),
  };
}

// Core scoring logic - shared by manual submit and auto-submit-on-timeout.
function gradeAndSubmit(attemptId, userId, answers, { auto = false } = {}) {
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId);
  if (!attempt) throw new ApiError(404, 'Attempt not found.');
  if (attempt.user_id !== userId) throw new ApiError(403, 'This attempt does not belong to you.');
  if (attempt.status !== 'in_progress') {
    throw new ApiError(400, 'This attempt has already been submitted.');
  }

  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(attempt.quiz_id);
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(attempt.quiz_id);
  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Server-side timer enforcement: if wall-clock time since start exceeds
  // the allotted duration (+ small grace), force auto-submit regardless of
  // what the client claims.
  const startedAtMs = new Date(attempt.started_at + 'Z').getTime();
  const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);
  const allowedSeconds = quiz.duration_minutes * 60 + 15; // 15s grace for network latency
  const timedOut = elapsedSeconds > allowedSeconds;

  let score = 0;
  let correctCount = 0;

  const insertAnswer = db.prepare(`
    INSERT INTO attempt_answers (id, attempt_id, question_id, selected_option, is_correct)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const q of questions) {
      const submitted = answers.find(a => a.questionId === q.id);
      const selected = submitted ? submitted.selectedOption : null;
      const isCorrect = selected != null && selected === q.correct_option;
      if (isCorrect) {
        score += q.points;
        correctCount += 1;
      }
      insertAnswer.run(uuid(), attemptId, q.id, selected || null, isCorrect ? 1 : 0);
    }

    const finalStatus = (auto || timedOut) ? 'auto_submitted' : 'submitted';
    const timeTaken = Math.min(elapsedSeconds, quiz.duration_minutes * 60);

    db.prepare(`
      UPDATE attempts
      SET status = ?, score = ?, correct_count = ?, submitted_at = datetime('now'), time_taken_seconds = ?
      WHERE id = ?
    `).run(finalStatus, score, correctCount, timeTaken, attemptId);
  });
  tx();

  const updated = db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId);

  // Push into the leaderboard domain (kept in sync on every submit)
  syncLeaderboardEntry(updated);

  return attemptPublic(updated);
}

function getAttemptReview(attemptId, userId) {
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId);
  if (!attempt) throw new ApiError(404, 'Attempt not found.');
  if (attempt.user_id !== userId) throw new ApiError(403, 'This attempt does not belong to you.');
  if (attempt.status === 'in_progress') throw new ApiError(400, 'This attempt has not been submitted yet.');

  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(attempt.quiz_id);
  const answers = db.prepare(`
    SELECT aa.*, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.points, q.order_index
    FROM attempt_answers aa
    JOIN questions q ON q.id = aa.question_id
    WHERE aa.attempt_id = ?
    ORDER BY q.order_index ASC
  `).all(attemptId);

  return {
    attempt: attemptPublic(attempt),
    quiz: { id: quiz.id, title: quiz.title, category: quiz.category, difficulty: quiz.difficulty },
    review: answers.map(a => ({
      questionId: a.question_id,
      questionText: a.question_text,
      options: { a: a.option_a, b: a.option_b, c: a.option_c, d: a.option_d },
      correctOption: a.correct_option,
      selectedOption: a.selected_option,
      isCorrect: !!a.is_correct,
      points: a.points,
    })),
  };
}

function getUserHistory(userId) {
  const rows = db.prepare(`
    SELECT a.*, q.title as quiz_title, q.category, q.difficulty
    FROM attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    WHERE a.user_id = ? AND a.status != 'in_progress'
    ORDER BY a.submitted_at DESC
  `).all(userId);

  return rows.map(r => ({
    ...attemptPublic(r),
    quizTitle: r.quiz_title,
    category: r.category,
    difficulty: r.difficulty,
    percentage: r.total_points > 0 ? Math.round((r.score / r.total_points) * 100) : 0,
  }));
}

function getUserStats(userId) {
  const attempts = db.prepare(`
    SELECT * FROM attempts WHERE user_id = ? AND status != 'in_progress'
  `).all(userId);

  const totalAttempts = attempts.length;
  const avgScorePct = totalAttempts === 0 ? 0 : Math.round(
    attempts.reduce((s, a) => s + (a.total_points > 0 ? (a.score / a.total_points) * 100 : 0), 0) / totalAttempts
  );
  const totalCorrect = attempts.reduce((s, a) => s + a.correct_count, 0);
  const totalQuestions = attempts.reduce((s, a) => s + a.total_questions, 0);
  const bestScorePct = totalAttempts === 0 ? 0 : Math.max(
    ...attempts.map(a => (a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0))
  );

  const categoryBreakdown = db.prepare(`
    SELECT q.category, COUNT(*) as attempts, AVG(CASE WHEN a.total_points > 0 THEN (a.score * 100.0 / a.total_points) ELSE 0 END) as avg_pct
    FROM attempts a JOIN quizzes q ON q.id = a.quiz_id
    WHERE a.user_id = ? AND a.status != 'in_progress'
    GROUP BY q.category
  `).all(userId);

  return {
    totalAttempts,
    avgScorePct,
    bestScorePct,
    totalCorrect,
    totalQuestions,
    accuracyPct: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    categoryBreakdown: categoryBreakdown.map(c => ({
      category: c.category,
      attempts: c.attempts,
      avgPct: Math.round(c.avg_pct),
    })),
  };
}

function getInProgressAttempt(userId, quizId) {
  return db.prepare(`
    SELECT * FROM attempts WHERE user_id = ? AND quiz_id = ? AND status = 'in_progress'
    ORDER BY started_at DESC LIMIT 1
  `).get(userId, quizId);
}

module.exports = {
  startAttempt,
  gradeAndSubmit,
  getAttemptReview,
  getUserHistory,
  getUserStats,
  getInProgressAttempt,
  attemptPublic,
};
