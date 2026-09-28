// src/services/quiz.service.js
// ===================== QUIZ SERVICE =====================
// Owns: quizzes, questions tables. Future Quiz microservice boundary.
const { v4: uuid } = require('uuid');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');

function questionPublic(q, revealAnswer) {
  const base = {
    id: q.id,
    quizId: q.quiz_id,
    questionText: q.question_text,
    options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
    points: q.points,
    orderIndex: q.order_index,
  };
  if (revealAnswer) base.correctOption = q.correct_option;
  return base;
}

function quizPublic(q, questionCount) {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    category: q.category,
    difficulty: q.difficulty,
    durationMinutes: q.duration_minutes,
    isPublished: !!q.is_published,
    createdBy: q.created_by,
    createdAt: q.created_at,
    updatedAt: q.updated_at,
    questionCount: questionCount ?? undefined,
  };
}

function listQuizzes({ search, category, difficulty, publishedOnly = true }) {
  let sql = `
    SELECT q.*, COUNT(qs.id) as question_count
    FROM quizzes q
    LEFT JOIN questions qs ON qs.quiz_id = q.id
    WHERE 1=1
  `;
  const params = [];

  if (publishedOnly) sql += ' AND q.is_published = 1';
  if (search) {
    sql += ' AND (LOWER(q.title) LIKE ? OR LOWER(q.description) LIKE ?)';
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  if (category) {
    sql += ' AND q.category = ?';
    params.push(category);
  }
  if (difficulty) {
    sql += ' AND q.difficulty = ?';
    params.push(difficulty);
  }

  sql += ' GROUP BY q.id ORDER BY q.created_at DESC';
  const rows = db.prepare(sql).all(...params);
  return rows.map(r => quizPublic(r, r.question_count));
}

function getCategories() {
  return db.prepare('SELECT DISTINCT category FROM quizzes WHERE is_published = 1 ORDER BY category').all().map(r => r.category);
}

function getQuizById(id, { includeAnswers = false } = {}) {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
  if (!quiz) throw new ApiError(404, 'Quiz not found.');
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC').all(id);
  return {
    ...quizPublic(quiz, questions.length),
    questions: questions.map(q => questionPublic(q, includeAnswers)),
  };
}

function createQuiz({ title, description, category, difficulty, durationMinutes, isPublished, questions }, createdBy) {
  const id = uuid();
  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (id, title, description, category, difficulty, duration_minutes, is_published, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, points, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertQuiz.run(id, title, description || '', category, difficulty, durationMinutes, isPublished ? 1 : 0, createdBy);
    (questions || []).forEach((q, idx) => {
      insertQuestion.run(uuid(), id, q.questionText, q.options.a, q.options.b, q.options.c, q.options.d, q.correctOption, q.points || 1, idx);
    });
  });
  tx();

  return getQuizById(id, { includeAnswers: true });
}

function updateQuiz(id, updates) {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
  if (!quiz) throw new ApiError(404, 'Quiz not found.');

  const fields = {
    title: updates.title ?? quiz.title,
    description: updates.description ?? quiz.description,
    category: updates.category ?? quiz.category,
    difficulty: updates.difficulty ?? quiz.difficulty,
    duration_minutes: updates.durationMinutes ?? quiz.duration_minutes,
    is_published: updates.isPublished !== undefined ? (updates.isPublished ? 1 : 0) : quiz.is_published,
  };

  db.prepare(`
    UPDATE quizzes SET title=?, description=?, category=?, difficulty=?, duration_minutes=?, is_published=?, updated_at=datetime('now')
    WHERE id=?
  `).run(fields.title, fields.description, fields.category, fields.difficulty, fields.duration_minutes, fields.is_published, id);

  // Optionally replace the full question set (simplest, most predictable for an admin editor)
  if (Array.isArray(updates.questions)) {
    const delQ = db.prepare('DELETE FROM questions WHERE quiz_id = ?');
    const insertQuestion = db.prepare(`
      INSERT INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, points, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction(() => {
      delQ.run(id);
      updates.questions.forEach((q, idx) => {
        insertQuestion.run(uuid(), id, q.questionText, q.options.a, q.options.b, q.options.c, q.options.d, q.correctOption, q.points || 1, idx);
      });
    });
    tx();
  }

  return getQuizById(id, { includeAnswers: true });
}

function deleteQuiz(id) {
  const result = db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);
  if (result.changes === 0) throw new ApiError(404, 'Quiz not found.');
  return { deleted: true };
}

module.exports = {
  listQuizzes,
  getCategories,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  quizPublic,
  questionPublic,
};
